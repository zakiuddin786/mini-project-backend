require("dotenv").config();
const express = require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const cors=require('cors');

const postRoutes=require('./routes/posts');
const userRoutes = require('./routes/user');

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false, 
})
.then(()=>{
    console.log('DB Successfully connected');
})
.catch((err)=>{
    console.error(`${err.message} Occurred while connecting to DB!!`);
})

const app=express();
app.use(bodyParser.json());
app.use(cors());

// app.use("/images",express.static(path.join("images")));

// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin","*");
//     res.setHeader(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//     res.setHeader(
//         "Access-Control-Allow-Methods",
//         "GET, POST, PUT, PATCH, DELETE, OPTIONS"
//     );
//     next();
// });

app.use("/api/posts",postRoutes);
app.use("/api/user",userRoutes);

const port = process.env.PORT||8000;
app.listen(port,()=>{
    console.log(`app is running on ${port}`);
});

// module.exports = app; 