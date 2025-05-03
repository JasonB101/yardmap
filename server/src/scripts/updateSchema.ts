import mongoose from 'mongoose';
import JunkyardModel from '../models/Junkyard';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/junkyard-map')
  .then(() => {
    console.log('Connected to MongoDB');
    updateSchema();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Update schema function
async function updateSchema() {
  try {
    // Get all junkyards
    const junkyards = await JunkyardModel.find();
    
    // Update each junkyard
    for (const junkyard of junkyards) {
      // Add any new fields or modify existing ones here
      await junkyard.save();
    }
    
    console.log('Schema update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
} 