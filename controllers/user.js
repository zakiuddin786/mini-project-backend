const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User= require('../models/user');

exports.userSignup = async (req,res)=>{
    // bcrypt.hash(req.body.password,10)
    // .then(hash => {
    // const user = new User({
    //     email:req.body.email,
    //     password:hash,
    //     name:req.body.name
    // });
    // user.save()
    // .then(result =>{
    //         res.status(201).json({
    //             message:"New User Created!!",
    //             result: result
    //         });
    //     })
    //     .catch(err =>{
    //         res.status(500).json({
    //             message:"Email already in use! "
    //         });
    //     });
    // }).catch((err =>{
    //     return res.status(401).json({
    //         message:"Signup failed!"
    //     });
    // }))
}


exports.userLogin = async (req,res,next)=>{
    let user;
    try{
    const user = await User.findOne({email:req.body.email});
    const check=  await bcrypt.compare(req.body.password,user.password);
    if(check){
    const token = jwt.sign({email:user.email,userId:user._id,name:user.name},
        process.env.JWT_KEY,{expiresIn:"1h"})
        console.log(token);
        const {email, name, avatar} = user;
        res.status(200).json({
            token:token,
            user:{
                email:email,
                name:name,
                avatar:avatar
            }
        });
    }
    else
    {
        console.log("valid failed");
        return res.status(401).json({
            message:"Email or Password is Invalid"
        });
    }
    } catch(err){
        console.log(err.message);
         return res.status(401).json({
            message:"Email or Password is Invalid"
        });
    }
}