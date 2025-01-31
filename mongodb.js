const {MongoClient} = require('mongodb');
require('dotenv').config()

const uri= process.env.uri;




async function connectToDatabase(ClientId) {
    const client= new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to database');
        const database= client.db('nibss');
        const collection = database.collection('organizations');
        const query = { ClientId: ClientId };
        const result = await collection.findOne(query);
        
        return result;  
    } catch (error) {
        console.error('Error connecting to database',error);     
    }
    finally{
        await client.close();
    }
}


module.exports={ connectToDatabase }