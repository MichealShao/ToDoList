# Local Development Guide

This guide provides instructions for setting up and running the ToDoList application in a local development environment.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with:
   - A valid MongoDB URI (local or cloud)
   - A secure random JWT secret string

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on http://localhost:5001

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (if not already present) with:
   ```
   REACT_APP_API_URL=http://localhost:5001
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

   The application will be available at http://localhost:3000

## Testing the Application

1. Open your browser and navigate to http://localhost:3000
2. Register a new account or use the application
3. The backend API will be available at http://localhost:5001

## Troubleshooting

- If you encounter CORS issues, ensure the backend server is running and the CORS configuration includes 'http://localhost:3000'
- For database connection issues, verify your MongoDB connection string in the .env file
- JWT issues may be related to the JWT_SECRET value in your .env file
