# Local Development Guide

This guide provides instructions for setting up and running the ToDoList application in a local development environment.

## Prerequisites

- Node.js (v14 or later)
- npm
- MongoDB (Detailed installation instructions below)

## Node.js and npm Installation Guide

### Windows Installation
1. Download the Node.js installer from [Node.js website](https://nodejs.org/)
2. Choose the LTS (Long Term Support) version recommended for most users
3. Run the installer and follow the installation wizard
4. npm will be installed automatically with Node.js
5. Verify installation by opening Command Prompt and running:
   ```bash
   node --version
   npm --version
   ```

### macOS Installation
1. Install using Homebrew:
   ```bash
   brew install node
   ```
2. Or download the macOS installer from [Node.js website](https://nodejs.org/)
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Linux (Ubuntu/Debian) Installation
1. Install using apt:
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```
2. For the latest version, use NodeSource repository:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

## MongoDB Installation Guide

### Windows Installation
1. Download MongoDB Community Edition installer from [MongoDB website](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. You can opt to install MongoDB Compass (graphical UI tool)
4. After completion, the MongoDB service should start automatically

### macOS Installation
1. Install using Homebrew:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```
2. Start MongoDB service:
   ```bash
   brew services start mongodb-community
   ```

### Linux (Ubuntu) Installation
1. Import MongoDB public key:
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   ```
2. Create list file for MongoDB:
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   ```
3. Update local package database:
   ```bash
   sudo apt-get update
   ```
4. Install MongoDB:
   ```bash
   sudo apt-get install -y mongodb-org
   ```
5. Start MongoDB:
   ```bash
   sudo systemctl start mongod
   ```
   
### Verify MongoDB Installation
Run in terminal or command prompt:
```bash
mongo --version
# or
mongod --version
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file in the backend root directory:
   ```bash
   touch .env
   ```

3. Add the following content to the `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/todoapp
   PORT=5001
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```
   
   **Important notes:**
   - `MONGODB_URI`: MongoDB connection string, can be local or cloud database address
   - `JWT_SECRET`: Replace with your own random string for JWT token encryption
   - Ensure MongoDB service is running, otherwise the application won't connect to the database

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

3. Create a `.env.local` file (if not already present):
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
2. Register a new account or log in with an existing account
3. The backend API will be available at http://localhost:5001

## Troubleshooting

- If you encounter CORS issues, ensure the backend server is running and the CORS configuration includes 'http://localhost:3000'
- For database connection issues, verify your MongoDB connection string in the .env file
- JWT issues may be related to the JWT_SECRET value in your .env file
- Ensure MongoDB service is running, check using:
  - Windows: Check the "MongoDB" service status in Services Manager
  - macOS: Use `brew services list` to check mongodb-community service status
  - Linux: Use `sudo systemctl status mongod` to check service status

# Demo
todo-backend-mocha-iota.vercel.app

