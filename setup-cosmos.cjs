const { CosmosClient } = require("@azure/cosmos");

// Get credentials from environment variables
const endpoint = process.env.COSMOSDB_URI;
const key = process.env.COSMOSDB_KEY;

if (!endpoint || !key) {
    console.error("Error: COSMOSDB_URI and COSMOSDB_KEY must be set");
    process.exit(1);
}

const client = new CosmosClient({ endpoint, key });

async function main() {
    try {
        console.log("Checking Cosmos DB connection...");
        const { resources: databases } = await client.databases.readAll().fetchAll();
        console.log("Existing databases:", databases.map(d => d.id));

        const dbId = "CodeDebuggerDB";
        const containerId = "Users";

        console.log(`\nCreating/Verifying database: ${dbId}...`);
        const { database } = await client.databases.createIfNotExists({ id: dbId });
        console.log(`Database '${dbId}' ready.`);

        console.log(`\nCreating/Verifying container: ${containerId}...`);
        // Partition key is important. Using /uid since we'll query by user ID mostly.
        const { container } = await database.containers.createIfNotExists({
            id: containerId,
            partitionKey: "/uid"
        });
        console.log(`Container '${containerId}' ready.`);

        // Create Workspaces container
        const workspacesContainerId = "Workspaces";
        console.log(`\nCreating/Verifying container: ${workspacesContainerId}...`);
        const { container: workspacesContainer } = await database.containers.createIfNotExists({
            id: workspacesContainerId,
            partitionKey: "/uid"
        });
        console.log(`Container '${workspacesContainerId}' ready.`);

        console.log("\nSetup complete! ✅");

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
