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
const WORKSPACES_CONTAINER_ID = "Workspaces";

let cosmosClient;
let userContainer;
let workspacesContainer;

if (COSMOSDB_URI && COSMOSDB_KEY) {
    cosmosClient = new CosmosClient({ endpoint: COSMOSDB_URI, key: COSMOSDB_KEY });
    const database = cosmosClient.database(DATABASE_ID);
    userContainer = database.container(CONTAINER_ID);

    // Initialize workspaces container (create if not exists)
    database.containers.createIfNotExists({
        id: WORKSPACES_CONTAINER_ID,
        partitionKey: "/uid"
    }).then(() => {
        workspacesContainer = database.container(WORKSPACES_CONTAINER_ID);
        console.log("Workspaces Container Initialized");
    });

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
            return res.json({ ...existingUsers[0], isNewUser: false });
        } else {
            // Create new user
            const newUser = {
                id: uid, // Use Firebase UID as document ID
                uid,
                email,
                displayName,
                photoURL,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isProfileComplete: false
            };

            const { resource: createdUser } = await userContainer.items.create(newUser);
            console.log(`New user created: ${email}`);
            return res.json({ ...createdUser, isNewUser: true });
        }

    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
});

// Get User Profile
app.get('/api/user/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        if (!userContainer) {
            return res.status(503).json({ error: "Database service unavailable" });
        }

        const { resource: user } = await userContainer.item(uid, uid).read();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(user);

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Update User Profile
app.put('/api/user/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const updates = req.body;

        if (!userContainer) {
            return res.status(503).json({ error: "Database service unavailable" });
        }

        // Fetch existing user
        const { resource: user } = await userContainer.item(uid, uid).read();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update fields
        const updatedUser = {
            ...user,
            ...updates,
            isProfileComplete: true,
            updatedAt: new Date().toISOString()
        };

        const { resource: savedUser } = await userContainer.item(uid, uid).replace(updatedUser);
        console.log(`User updated: ${uid}`);
        return res.json(savedUser);

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Failed to update profile" });
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


// Create New Workspace
app.post('/api/workspace/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { name, code, chatHistory, language } = req.body;

        if (!workspacesContainer) {
            return res.status(503).json({ error: "Database service unavailable" });
        }

        if (!name) {
            return res.status(400).json({ error: "Workspace name is required" });
        }

        const workspaceId = `${uid}_${Date.now()}`;
        const workspace = {
            id: workspaceId,
            uid,
            name,
            code: code || "",
            chatHistory: chatHistory || [],
            language: language || "javascript",
            createdAt: new Date().toISOString(),
            lastSaved: new Date().toISOString()
        };

        await workspacesContainer.items.create(workspace);
        console.log(`Workspace '${name}' created for user: ${uid}`);
        return res.json({ message: "Workspace saved successfully", workspace });

    } catch (error) {
        console.error("Save Workspace Error:", error);
        res.status(500).json({ error: "Failed to save workspace" });
    }
});

// Update Workspace
app.put('/api/workspace/:workspaceId', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { code, chatHistory, language } = req.body;

        if (!workspacesContainer) {
            return res.status(503).json({ error: "Database service unavailable" });
        }

        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @workspaceId",
            parameters: [{ name: "@workspaceId", value: workspaceId }]
        };

        const { resources } = await workspacesContainer.items.query(querySpec).fetchAll();

        if (resources.length === 0) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        const workspace = resources[0];
        workspace.code = code !== undefined ? code : workspace.code;
        workspace.chatHistory = chatHistory !== undefined ? chatHistory : workspace.chatHistory;
        workspace.language = language !== undefined ? language : workspace.language;
        workspace.lastSaved = new Date().toISOString();

        await workspacesContainer.item(workspaceId, workspace.uid).replace(workspace);
        console.log(`Workspace updated: ${workspaceId}`);
        return res.json({ message: "Workspace updated successfully", workspace });

    } catch (error) {
        console.error("Update Workspace Error:", error);
        res.status(500).json({ error: "Failed to update workspace" });
    }
});

// Get All Workspaces for User
app.get('/api/workspaces/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        if (!workspacesContainer) {
            return res.status(503).json({ error: "Database service unavailable" });
        }

        const querySpec = {
            query: "SELECT * FROM c WHERE c.uid = @uid ORDER BY c.lastSaved DESC",
            parameters: [{ name: "@uid", value: uid }]
        };

        const { resources: workspaces } = await workspacesContainer.items.query(querySpec).fetchAll();
        return res.json(workspaces);

    } catch (error) {
        console.error("Get Workspaces Error:", error);
        res.status(500).json({ error: "Failed to load workspaces" });
    }
});

// Load Specific Workspace
app.get('/api/workspace/:workspaceId', async (req, res) => {
    try {
        const { workspaceId } = req.params;

        if (!workspacesContainer) {
            return res.status(503).json({ error: "Database service unavailable" });
        }

        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @workspaceId",
            parameters: [{ name: "@workspaceId", value: workspaceId }]
        };

        const { resources } = await workspacesContainer.items.query(querySpec).fetchAll();

        if (resources.length === 0) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        return res.json(resources[0]);

    } catch (error) {
        console.error("Load Workspace Error:", error);
        res.status(500).json({ error: "Failed to load workspace" });
    }
});

// Delete Workspace
app.delete('/api/workspace/:workspaceId/:uid', async (req, res) => {
    try {
        const { workspaceId, uid } = req.params;

        if (!workspacesContainer) {
            return res.status(503).json({ error: "Database service unavailable" });
        }

        await workspacesContainer.item(workspaceId, uid).delete();
        console.log(`Workspace deleted: ${workspaceId}`);
        return res.json({ message: "Workspace deleted successfully" });

    } catch (error) {
        console.error("Delete Workspace Error:", error);
        res.status(500).json({ error: "Failed to delete workspace" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

