import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import junkyardRoutes from './routes/junkyardRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes first
app.use('/api/junkyards', junkyardRoutes);

// API health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Try MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/junkyard-map';
console.log('Attempting to connect to MongoDB at:', MONGODB_URI);

// Start the server immediately
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API available at /api/junkyards`);
});

// Try to connect to MongoDB in the background
mongoose.connect(MONGODB_URI, {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
    console.log('Server will continue running without MongoDB');
  }); 