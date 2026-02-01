# Node.js/Express Backend for Portfolio Site

This backend serves static files, provides API endpoints for portfolio data, and supports image uploads.

## Features
- Serves static files from the Site folder
- API to get and update data/portfolio-data.json
- API to upload images to the root folder
- CORS enabled for local development
- Ready for integration with the current front-end

## Getting Started

1. Install dependencies:
   npm install

2. Start the server:
   npm start

3. The server will run on http://localhost:3000 by default.

## API Endpoints

- `GET /api/portfolio` - Get portfolio data
- `POST /api/portfolio` - Update portfolio data (JSON body)
- `POST /api/upload` - Upload image (multipart/form-data)

## Notes
- Uploaded images are saved in the root folder.
- For production, secure the API endpoints as needed.
