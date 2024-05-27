const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: 'uploads/' });

const API_URL = 'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base';
const headers = {
    'Authorization': 'Bearer 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', // API KEY PAADLE ANNA xD
    'Content-Type': 'multipart/form-data'
};

// Log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.post('/caption', upload.single('file'), async (req, res) => {
    console.log('Received a request to generate caption.');

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const data = fs.readFileSync(req.file.path);
        console.log('Sending file data to Hugging Face API:', data);

        const fetch = await import('node-fetch');
        const response = await fetch.default(API_URL, {
            method: 'POST',
            headers,
            body: data
        });

        const result = await response.json();
        console.log('Received response from Hugging Face API:', result);

        const caption = result?.[0]?.generated_text;
        if (!caption) {
            throw new Error('Generated text not found in API response');
        }

        res.json({ caption });
    } catch (error) {
        console.error('Error generating caption:', error);
        res.status(500).json({ error: 'Failed to generate caption' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
