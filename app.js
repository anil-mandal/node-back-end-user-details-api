const express = require('express');
const app = express();
const morgan = require("morgan");
const expressValidator = require("express-validator");
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser")
require('dotenv').config()
const fs = require('fs')
const cors = require('cors')



// console.log(process.env.password);

const DB = process.env.DB
mongoose.connect(DB).then((res) => {
    console.log('Mongo db connection successful !!!');
}).catch(err => {
    console.log('Connection failed...', err); 
})

//bring in routes
const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { application } = require('express');

//apiDocs
app.get('/',(req,res) => {
    fs.readFile('docs/apiDocs.json', (err, data) => {
        if(err) {
            res.status(400).json ({
                error: err
            })
        }
        const docs = JSON.parse(data);
        res.json(docs);

    });
})


//applying middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(expressValidator());
app.use(cors())
app.use("/",postRoutes);
app.use("/",userRoutes )
app.use("/", authRoutes);
app.use(function(err,req, res, next) {
    if(err.name ==='UnauthorizedError') {
        res.status(401).json({error:'Your are Restricted to view this Post'})
    }
})




const port = 3001;

app.listen(port, () => {
    console.log(`A Node Js API is listening on Port: ${port}`);
})