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

/**
 * REQUEST HEADER
 * ClientId: c4091897667d44f4790674e37d9216453
 * Nonce: 20200410202513869
 * Signature: TAP2kgjhhodYUcawFIwsn2GSxjoyVvWWQDZMhHuMFFM=
 * 
 * Initiate Transfer
 */


Router.post('/account/transfer', async (req, res) => {
    const clientId = req.headers.clientid;
    const Nonce = req.headers.nonce;
    const Signature = req.headers.signature;

    const senders_account = req.body.senders_account;
    const receiver_account = req.body.receiver_account;
    const transfer_amount = parseFloat(req.body.transfer_amount);

    console.log(req.body);
    

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

Router.post('/addemployee', async (req, res) => {
    const authKey = req.headers.authkey;

    try {
        if (!authKey) {
            return res.status(401).json({
                status: 'failed',
                error: 'Auth key is required in headers'
            });
        }

        // Connect to employees database
        const client = await connectToDatabase();
        const db = client.db('employees');

        // Verify auth key
        const authKeyExists = await db.collection('levelone').findOne({ authKey });
        if (!authKeyExists) {
            return res.status(401).json({
                status: 'failed',
                error: 'Invalid auth key'
            });
        }

        // Validate required fields
        const requiredFields = [
            'firstname', 'lastname', 'middlename', 'age', 
            'zipcode', 'address', 'phone', 'email', 
            'sex', 'maritalStatus', 'bankBranch', 
            'salary', 'level', 'role'
        ];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    status: 'failed',
                    error: `${field} is required`
                });
            }
        }

        // Create employee document
        const employeeDoc = {
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            middleName: req.body.middlename,
            age: parseInt(req.body.age),
            zipCode: req.body.zipcode,
            address: req.body.address,
            phone: req.body.phone,
            email: req.body.email,
            sex: req.body.sex,
            maritalStatus: req.body.maritalStatus,
            bankBranch: req.body.bankBranch,
            salary: parseFloat(req.body.salary),
            level: req.body.level,
            role: req.body.role,
            createdAt: new Date(),
            employeeId: `EMP${Date.now()}`
        };

        // Insert employee record
        const result = await db.collection('employedList').insertOne(employeeDoc);

        if (result.acknowledged) {
            return res.status(201).json({
                status: 'success',
                message: 'Employee added successfully',
                data: {
                    employeeId: employeeDoc.employeeId
                }
            });
        } else {
            return res.status(500).json({
                status: 'failed',
                error: 'Failed to add employee'
            });
        }

    } catch (error) {
        console.error('Add employee error:', error);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
});


Router.get('/employee', async (req, res) => {
    const authKey = req.headers.authkey;
    const email = req.query.email;

    try {
        // Validate auth key
        if (!authKey) {
            return res.status(401).json({
                status: 'failed',
                error: 'Auth key is required in headers'
            });
        }

        // Validate email parameter
        if (!email) {
            return res.status(400).json({
                status: 'failed',
                error: 'Email parameter is required'
            });
        }

        // Connect to employees database
        const client = await connectToDatabase();
        const db = client.db('employees');

        // Verify auth key
        const authKeyExists = await db.collection('levelone').findOne({ authKey });
        if (!authKeyExists) {
            return res.status(401).json({
                status: 'failed',
                error: 'Invalid auth key'
            });
        }

        // Find employee by email
        const employee = await db.collection('employedList').findOne(
            { email: email },
            { projection: { _id: 0 } } // Exclude MongoDB _id field
        );

        if (!employee) {
            return res.status(404).json({
                status: 'failed',
                error: 'Employee not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: employee
        });

    } catch (error) {
        console.error('Fetch employee error:', error);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
});

// ...existing code...

/**
 * Update employee role
 */
Router.patch('/employee/role', async (req, res) => {
    const authKey = req.headers.authkey;
    const { email, newRole } = req.body;

    try {
        // Validate required fields
        if (!authKey) {
            return res.status(401).json({
                status: 'failed',
                error: 'Auth key is required in headers'
            });
        }

        if (!email || !newRole) {
            return res.status(400).json({
                status: 'failed',
                error: 'Email and new role are required'
            });
        }

        // Connect to database
        const client = await connectToDatabase();
        const db = client.db('employees');

        // Verify auth key
        const authKeyExists = await db.collection('levelone').findOne({ authKey });
        if (!authKeyExists) {
            return res.status(401).json({
                status: 'failed',
                error: 'Invalid auth key'
            });
        }

        // Update employee role
        const result = await db.collection('employedList').updateOne(
            { email: email },
            { $set: { role: newRole, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                status: 'failed',
                error: 'Employee not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Employee role updated successfully'
        });

    } catch (error) {
        console.error('Update role error:', error);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
});

/**
 * Update employee salary
 */
Router.patch('/employee/salary', async (req, res) => {
    const authKey = req.headers.authkey;
    const { email, newSalary } = req.body;

    try {
        // Validate required fields
        if (!authKey) {
            return res.status(401).json({
                status: 'failed',
                error: 'Auth key is required in headers'
            });
        }

        if (!email || !newSalary) {
            return res.status(400).json({
                status: 'failed',
                error: 'Email and new salary are required'
            });
        }

        // Validate salary
        if (isNaN(newSalary) || newSalary <= 0) {
            return res.status(400).json({
                status: 'failed',
                error: 'Invalid salary amount'
            });
        }

        // Connect to database
        const client = await connectToDatabase();
        const db = client.db('employees');

        // Verify auth key
        const authKeyExists = await db.collection('levelone').findOne({ authKey });
        if (!authKeyExists) {
            return res.status(401).json({
                status: 'failed',
                error: 'Invalid auth key'
            });
        }

        // Update employee salary
        const result = await db.collection('employedList').updateOne(
            { email: email },
            { $set: { salary: parseFloat(newSalary), updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                status: 'failed',
                error: 'Employee not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Employee salary updated successfully'
        });

    } catch (error) {
        console.error('Update salary error:', error);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
});


Router.patch('/employee/level', async (req, res) => {
    const authKey = req.headers.authkey;
    const { email, newLevel } = req.body;

    try {
        // Validate required fields
        if (!authKey) {
            return res.status(401).json({
                status: 'failed',
                error: 'Auth key is required in headers'
            });
        }

        if (!email || !newLevel) {
            return res.status(400).json({
                status: 'failed',
                error: 'Email and new level are required'
            });
        }

        // Connect to database
        const client = await connectToDatabase();
        const db = client.db('employees');

        // Verify auth key
        const authKeyExists = await db.collection('levelone').findOne({ authKey });
        if (!authKeyExists) {
            return res.status(401).json({
                status: 'failed',
                error: 'Invalid auth key'
            });
        }

        // Update employee level
        const result = await db.collection('employedList').updateOne(
            { email: email },
            { $set: { level: newLevel, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                status: 'failed',
                error: 'Employee not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Employee level updated successfully'
        });

    } catch (error) {
        console.error('Update level error:', error);
        return res.status(500).json({
            status: 'failed',
            error: 'Internal server error'
        });
    }
});






module.exports= Router;