const {connectToDatabase}= require('./mongodb.js');

async function organizations(ClientId) {
    try {
        const collectionName= 'organizations';
        const databaseName= 'nibss';
        const collection= await connectToDatabase(collectionName,databaseName);
    
        /**
         * A search into the db to fetch the
         * ClientId and all that follows
         * e.g Nonce,and signature
         */
        const query = { ClientId: ClientId };
        const result = await collection.findOne(query);
        return result;
    } catch (error) {
        console.error('Error fetching ClientId:', error);
    }
    
}



module.exports={
    organizations
}