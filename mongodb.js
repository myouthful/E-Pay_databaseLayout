const {MongoClient} = require('mongodb');
require('dotenv').config()

const uri = process.env.uri;

async function connectToDatabase(clientid) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to database');
        const database = client.db('nibss');
        
        // Get client data from organizations collection
        const collection = database.collection('account');
        const clientData = await collection.findOne({ clientid:clientid });
        
        if (!clientData) {
            await client.close();
            return null;
        }

        // Return both client data and database connection
        return {
            ...clientData,
            db: database,
            client: client  // Include client to properly close connection later
        };

    } catch (error) {
        console.error('Error connecting to database', error);
        if (client) {
            await client.close();
        }
        return null;
    }
}

// Helper function to close database connection
async function closeConnection(connection) {
    if (connection && connection.client) {
        await connection.client.close();
        console.log('Database connection closed');
    }
}

module.exports = { 
    connectToDatabase,
    closeConnection 
};