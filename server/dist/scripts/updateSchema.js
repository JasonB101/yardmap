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
const mongoose_1 = __importDefault(require("mongoose"));
const Junkyard_1 = __importDefault(require("../models/Junkyard"));
// Connect to MongoDB
mongoose_1.default.connect('mongodb://localhost:27017/junkyard-map')
    .then(() => {
    console.log('Connected to MongoDB');
    updateSchema();
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
// Update schema function
function updateSchema() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get all junkyards
            const junkyards = yield Junkyard_1.default.find();
            // Update each junkyard
            for (const junkyard of junkyards) {
                // Add any new fields or modify existing ones here
                yield junkyard.save();
            }
            console.log('Schema update completed successfully');
            process.exit(0);
        }
        catch (error) {
            console.error('Error updating schema:', error);
            process.exit(1);
        }
    });
}
