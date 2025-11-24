#!/usr/bin/env node

const { CosmosClient } = require("@azure/cosmos");
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

// Get Cosmos DB credentials from environment variables
const COSMOSDB_URI = process.env.COSMOSDB_URI;
const COSMOSDB_KEY = process.env.COSMOSDB_KEY;

if (!COSMOSDB_URI || !COSMOSDB_KEY) {
    console.error("Error: COSMOSDB_URI and COSMOSDB_KEY must be set");
    process.exit(1);
}

// Initialize Cosmos DB client
const client = new CosmosClient({
    endpoint: COSMOSDB_URI,
    key: COSMOSDB_KEY,
});

// Create MCP server
const server = new Server(
    {
        name: "cosmosdb-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "query_cosmosdb",
                description: "Execute a SQL query on Cosmos DB",
                inputSchema: {
                    type: "object",
                    properties: {
                        database: {
                            type: "string",
                            description: "Database name",
                        },
                        container: {
                            type: "string",
                            description: "Container name",
                        },
                        query: {
                            type: "string",
                            description: "SQL query to execute",
                        },
                    },
                    required: ["database", "container", "query"],
                },
            },
            {
                name: "list_databases",
                description: "List all databases in Cosmos DB account",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "list_containers",
                description: "List all containers in a database",
                inputSchema: {
                    type: "object",
                    properties: {
                        database: {
                            type: "string",
                            description: "Database name",
                        },
                    },
                    required: ["database"],
                },
            },
        ],
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "query_cosmosdb": {
                const { database, container, query } = args;
                const db = client.database(database);
                const cont = db.container(container);
                const { resources } = await cont.items.query(query).fetchAll();

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(resources, null, 2),
                        },
                    ],
                };
            }

            case "list_databases": {
                const { resources: databases } = await client.databases.readAll().fetchAll();
                const dbNames = databases.map(db => db.id);

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(dbNames, null, 2),
                        },
                    ],
                };
            }

            case "list_containers": {
                const { database } = args;
                const db = client.database(database);
                const { resources: containers } = await db.containers.readAll().fetchAll();
                const containerNames = containers.map(c => c.id);

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(containerNames, null, 2),
                        },
                    ],
                };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Cosmos DB MCP server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
