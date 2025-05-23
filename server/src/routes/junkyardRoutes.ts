import express from 'express';
import JunkyardModel from '../models/Junkyard';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const router = express.Router();

// Geocode an address
router.post('/geocode', async (req, res) => {
  try {
    const { address, city, state, zipCode } = req.body;
    
    // Validate inputs
    if (!address || !city || !state) {
      console.error('Geocoding error: Missing required fields', { address, city, state, zipCode });
      return res.status(400).json({ message: 'Address, city, and state are required' });
    }
    
    const fullAddress = `${address}, ${city}, ${state} ${zipCode || ''}`;
    console.log(`Geocoding address: "${fullAddress}"`);
    console.log(`Using Google Maps API Key: ${process.env.GOOGLE_MAPS_API_KEY ? 'Key is set' : 'Key is missing'}`);
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    console.log('Geocoding response status:', response.data.status);
    
    if (response.data.status === 'REQUEST_DENIED') {
      console.error('Geocoding API request denied:', response.data.error_message);
      return res.status(400).json({ 
        message: 'Google Maps API request denied', 
        error: response.data.error_message 
      });
    }
    
    if (response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      console.log(`Successfully geocoded to: ${lat}, ${lng}`);
      res.json({ lat, lng });
    } else {
      console.error('No geocoding results found for address:', fullAddress);
      res.status(400).json({ message: 'Could not find location for this address' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ 
      message: 'Error looking up address',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all junkyards
router.get('/', async (req, res) => {
  try {
    const junkyards = await JunkyardModel.find().lean();
    res.json(junkyards);
  } catch (error) {
    console.error('Error in GET /api/junkyards:', error);
    res.status(500).json({ 
      message: 'Error fetching junkyards',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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
    const junkyard = new JunkyardModel(req.body);
    const savedJunkyard = await junkyard.save();
    res.status(201).json(savedJunkyard);
  } catch (error) {
    console.error('Error creating junkyard:', error);
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