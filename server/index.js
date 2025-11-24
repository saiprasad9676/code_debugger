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

// Cosmos DB Setup
const { CosmosClient } = require("@azure/cosmos");
const COSMOSDB_URI = process.env.COSMOSDB_URI;
const COSMOSDB_KEY = process.env.COSMOSDB_KEY;
const DATABASE_ID = "CodeDebuggerDB";
const CONTAINER_ID = "Users";

let cosmosClient;
let userContainer;

if (COSMOSDB_URI && COSMOSDB_KEY) {
    cosmosClient = new CosmosClient({ endpoint: COSMOSDB_URI, key: COSMOSDB_KEY });
    userContainer = cosmosClient.database(DATABASE_ID).container(CONTAINER_ID);
    console.log("Cosmos DB Client Initialized");
} else {
    console.warn("Cosmos DB credentials missing. User persistence will not work.");
}

// Routes
app.get('/', (req, res) => {
    res.send('CodeGenius Backend is running');
});

// Auth Route
app.post('/api/auth/google', async (req, res) => {
    try {
        const { uid, email, displayName, photoURL } = req.body;

        if (!userContainer) {
            return res.status(503).json({ error: "Database service unavailable" });
        }

        // Check if user exists
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };

        const { resources: existingUsers } = await userContainer.items.query(querySpec).fetchAll();

        if (existingUsers.length > 0) {
            // User exists, return user data
            console.log(`User logged in: ${email}`);
            return res.json(existingUsers[0]);
        } else {
            // Create new user
            const newUser = {
                id: uid, // Use Firebase UID as document ID
                uid,
                email,
                displayName,
                photoURL,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            const { resource: createdUser } = await userContainer.items.create(newUser);
            console.log(`New user created: ${email}`);
            return res.json(createdUser);
        }

    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
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
            // Using gemini-pro-latest
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`,
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
