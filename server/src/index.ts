import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import junkyardRoutes from './routes/junkyardRoutes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev')); // Add Morgan middleware for logging

// Routes
app.use('/api/junkyards', junkyardRoutes);

// Add root route handler
app.get('/', (req, res) => {
  res.json({ message: 'Junkyard Map API is running' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server immediately for testing
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Try MongoDB connection in the background
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/junkyard-map';
console.log('Attempting to connect to MongoDB at:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    console.log('Server will continue running without MongoDB');
  }); 