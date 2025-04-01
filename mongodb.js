const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.uri;

/**
 * Connects to database with optional client authentication
 * @param {string} [clientid] - Optional client ID for authenticated connections
 * @returns {Promise<Object>} Connection object or null if failed
 */
async function connectToDatabase(clientid) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to database');

        // If no clientid, return basic connection for non-authenticated routes
        if (!clientid) {
            return {
                client: client,
                db: client.db('nibss')
            };
        }

        // For authenticated routes, verify client credentials
        const database = client.db('nibss');
        const collection = database.collection('account');
        const clientData = await collection.findOne({ clientid: clientid });

        if (!clientData) {
            console.log('Client verification failed');
            await client.close();
            return null;
        }

        // Return authenticated connection with client data
        return {
            ...clientData,
            db: database,
            client: client
        };

    } catch (error) {
        console.error('Database connection error:', error);
        if (client) {
            await client.close();
        }
        return null;
    }
}

/**
 * Safely closes database connection
 * @param {Object} connection - Database connection object
 */
async function closeConnection(connection) {
    if (connection && connection.client) {
        try {
            await connection.client.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database connection:', error);
        }
    }
}

module.exports = { 
    connectToDatabase,
    closeConnection 
};