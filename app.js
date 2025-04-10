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

function formatDate(date) {
  const pad = (n) => n.toString().padStart(2, '0');

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // Months are 0-based
  const year = date.getFullYear();

  return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
}

// Middleware to log with formatted timestamp
app.use((req, res, next) => {
  const start = new Date();

  res.on('finish', () => {
    const timestamp = formatDate(start);
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });

  next();
});

// Example routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/error', (req, res) => {
  res.status(500).send('Internal Server Error');
});

app.get('/notfound', (req, res) => {
  res.status(404).send('Not Found');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
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
