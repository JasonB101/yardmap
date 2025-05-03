"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const JunkyardSchema = new mongoose_1.Schema({
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
if (mongoose_1.default.models.Junkyard) {
    delete mongoose_1.default.models.Junkyard;
}
exports.default = mongoose_1.default.model('Junkyard', JunkyardSchema);
