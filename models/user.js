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
    }
});

userSchema.plugin(uniqueValidaor);

module.exports = mongoose.model("User",userSchema);
