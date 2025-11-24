const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('CodeGenius Backend is running');
});

app.post('/api/generate', async (req, res) => {
    try {
        const { text, maxTokens = 1024, temperature = 0.7 } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Error: GEMINI_API_KEY is missing");
            return res.status(500).json({ error: 'API key not configured on server' });
        }

        console.log("Processing request for:", text.substring(0, 50) + "...");

        try {
            // Using gemini-1.5-pro as it is the current stable version
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
                {
                    contents: [{ parts: [{ text }] }],
                    generationConfig: {
                        maxOutputTokens: maxTokens,
                        temperature
                    }
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = response.data;
            res.json(data);

        } catch (apiError) {
            console.error("Gemini API Error:", apiError.response?.data || apiError.message);
            const status = apiError.response?.status || 500;
            const message = apiError.response?.data?.error?.message || apiError.message;

            res.status(status).json({ error: message });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
