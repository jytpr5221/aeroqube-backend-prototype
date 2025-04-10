import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './src/middlewares/errorHandler.js';
import newsRouter from './src/routes/news.routes.js';
const app = express();


dotenv.config({
    path:'./.env',
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function formatToIST(date) {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const istDate = new Date(date.getTime() + istOffset);

  const pad = (n) => n.toString().padStart(2, '0');

  const hours = pad(istDate.getHours());
  const minutes = pad(istDate.getMinutes());
  const seconds = pad(istDate.getSeconds());
  const day = pad(istDate.getDate());
  const month = pad(istDate.getMonth() + 1);
  const year = istDate.getFullYear();

  return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
}

// Middleware to log requests with IST timestamp
app.use((req, res, next) => {
  const start = new Date();

  res.on('finish', () => {
    const timestamp = formatToIST(start);
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });

  next();
});

app.get('/', (req, res) => {
   return res.send('Hello from server !');
}
);

app.get('/aeroqube/v0/api', (req, res) => {
  return  res.send( 'Welcome to Aeroqube API');
});

app.use('/aeroqube/v0/api/news', newsRouter);

app.use(errorHandler)
export default app;
