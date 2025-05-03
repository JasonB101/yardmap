import express from 'express';
import JunkyardModel from '../models/Junkyard';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Geocode an address
router.post('/geocode', async (req, res) => {
  try {
    const { address, city, state, zipCode } = req.body;
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      console.log('Geocoded address:', { lat, lng });
      res.json({ lat, lng });
    } else {
      res.status(400).json({ message: 'Could not find location for this address' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Error looking up address' });
  }
});

// Get all junkyards
router.get('/', async (req, res) => {
  try {
    const junkyards = await JunkyardModel.find();
    res.json(junkyards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching junkyards', error });
  }
});

// Get a single junkyard
router.get('/:id', async (req, res) => {
  try {
    const junkyard = await JunkyardModel.findById(req.params.id);
    if (!junkyard) {
      return res.status(404).json({ message: 'Junkyard not found' });
    }
    res.json(junkyard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching junkyard', error });
  }
});

// Create a new junkyard
router.post('/', async (req, res) => {
  try {
    console.log('Received junkyard data:', req.body);
    const junkyard = new JunkyardModel(req.body);
    const savedJunkyard = await junkyard.save();
    console.log('Successfully saved junkyard:', savedJunkyard);
    res.status(201).json(savedJunkyard);
  } catch (error) {
    console.error('Error creating junkyard:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    res.status(400).json({ 
      message: 'Error creating junkyard', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update a junkyard
router.put('/:id', async (req, res) => {
  try {
    const updatedJunkyard = await JunkyardModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedJunkyard) {
      return res.status(404).json({ message: 'Junkyard not found' });
    }
    res.json(updatedJunkyard);
  } catch (error) {
    res.status(400).json({ message: 'Error updating junkyard', error });
  }
});

// Delete a junkyard
router.delete('/:id', async (req, res) => {
  try {
    const deletedJunkyard = await JunkyardModel.findByIdAndDelete(req.params.id);
    if (!deletedJunkyard) {
      return res.status(404).json({ message: 'Junkyard not found' });
    }
    res.json({ message: 'Junkyard deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting junkyard', error });
  }
});

export default router; 