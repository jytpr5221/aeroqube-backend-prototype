import { News } from "../models/news.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import fs from "fs";

// News API base URL
const NEWS_API_URL = 'https://aeroqube-news-app-services.onrender.com';

// Helper function to check if the API is available
export const checkApiAvailability = async () => {
  try {
    const response = await axios.get(`${NEWS_API_URL}/test`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('News API not available::', error.message);
    return false;
  }
};

// Get all news with translations and audio
export const getAllNews = asyncHandler(async (req, res) => {


  // if(req.user.role !== 'admin')
  //   throw new ApiError(403,'you are not authorized to perform this !')


  const apiAvailable = await checkApiAvailability();
  if (!apiAvailable) {
    throw new ApiError(503, "News API service is currently unavailable");
  }

  const processingResponse = await axios.get(`${NEWS_API_URL}/status`, { timeout: 5000 });
  if (processingResponse.data.processing === true) {
    return res.status(200).json(new ApiResponse(200, null, "News extraction is already in progress"));
  }

  const response = await axios.get(`${NEWS_API_URL}/news`, {
    timeout: 10000,
    headers: {
      'Accept': 'application/json'
    }
  });

  if(!response || !response.data) {
    throw new ApiError(500, "No response from external source");
  }

  const data = response.data;

  console.log('DATA', data);

  if(data.articles && data.articles.length === 0) {
    return res.status(200).json(new ApiResponse(200, data, "No news found "));
  }

  if (!data) {
    throw new ApiError(500, "Invalid news data format from external source");
  }
    fs.writeFileSync('./extracted-news/news.json', JSON.stringify(data, null, 2), 'utf-8');

    return res.status(200).json(new ApiResponse(200, data, "News fetched successfully from external source"));
});

// Process news (extract, translate, generate TTS)
export const processNews = asyncHandler(async (req, res) => {

  // if(!req.user || req.user.role !== 'admin')
  //   throw new ApiError(403,'you are not authorized to perform this !')


  const isApiAvailable = await checkApiAvailability();
  
  if (!isApiAvailable) {
    throw new ApiError(503, "News API service is currently unavailable");
  }

  const response = await axios.get(`${NEWS_API_URL}/status`, {
    timeout: 5000}   )

    // console.log('RESPONSE', response.data)

    if(response.data.processing === true) {
      return res.status(200).json(new ApiResponse(200, null, "News extraction is already in progress"));
    }

    const newResponse = await axios.post(`${NEWS_API_URL}/extract`, {}, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });   

    if(!newResponse || !newResponse.data) {
      throw new ApiError(500, "No response from external source");
    }

    
    return res.status(200).json(new ApiResponse(200, newResponse.data, "News processing started successfully"));
});

// Get API status
export const getApiStatus = asyncHandler(async (req, res) => {
  // if(req.user.role !== 'admin')
  //   throw new ApiError(403,'you are not authorized to perform this !')

  const apiAvailable = await checkApiAvailability();
  if (!apiAvailable) {  
    throw new ApiError(503, "News API service is currently unavailable");
  }


  const response = await axios.get(`${NEWS_API_URL}/status`, { timeout: 5000 });
  if (!response || !response.data) {
    throw new ApiError(500, "No response from external source");
  }

  return res.status(200).json(new ApiResponse(200, response.data, "API status retrieved successfully"));

});

// Get supported languages
export const getSupportedLanguages = asyncHandler(async (req, res) => {

  // if(req.user.role !== 'admin')
  //   throw new ApiError(403,'you are not authorized to perform this !')
  
  const apiAvailable = await checkApiAvailability();
  if (!apiAvailable) {

    throw new ApiError(503, "News API service is currently unavailable");
  }

  const response = await axios.get(`${NEWS_API_URL}/languages`, { timeout: 5000 });
  if (!response || !response.data) {
    throw new ApiError(500, "No response from external source");
  }

  return res.status(200).json(new ApiResponse(200, response.data, "Supported languages retrieved successfully"));
});

export const addNewsToDatabase = asyncHandler(async (req, res) => {
  // if(req.user.role !== 'admin')
  //   throw new ApiError(403,'you are not authorized to perform this !')

  const apiAvailable = await checkApiAvailability();
  if (!apiAvailable) {
    throw new ApiError(503, "News API service is currently unavailable");
  }

  const processingResponse = await axios.get(`${NEWS_API_URL}/status`, { timeout: 5000 });
  
  // Check if news.json file exists
  const newsFilePath = './extracted-news/news.json';
  if (!fs.existsSync(newsFilePath)) {
    throw new ApiError(404, "News file not found. Please extract news first.");
  }
 
  let newsData;
  try {
    newsData = JSON.parse(fs.readFileSync(newsFilePath, 'utf-8'));
  } catch (error) {
    throw new ApiError(500, "Error reading news file: " + error.message);
  }

  if (!newsData || !newsData.articles || !Array.isArray(newsData.articles)) {
    throw new ApiError(500, "Invalid news data format from external source");
  }

  if (newsData.articles.length === 0 && processingResponse.data.processing === true) {
    throw new ApiError(500, "Extracting news is still in progress, please try again later"); 
  }

  if (newsData.articles.length === 0) {
    throw new ApiError(404, "No news found in the extracted file");
  }

  const newsArticles = newsData.articles.map(article => ({
    appwrite_audio_url: article.appwrite_audio_url || null,
    article_id: article.article_id,
    author: article.author || "Unknown Author",
    category: article.category,
    content: article.content,
    date: article.date,
    headline: article.headline,
    images: article.images || [],
    language: article.language,
    main_image: article.main_image || null,
    source: article.source,
    summary: article.summary,
    tags: article.tags || [],
    time: article.time,
    translations: article.translations || {},
    tts_file_path: article.tts_file_path || null,
    url: article.url,
  }));

  const insertResult = await News.insertMany(newsArticles, { ordered: false })
    .catch(error => {
      if (error.code === 11000) {
        console.log("Some articles already exist in database - skipping duplicates");
        return error.insertedDocs; // Return the documents that were successfully inserted
      }
      throw error;
    });

  if (!insertResult || insertResult.length === 0) {
    throw new ApiError(500, "Failed to insert news into the database");
  }

  fs.unlinkSync('./extracted-news/news.json', (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      console.log('File deleted successfully');
    }
  } );
  return res
    .status(200)
    .json(new ApiResponse(
      200, 
      {
        insertedCount: insertResult.length,
        articles: insertResult
      }, 
      "News articles inserted successfully into the database"
    ));
});

export const toggleStatus = asyncHandler(async (req, res) => {
  // if (req.user.role !== "admin") {
  //   throw new ApiError(403, "You are not authorized to perform this action");
  // }
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "ID required");
  }

  const newsItem = await News.findById(id);

  if (!newsItem) {
    throw new ApiError(404, "News item not found");
  }

  const newStatus = newsItem.status === "published" ? "pending" : "published";

  const updatedNewsItem = await News.findByIdAndUpdate(
    id,
    { status: newStatus },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedNewsItem, "News status updated successfully"));
});

export const getPublishedNews = asyncHandler(async (req, res) => {
  // if(!req.user)
  //   throw new ApiError(403,'Please login or verify to get the news')

  const news = await News.find({ status: "published" });
  if (!news) {
    throw new ApiError(404, "No news found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, news, "News fetched successfully"));
});

export const getNewsFromDatabase = asyncHandler(async (req, res) => {
  // if(!req.user)
  //   throw new ApiError(403,'Please login or verify to get the news')

  const news = await News.find({}).select(' -content');
  if (!news) {
    throw new ApiError(404, "No news found");
  }
  return res

    .status(200)
    .json(new ApiResponse(200, news, "News fetched successfully"));
});

export const updateNews = asyncHandler(async (req, res) => {
  // if(req.user.role !== "admin") {
  //   throw new ApiError(403, "You are not authorized to perform this action");
  // }

  const {id} = req.params

  if(!id) {
    throw new ApiError(400, "ID is required");
  }

  const allowedFields = ["headline", "summary", "tags"]
  const requestedFields = Object.keys(req.body)

  // Check if any non-allowed field is being attempted to be updated
  const nonAllowedFields = requestedFields.filter(field => !allowedFields.includes(field))
  if (nonAllowedFields.length > 0) {
    throw new ApiError(400, `Cannot update the field.`);
  }

  const newsData = {};

  for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
          newsData[key] = req.body[key];
      }
  }

  if (Object.keys(newsData).length === 0) {
      throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedNews = await News.findByIdAndUpdate(id, newsData, {
      new: true,
      runValidators: true,
  });

  if (!updatedNews) {
      throw new ApiError(404, "News item not found");
  }

  return res
      .status(200)
      .json(new ApiResponse(200, updatedNews, "News item updated successfully"));
});

export const deleteNews = asyncHandler(async (req, res) => {
  // if(req.user.role !== "admin") {
  //   throw new ApiError(403, "You are not authorized to perform this action");
  // }

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "ID is required");
  }

  const deletedNews = await News.findByIdAndDelete(id);

  if (!deletedNews) {
    throw new ApiError(404, "News item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedNews, "News item deleted successfully"));
})

