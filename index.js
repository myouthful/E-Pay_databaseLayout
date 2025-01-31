const express = require('express');
const app= express();
const Router= require ('./router.js')


const PORT= 3000;

app.use('/', Router);


app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})