import mongoose, { Schema, Document } from 'mongoose';

export interface IJunkyard extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
  website?: string;
  inventoryLink?: string;
  priceListLink?: string;
  estimatedSize?: number;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  description?: string;
  costRating: '1' | '2' | '3' | '';
  createdAt: Date;
  updatedAt: Date;
}

const JunkyardSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  website: { type: String },
  inventoryLink: { type: String },
  priceListLink: { type: String },
  estimatedSize: { type: Number },
  hours: {
    monday: { type: String, required: true },
    tuesday: { type: String, required: true },
    wednesday: { type: String, required: true },
    thursday: { type: String, required: true },
    friday: { type: String, required: true },
    saturday: { type: String, required: true },
    sunday: { type: String, required: true }
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  description: { type: String },
  costRating: { 
    type: String,
    enum: ['1', '2', '3', ''],
    default: '1'
  }
}, {
  timestamps: true
});

// Add indexes for frequently queried fields
JunkyardSchema.index({ name: 1 }); // For name searches
JunkyardSchema.index({ city: 1, state: 1 }); // For location-based queries
JunkyardSchema.index({ location: '2dsphere' }); // For geospatial queries
JunkyardSchema.index({ costRating: 1 }); // For filtering by cost rating

// Drop the existing model if it exists
if (mongoose.models.Junkyard) {
  delete mongoose.models.Junkyard;
}

export default mongoose.model<IJunkyard>('Junkyard', JunkyardSchema, 'junkyards'); 