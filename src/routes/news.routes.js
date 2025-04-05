import { Router } from "express";
import { 
  addNewsToDatabase,
  getAllNews, 
  getPublishedNews, 
  toggleStatus, 
  updateNews,
  processNews,
  getApiStatus,
  getSupportedLanguages,
  deleteNews,
  getNewsFromDatabase
} from "../controllers/news.controllers.js";

const router = Router();

// Existing routes

router.post("/add", addNewsToDatabase);
router.get('/all-news', getAllNews);
router.patch('/toggle-status/:id', toggleStatus);
router.get('/published-news', getPublishedNews);
router.put('/update-news/:id', updateNews);
router.delete('/delete-news/:id', deleteNews);
router.get('/get-news', getNewsFromDatabase);

// New routes for Flask API integration
router.get('/api-status', getApiStatus);
router.get('/languages', getSupportedLanguages);
router.post('/process', processNews);

export default router;