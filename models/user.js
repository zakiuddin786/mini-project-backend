const mongoose = require('mongoose');
const uniqueValidaor= require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: {
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
      },
    avatar:{
        type:String,
        default: "https://i.ibb.co/4YvP9H7/upload-4c04e26baba6b7b6cbf86fcaa9f32ae5.gif"
    }
});

userSchema.plugin(uniqueValidaor);

module.exports = mongoose.model("User",userSchema);