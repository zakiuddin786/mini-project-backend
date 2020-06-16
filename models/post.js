const mongoose =require('mongoose');

const PostSchema =mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    imagePath:{
        type:String,
        required:true
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    creatorName: {
        type:mongoose.Schema.Types.String,
        ref:"User"
    },
    likes: [
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        },
        name:{
            type:String
        },
        avatar:{
            type: String
        }
    }
    ],
    comments: [
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        },
        text: {
        type: String,
        required: true
        },
        name: {
        type: String
        },
        date: {
        type: Date,
        default: Date.now
        },
        avatar:{
            type: String
        }
    }
    ],
    date: {
    type: Date,
    default: Date.now
    }
});

module.exports=mongoose.model("Post",PostSchema);