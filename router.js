const express= require('express');
const { organizations } = require('./dbquery.js');
const {connectToDatabase,closeConnection}= require('./mongodb.js');
const {generateAccountNumber,getBankPrefix}= require('./utility.js')

const Router= express.Router();


/**
 * REQUEST HEADER
 * ClientId: c4091897667d44f4790674e37d9216453
 * Nonce: 20200410202513869
 * Signature: TAP2kgjhhodYUcawFIwsn2GSxjoyVvWWQDZMhHuMFFM=
 */
Router.post('/account/create', async (req, res) => {
    const clientid = req.headers.clientid;
    const Nonce = req.headers.nonce;
    const Signature = req.headers.signature;

    const phone = req.body.phone;          // Changed from req.phone to req.body.phone
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const creator_bank = req.body.creator_bank;
    const account_type = req.body.account_type;
    
    //making sure the creator bank is registered in the request body
    console.log(creator_bank);
    

    try {
        if (!creator_bank) {
            return res.status(400).json({ error: 'Creator bank is required' });
        }

        // First check: Verify ClientId, Nonce and Signature
        if (!clientid || !Nonce || !Signature) {
            return res.status(400).json({ error: 'Request Header Missing' });
        }

        const clientData = await connectToDatabase(clientid);
        if (!clientData) {
            return res.status(401).json({ error: 'Invalid client credentials' });
        }

        if (clientData.Nonce !== Nonce || clientData.Signature !== Signature) {
            return res.status(401).json({ error: 'Invalid authentication' });
        }

        // Generate account number
        const accountNumber = generateAccountNumber(creator_bank);

        // Create account document
        const accountDocument = {
            account_number: accountNumber,
            first_name,
            last_name,
            phone,
            account_type,
            creator_bank,
            balance: 0,
            created_at: new Date(),
            status: 'active'
        };

        // Save to bank collection
        const db = clientData.db; // Assuming your connectToDatabase returns db connection
        const result = await db.collection('accountdetails').insertOne(accountDocument);

        if (result.acknowledged) {
            return res.status(201).json({
                message: 'Account created successfully',
                account_number: accountNumber
            });
        } else {
            return res.status(500).json({ error: 'Failed to create account' });
        }

    } catch (error) {
        console.error('Account creation error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }finally {
        
    }
});

/**
 * REQUEST HEADER
 * ClientId: c4091897667d44f4790674e37d9216453
 * Nonce: 20200410202513869
 * Signature: TAP2kgjhhodYUcawFIwsn2GSxjoyVvWWQDZMhHuMFFM=
 * 
 * Fetch Account Balance
 */


Router.get('/account/balance', async (req, res) => {
    const clientId = req.headers.clientid;
    const Nonce = req.headers.nonce;
    const Signature = req.headers.signature;

    const account_number = req.query.account_number; // Changed to query parameter since it's a GET request

    try {
        // Verify headers
        if (!clientId || !Nonce || !Signature) {
            return res.status(400).json({ error: 'Request Header Missing' });
        }

        // Verify account number
        if (!account_number) {
            return res.status(400).json({ error: 'Account number is required' });
        }

        // Connect and verify client credentials
        const clientData = await connectToDatabase(clientId);
        if (!clientData) {
            return res.status(401).json({ error: 'Invalid client credentials' });
        }

        if (clientData.Nonce !== Nonce || clientData.Signature !== Signature) {
            return res.status(401).json({ error: 'Invalid authentication' });
        }

        // Fetch account balance
        const db = clientData.db;
        const accountDetails = await db.collection('accountdetails').findOne(
            { account_number: account_number },
            { projection: { balance: 1, account_number: 1, first_name: 1, last_name: 1 } }
        );

        if (!accountDetails) {
            return res.status(404).json({ error: 'Account not found' });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                account_number: accountDetails.account_number,
                account_name: `${accountDetails.first_name} ${accountDetails.last_name}`,
                balance: accountDetails.balance
            }
        });

    } catch (error) {
        console.error('Balance fetch error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        
    }
});


Router.post('/account/transfer', async (req, res) => {
    const clientId = req.headers.clientid;
    const Nonce = req.headers.nonce;
    const Signature = req.headers.signature;

    const senders_account = req.body.senders_account;
    const receiver_account = req.body.receiver_account;
    const transfer_amount = parseFloat(req.body.transfer_amount);

    try {
        // Verify headers
        if (!clientId || !Nonce || !Signature) {
            return res.status(400).json({ error: 'Request Header Missing' });
        }

        // Verify required fields
        if (!senders_account || !receiver_account || !transfer_amount) {
            return res.status(400).json({ error: 'Missing required transfer details' });
        }

        // Validate transfer amount
        if (transfer_amount <= 0) {
            return res.status(400).json({ error: 'Invalid transfer amount' });
        }

        // Connect and verify client credentials
        const clientData = await connectToDatabase(clientId);
        if (!clientData) {
            return res.status(401).json({ error: 'Invalid client credentials' });
        }

        if (clientData.Nonce !== Nonce || clientData.Signature !== Signature) {
            return res.status(401).json({ error: 'Invalid authentication' });
        }

        const db = clientData.db;
        const accountsCollection = db.collection('accountdetails');

        // Start session for transaction
        const session = clientData.client.startSession();

        try {
            await session.withTransaction(async () => {
                // Fetch sender's account
                const senderAccount = await accountsCollection.findOne(
                    { account_number: senders_account }
                );

                if (!senderAccount) {
                    throw new Error('Sender account not found');
                }

                // Fetch receiver's account
                const receiverAccount = await accountsCollection.findOne(
                    { account_number: receiver_account }
                );

                if (!receiverAccount) {
                    throw new Error('Receiver account not found');
                }

                // Check sufficient balance
                if (senderAccount.balance < transfer_amount) {
                    throw new Error('Insufficient balance');
                }

                // Update sender's balance
                await accountsCollection.updateOne(
                    { account_number: senders_account },
                    { $inc: { balance: -transfer_amount } }
                );

                // Update receiver's balance
                await accountsCollection.updateOne(
                    { account_number: receiver_account },
                    { $inc: { balance: transfer_amount } }
                );

                return res.status(200).json({
                    status: 'success',
                    message: 'Transfer successful',
                    data: {
                        transaction_id: new Date().getTime(),
                        amount: transfer_amount,
                        sender: senders_account,
                        receiver: receiver_account,
                        date: new Date()
                    }
                });
            });
        } catch (error) {
            if (error.message === 'Insufficient balance') {
                return res.status(400).json({
                    status: 'failed',
                    error: 'Insufficient balance'
                });
            }
            throw error; // Re-throw other errors
        } finally {
            await session.endSession();
        }

    } catch (error) {
        console.error('Transfer error:', error);
        return res.status(500).json({ 
            status: 'failed',
            error: error.message || 'Internal server error'
        });
    } finally {
       
    }
});


 




module.exports= Router;