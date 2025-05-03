"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const junkyardRoutes_1 = __importDefault(require("./routes/junkyardRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// CORS configuration
const corsOptions = {
    origin: '*', // Allow all origins during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev')); // Add Morgan middleware for logging
// Routes
app.use('/api/junkyards', junkyardRoutes_1.default);
// Add root route handler
app.get('/', (req, res) => {
    res.json({ message: 'Junkyard Map API is running' });
});
// Error handling middleware
app.use((err, req, res, next) => {
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
mongoose_1.default.connect(MONGODB_URI)
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
