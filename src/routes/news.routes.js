import { Router } from "express";
import {  addNewsToDatabase, extractNews, getAllNews, getPublishedNews, toggleStatus, updateNews } from "../controllers/news.controllers.js";
import { upload } from "../middlewares/multer-upload.js";

const router = Router();

router.post("/add", addNewsToDatabase);
router.get('/extract',extractNews)
router.get('/all-news',getAllNews)
router.patch('/toggle-status/:id',toggleStatus)
router.get('/published-news',getPublishedNews)
router.put('/update-news/:id',updateNews)

export default router;