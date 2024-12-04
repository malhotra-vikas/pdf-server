import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import cors from 'cors';

const allowedOrigins = ['http://localhost:3001', 'https://ai.dealingwithdebt.org', 'https://ai.dealingwithdebt.org:3001'];

const app = express();

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Get the PORT from the environment variable, default to 3150 if not available
const PORT = process.env.PORT;
const HOST = process.env.HOST;  // Default to 'localhost' if not specified

// Deriving __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const creditCardPayoffReportsFolder = "credit-card-payoff-reports"

// Ensure the directory for storing the PDFs exists
const storageDir = path.join(__dirname, creditCardPayoffReportsFolder);
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir);
}

// Configure storage using Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`Multer saved`);  // Log the path where the file is saved

        cb(null, storageDir); // save files in the 'stored-pdfs' directory
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname); // Extract the file extension
        const uniqueId = uuidv4(); // Generate a unique identifier
        console.log(`File multer saved as: ${uniqueId}${fileExt}`);  // Log the path where the file is saved

        cb(null, `${uniqueId}${fileExt}`); // Append the extension to the UUID
    }
});

const upload = multer({ storage: storage });

// Route to upload a PDF
app.post('/upload-pdf', upload.single('pdf'), (req, res) => {
    console.log(`File saved at: ${req.file.path}`);  // Log the path where the file is saved
    res.json({ link: `http://${HOST}:${PORT}/download-pdf/${req.file.filename}` });
});

// Route to download a PDF
app.get('/download-pdf/:filename', (req, res) => {
    const filePath = path.join(__dirname, creditCardPayoffReportsFolder, req.params.filename);
    console.log(`Attempting to download file from: ${filePath}`);  // Log the path used for download

    res.download(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found.');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
