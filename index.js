const express = require('express');
const Router= require ('./router.js');




const PORT= 3000;

const app= express();

app.use(cors({
    origin: 'https://e-pay-4zu3.onrender.com',  // Change this to allow only your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', Router);


app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})