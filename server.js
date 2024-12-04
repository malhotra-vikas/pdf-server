import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3150;

// Deriving __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const creditCardPayoffReportsFolder = "credit-card-payoff-reports"

// Ensure the directory for storing the PDFs exists
const storageDir = path.join(__dirname, creditCardPayoffReportsFolder);
if (!fs.existsSync(storageDir)){
  fs.mkdirSync(storageDir);
}

// Configure storage using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, creditCardPayoffReportsFolder); // save files in the 'stored-pdfs' directory
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname); // Extract the file extension
    const uniqueId = uuidv4(); // Generate a unique identifier
    cb(null, `${uniqueId}${fileExt}`); // Append the extension to the UUID
  }
});

const upload = multer({ storage: storage });

// Route to upload a PDF
app.post('/upload-pdf', upload.single('pdf'), (req, res) => {
  res.json({ link: `http://localhost:${PORT}/download-pdf/${req.file.filename}` });
});

// Route to download a PDF
app.get('/download-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'stored-pdfs', req.params.filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).send('File not found.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
