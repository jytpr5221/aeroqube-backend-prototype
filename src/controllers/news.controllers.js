import { News } from "../models/news.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import fs from "fs";

// News API base URL
const NEWS_API_URL = 'http://localhost:5000';

// Helper function to check if the API is available
export const checkApiAvailability = async () => {
  try {
    const response = await axios.get(`${NEWS_API_URL}/test`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('News API not available:', error.message);
    return false;
  }
};

// Get all news with translations and audio
export const getAllNews = asyncHandler(async (req, res) => {


  if(req.user.role !== 'admin')
    throw new ApiError(403,'you are not authorized to perform this !')

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
  if (!data) {
    throw new ApiError(500, "Invalid news data format from external source");
  }
    fs.writeFileSync('./extracted-news/news.json', JSON.stringify(data, null, 2), 'utf-8');

    return res.status(200).json(new ApiResponse(200, data, "News fetched successfully from external source"));
});

// Process news (extract, translate, generate TTS)
export const processNews = asyncHandler(async (req, res) => {
  try {
    // Check if API is available
    const isApiAvailable = await checkApiAvailability();
    
    if (!isApiAvailable) {
      throw new ApiError(503, "News API service is currently unavailable");
    }
    
    // Start the news processing pipeline
    const response = await axios.post(`${NEWS_API_URL}/extract`, {}, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return res.status(200).json(new ApiResponse(200, response.data, "News processing started successfully"));
  } catch (error) {
    console.error('Error processing news:', error);
    throw new ApiError(500, error.message || "Failed to process news");
  }
});

// Get API status
export const getApiStatus = asyncHandler(async (req, res) => {
  if(req.user.role !== 'admin')
    throw new ApiError(403,'you are not authorized to perform this !')

  const response = await axios.get(`${NEWS_API_URL}/status`, { timeout: 5000 });
  if (!response || !response.data) {
    throw new ApiError(500, "No response from external source");
  }

  return res.status(200).json(new ApiResponse(200, response.data, "API status retrieved successfully"));

});

// Get supported languages
export const getSupportedLanguages = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(`${NEWS_API_URL}/languages`, { timeout: 5000 });
    return res.status(200).json(new ApiResponse(200, response.data, "Supported languages retrieved successfully"));
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    throw new ApiError(500, error.message || "Failed to fetch supported languages");
  }
});

// export const extractNews = asyncHandler(async (req, res) => {
//   try {
//     // First check if the API is available
//     const testResponse = await axios.get('http://localhost:5000/test', { 
//       timeout: 5000,
//       headers: { 'Accept': 'application/json' }
//     }).catch(err => {
//       console.error("Error checking API availability:", err.message);
//       return null;
//     });
    
//     if (!testResponse) {
//       throw new ApiError(503, "News API service is currently unavailable");
//     }
    
//     // If API is available, proceed with the actual request
//     const response = await axios.get('http://localhost:5000/news', { 
//       timeout: 30000, // Increased timeout for larger responses
//       headers: { 'Accept': 'application/json' }
//     });

//     const data = response.data;
//     console.log('DATA extracted successfully');
    
//     if (!data) {
//       throw new ApiError(500, "Invalid news data format from external source");
//     }

//     const dir = './extracted-news';
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }
    
//     fs.writeFileSync('./extracted-news/news.json', JSON.stringify(data, null, 2), 'utf-8');

//     return res.status(200).json(new ApiResponse(200, data, "News fetched successfully from external source"));
//   } catch (error) {
//     console.error('Error extracting news:', error);
//     throw new ApiError(500, error.message || "Failed to extract news");
//   }
// });

export const addNewsToDatabase = asyncHandler(async (req, res) => {
  // if(req.user.role !== 'admin')
  //   throw new ApiError(403,'you are not authorized to perform this !')

  const newsArray = JSON.parse(fs.readFileSync('./extracted-news/news.json', 'utf-8'))

  if (!newsArray || !Array.isArray(newsArray)) {
    throw new ApiError(500, "Invalid news data format from external source");
  }

  // console.log('NEWSDATA',newsArray)
  const news = await News.insertMany(newsArray);

  // console.log('NEWSDATA',news)
  if (!news) {
    throw new ApiError(500, "Failed to insert news into the database");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, news, "News inserted successfully into the database"));
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

export const updateNews = asyncHandler(async (req, res) => {
  // if(req.user.role !== "admin") {
  //   throw new ApiError(403, "You are not authorized to perform this action");
  // }

  const {id} = req.params

  const allowedFields = ["headline", "summary", "tags", 'category']

  const newsData = {};

  for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
          newsData[key] = req.body[key];
      }
  }

  const updatedNews = await News.findByIdAndUpdate(id, newsData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are enforced
  });

  if (!updatedNews) {
      throw new ApiError(404, "News item not found");
  }

  return res
      .status(200)
      .json(new ApiResponse(200, updatedNews, "News item updated successfully"));
});

export const deleteNews = asyncHandler(async (req, res) => {
  if(req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

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
});