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

app.use((req, res, next) => {
  const start = new Date();
  res.on('finish', () => {
    const end = new Date();
    const timestamp = start.toISOString();
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
