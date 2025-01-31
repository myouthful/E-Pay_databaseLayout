const express= require('express');
const { organizations } = require('./dbquery.js');
const {connectToDatabase}= require('./mongodb.js');

const Router= express.Router();


/**
 * REQUEST HEADER
 * ClientId: c4091897667d44f4790674e37d9216453
 * Nonce: 20200410202513869
 * Signature: TAP2kgjhhodYUcawFIwsn2GSxjoyVvWWQDZMhHuMFFM=
 */
Router.post('/account/create',async (req,res)=>{
   const ClientId= req.headers.clientid;
    const Nonce= req.headers.nonce;
    const Signature= req.headers.signature;

    const phone= req.phone;
    const first_name= req.first_name;
    const last_name= req.last_name;

    if (ClientId && Nonce && Signature ) {
        const data= await connectToDatabase(ClientId);
        if (data) {
            if(data.Nonce == Nonce && data.Signature == Signature ){
                res.send('Account created')
            }

        }
        else{
            res.send('error connecting to the database, try again')
        }
    }
    else{
        res.send('Request Header Missing');
    }
})

/**
 * REQUEST HEADER
 * ClientId: c4091897667d44f4790674e37d9216453
 * Nonce: 20200410202513869
 * Signature: TAP2kgjhhodYUcawFIwsn2GSxjoyVvWWQDZMhHuMFFM=
 * 
 * Fetch Account Balance
 */


Router.get('/account/balance',async (req,res)=>{
    const ClientId= req.headers.clientid;
     const Nonce= req.headers.nonce;
     const Signature= req.headers.signature;
 
     const phone= req.phone;
     const first_name= req.first_name;
     const last_name= req.last_name;
 
     if (ClientId && Nonce && Signature ) {
         const data= await connectToDatabase(ClientId);
         if (data) {
             if(data.Nonce == Nonce && data.Signature == Signature ){
                 res.send('fetching balance')
             }
 
         }
         else{
             res.send('error connecting to the database, try again')
         }
     }
     else{
         res.send('Request Header Missing');
     }
 })




module.exports= Router;