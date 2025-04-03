import { News } from "../models/news.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// import { uploadFileToAppwrite } from "../utils/appwrite-upload.js";
import fs from "fs";

export const extractNews = asyncHandler(async (req, res) => {

   const response= await fetch('http://localhost:5000/latest')

   if(!response.ok) {
    throw new ApiError(500, "Failed to fetch news from external source"); 
    }
   const data = await response.json()
    if (!data || !Array.isArray(data)) {
      throw new ApiError(500, "Invalid news data format from external source"); 
    }

    fs.writeFileSync('./extracted-news/news.json', JSON.stringify(data, null, 2), 'utf-8')
    return res.status(200).json(new ApiResponse(200, data, "News fetched successfully from external source"));


})

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
})

export const getAllNews = asyncHandler(async (req, res) => {

  // if (req.user.role !== "admin") {
  //   throw new ApiError(403, "You are not authorized to perform this action");
  // }

  const news = await News.find({}).select('-content ');
  if (!news) {
    throw new ApiError(404, "No news found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, news, "News fetched successfully"));
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
} );

export const updateNews = asyncHandler(async (req, res) => {

  // if(req.user.role !== "admin") {
  //   throw new ApiError(403, "You are not authorized to perform this action");
  // }

  const {id} = req.params

  const allowedFields = ["headline", "summary", "tags"
    ,'category']
  
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
})

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

// export const 