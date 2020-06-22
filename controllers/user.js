const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator")


const User= require('../models/user');

exports.userSignup = async (req,res)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors:errors.array()
        });
    }
    console.log(req.body);
        
        try{
            const { name, email, password }  = req.body;
            
            let user = await User.findOne({email:email});
            console.log(user);
            if(user){
               return  res.status(400).json({
                        message:"User Already exists!"
                })
            }

            user = new User({
                name,
                email,
                password
            });

            const salt = await bcrypt.genSalt(11);

            user.password = await bcrypt.hash(password,salt);

            await user.save();
            
            const token = jwt.sign({email:user.email,userId:user._id,name:user.name,avatar:user.avatar},
                process.env.JWT_KEY,{expiresIn:"4h"})
                console.log(token);
                // const { avatar ,_id} = user;
                console.log(user);
                res.status(200).json({
                    token:token,
                    userId:user._id,
                    avatar:user.avatar,
                    name:user.name
                });
        }
        catch(err){
            console.error(err.message);
           return res.status(500).json({
               "message":"Server Error"
           })
        }
}


exports.userLogin = async (req,res)=>{
    // console.log("in log")
    try{
    const user = await User.findOne({email:req.body.email});
    const check=  await bcrypt.compare(req.body.password,user.password);
    console.log(user);
    if(check){
    const token = jwt.sign({email:user.email,userId:user._id,name:user.name,avatar:user.avatar},
        process.env.JWT_KEY,{expiresIn:"4h"})
        // console.log(token);
        // this.http.post<{token:string,userId:string,avatar:string,name:string,email:string}>(BACKEND_URL+"/login",authdata)
//
        const {email, name, avatar,_id} = user;
        console.log(user);
        res.status(200).json({
            token:token,
            userId:user._id,
            name:user.name,
            avatar:user.avatar,
            email:user.email
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


exports.getUsers = async (req, res) => {
  try{
    const user = await User.find();
    console.log(user);
    return res.status(200).json({
        message: "Users fetched successfully!",
        users: user,
      });
  }
  catch(err){
    console.log(err.message);
    return res.status(401).json({
       message:"No User found!"
   });
  }
  };