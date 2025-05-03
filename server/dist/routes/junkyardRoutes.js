"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Junkyard_1 = __importDefault(require("../models/Junkyard"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
// Geocode an address
router.post('/geocode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address, city, state, zipCode } = req.body;
        const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
        const response = yield axios_1.default.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
        if (response.data.results && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            console.log('Geocoded address:', { lat, lng });
            res.json({ lat, lng });
        }
        else {
            res.status(400).json({ message: 'Could not find location for this address' });
        }
    }
    catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ message: 'Error looking up address' });
    }
}));
// Get all junkyards
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const junkyards = yield Junkyard_1.default.find();
        res.json(junkyards);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching junkyards', error });
    }
}));
// Get a single junkyard
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const junkyard = yield Junkyard_1.default.findById(req.params.id);
        if (!junkyard) {
            return res.status(404).json({ message: 'Junkyard not found' });
        }
        res.json(junkyard);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching junkyard', error });
    }
}));
// Create a new junkyard
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received junkyard data:', req.body);
        const junkyard = new Junkyard_1.default(req.body);
        const savedJunkyard = yield junkyard.save();
        console.log('Successfully saved junkyard:', savedJunkyard);
        res.status(201).json(savedJunkyard);
    }
    catch (error) {
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
}));
// Update a junkyard
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedJunkyard = yield Junkyard_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedJunkyard) {
            return res.status(404).json({ message: 'Junkyard not found' });
        }
        res.json(updatedJunkyard);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating junkyard', error });
    }
}));
// Delete a junkyard
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedJunkyard = yield Junkyard_1.default.findByIdAndDelete(req.params.id);
        if (!deletedJunkyard) {
            return res.status(404).json({ message: 'Junkyard not found' });
        }
        res.json({ message: 'Junkyard deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting junkyard', error });
    }
}));
exports.default = router;
