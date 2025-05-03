import { Request, Response } from 'express';
import JunkyardModel from '../models/Junkyard';

// Get all junkyards
export const getJunkyards = async (req: Request, res: Response) => {
  try {
    const junkyards = await JunkyardModel.find();
    res.json(junkyards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching junkyards', error });
  }
};

// Get a single junkyard
export const getJunkyardById = async (req: Request, res: Response) => {
  try {
    const junkyard = await JunkyardModel.findById(req.params.id);
    if (!junkyard) {
      return res.status(404).json({ message: 'Junkyard not found' });
    }
    res.json(junkyard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching junkyard', error });
  }
};

// Create a new junkyard
export const createJunkyard = async (req: Request, res: Response) => {
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
};

// Update a junkyard
export const updateJunkyard = async (req: Request, res: Response) => {
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
};

// Delete a junkyard
export const deleteJunkyard = async (req: Request, res: Response) => {
  try {
    const deletedJunkyard = await JunkyardModel.findByIdAndDelete(req.params.id);
    if (!deletedJunkyard) {
      return res.status(404).json({ message: 'Junkyard not found' });
    }
    res.json({ message: 'Junkyard deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting junkyard', error });
  }
}; 