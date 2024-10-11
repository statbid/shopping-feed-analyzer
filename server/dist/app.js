"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
require("./worker");
const fs_1 = __importDefault(require("fs"));
const FeedAnalyzer_1 = require("./FeedAnalyzer");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const upload = (0, multer_1.default)({ dest: 'uploads/' });
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const fileStream = fs_1.default.createReadStream(req.file.path);
        const analyzer = new FeedAnalyzer_1.FeedAnalyzer();
        const results = await analyzer.analyzeStream(fileStream);
        res.json(results);
    }
    catch (error) {
        console.error('Error analyzing file:', error);
        res.status(500).json({ error: 'Error analyzing file' });
    }
    finally {
        // Clean up uploaded file
        if (req.file) {
            fs_1.default.unlinkSync(req.file.path);
        }
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
