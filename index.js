const express = require('express');
const Router= require ('./router.js')


const PORT= 3000;

const app= express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', Router);


app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})