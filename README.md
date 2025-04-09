# News API Backend

This project is a backend service for managing news articles. It provides endpoints to fetch, process, and manage news data, including translation and text-to-speech functionalities.

## Project Structure

- **src/controllers**: Contains the logic for handling requests and interacting with the database.
- **src/routes**: Defines the API endpoints and maps them to the corresponding controller functions.
- **src/models**: Contains the data models for the application.
- **src/utils**: Utility functions used across the application.
- **src/middlewares**: Middleware functions for request processing.
- **src/connections**: Handles database connections.

## API Endpoints

### POST /add
- **Description**: Adds news articles to the database from a local JSON file.
- **Parameters**: None
- **Response**: 
  - `200 OK`: News articles inserted successfully.
  - `404 Not Found`: News file not found.
  - `500 Internal Server Error`: Failed to insert news into the database.

### GET /all-news
- **Description**: Fetches all news articles with translations and audio.
- **Parameters**: None
- **Response**: 
  - `200 OK`: News fetched successfully.
  - `503 Service Unavailable`: News API service is unavailable.

### PATCH /toggle-status/:id
- **Description**: Toggles the status of a news article between "published" and "pending".
- **Parameters**: 
  - `id` (path parameter): The ID of the news article.
- **Response**: 
  - `200 OK`: News status updated successfully.
  - `404 Not Found`: News item not found.

### GET /published-news
- **Description**: Fetches all published news articles.
- **Parameters**: None
- **Response**: 
  - `200 OK`: News fetched successfully.
  - `404 Not Found`: No news found.

### PUT /update-news/:id
- **Description**: Updates specific fields of a news article.
- **Parameters**: 
  - `id` (path parameter): The ID of the news article.
  - Request body: JSON object with fields `headline`, `summary`, `tags`.
- **Response**: 
  - `200 OK`: News item updated successfully.
  - `400 Bad Request`: No valid fields provided for update.
  - `404 Not Found`: News item not found.

### DELETE /delete-news/:id
- **Description**: Deletes a news article.
- **Parameters**: 
  - `id` (path parameter): The ID of the news article.
- **Response**: 
  - `200 OK`: News item deleted successfully.
  - `404 Not Found`: News item not found.

### GET /get-news
- **Description**: Fetches all news articles from the database.
- **Parameters**: None
- **Response**: 
  - `200 OK`: News fetched successfully.
  - `404 Not Found`: No news found.

### GET /api-status
- **Description**: Checks the status of the external News API.
- **Parameters**: None
- **Response**: 
  - `200 OK`: API status retrieved successfully.
  - `503 Service Unavailable`: News API service is unavailable.

### GET /languages
- **Description**: Retrieves supported languages for translation.
- **Parameters**: None
- **Response**: 
  - `200 OK`: Supported languages retrieved successfully.
  - `503 Service Unavailable`: News API service is unavailable.

### POST /process
- **Description**: Initiates the process of extracting, translating, and generating TTS for news articles.
- **Parameters**: None
- **Response**: 
  - `200 OK`: News processing started successfully.
  - `503 Service Unavailable`: News API service is unavailable.

## Setup and Installation

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Start the server using `npm start`.

## Dependencies

- Express
- Mongoose
- Axios
- Other dependencies as specified in `package.json`.

## License

This project is licensed under the MIT License.
