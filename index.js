const express = require('express');
const Router= require ('./router.js');
const cors= require('cors')



const PORT= 3000;

const app= express();

//https://e-pay-4zu3.onrender.com

app.use(cors({
    origin: '*',  // Change this to allow only your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 
        'Authorization',
        'clientid',
        'nonce',
        'signature',
        'authkey' ],
        credentials: true
  }));

  app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', Router);


app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})