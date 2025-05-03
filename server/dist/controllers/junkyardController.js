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
exports.deleteJunkyard = exports.updateJunkyard = exports.createJunkyard = exports.getJunkyardById = exports.getJunkyards = void 0;
const Junkyard_1 = __importDefault(require("../models/Junkyard"));
// Get all junkyards
const getJunkyards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const junkyards = yield Junkyard_1.default.find();
        res.json(junkyards);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching junkyards', error });
    }
});
exports.getJunkyards = getJunkyards;
// Get a single junkyard
const getJunkyardById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.getJunkyardById = getJunkyardById;
// Create a new junkyard
const createJunkyard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.createJunkyard = createJunkyard;
// Update a junkyard
const updateJunkyard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.updateJunkyard = updateJunkyard;
// Delete a junkyard
const deleteJunkyard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.deleteJunkyard = deleteJunkyard;
