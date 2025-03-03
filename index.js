const express = require('express');
const Router= require ('./router.js');

// cors would be strongly configured as more features are roled out
const cors= require('cors')


const PORT= 3000;

const app= express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors())

app.use('/', Router);


app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})