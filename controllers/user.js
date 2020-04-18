const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User= require('../models/user');

exports.userSignup = (req,res,next)=>{
    bcrypt.hash(req.body.password,10)
    .then(hash => {
    const user = new User({
        email:req.body.email,
        password:hash
    });
    user.save()
    .then(result =>{
            res.status(201).json({
                message:"New User Created!!",
                result: result
            });
        })
        .catch(err =>{
            res.status(500).json({
                message:"Email already in use! "
            });
        });
    }).catch((err =>{
        return res.status(401).json({
            message:"Signup failed!"
        });
    }))
}


exports.userLogin = (req,res,next)=>{
    let fetchedUser;
    User.findOne({email:req.body.email}).then(user =>{
        if(!user)
        {
            return res.status(401).json({
                message:"Email doesn't exist!"
            });
        }
        fetchedUser=user;
        console.log(fetchedUser);
        return bcrypt.compare(req.body.password,user.password);
    })
    .then(result =>{
        console.log(result);
        if(!result)
        {
            return res.status(401).json({
                message:"Email or Password is Incorrect"
            });
        }
        const token = jwt.sign({email:fetchedUser.email,userId:fetchedUser._id},
            process.env.JWT_KEY,{expiresIn:"1h"}
        );
        console.log(token);
        res.status(200).json({
            token:token,
            expiresIn:3600 ,
            userId:fetchedUser._id
        });

    }).catch((err)=>{
        console.log(err);
        return res.status(401).json({
            message:"Authentication failed!"
        });
    })
}