const formidable = require("formidable");
const imgbb = require("imgbb-uploader");
const { validationResult } = require("express-validator")

const Post = require("../models/post");
const User= require('../models/user');

exports.createPost = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    try {
    if (err) {
      return res.status(400).json({
        error: "Incompatible Image",
      });
    }

    const {
      title,
      content,
      image,
    } = fields;
    const creator= req.userData.userId;
    const creatorName = req.userData.name;
    console.log(creatorName);
    if(!title || !content || !file.image){
      return res.status(400).json({
          message:"One or more required fields are missing!"
      })
    }

    let newPost = new Post(fields);
    newPost.creator=creator;
    newPost.creatorName=creatorName;

    if(file.image){
      console.log("processing image!");
      if (file.image.size > 9000000) {
        return res.status(400).json({
          error: "File size too big. Should be below 9 MB",
        });
      }
      // console.log(file.image.path);
      const img = await imgbb(process.env.imgbb,file.image.path);
      // console.log(img);
      newPost.imagePath = img.display_url;

      console.log(newPost);
      const post = await newPost.save();

     return  res.json({
                message: "Post added successfully.",
                post: post
              });
    }
  }
    catch(err){
      console.error(err.message);
        res.status(500).send({
            msg:"Internal Server Error!"
        })
    }
  })
}

  exports.updatePost = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    try {
    if (err) {
      return res.status(400).json({
        error: "Incompatible Image",
      });
    }

    const {
      title,
      content,
      image,
    } = fields;
    const creator= req.userData.userId;
    const creatorName = req.userData.name;

    if(!title || !content || !file.image){
      return res.status(400).json({
          message:"One or more required fields are missing!"
      })
    }

    let newPost = {
      ...fields,
      creator : creator,
      creatorName : creatorName
    };

    if(file.image){
      console.log("processing image!");
      if (file.image.size > 9000000) {
        return res.status(400).json({
          error: "File size too big. Should be below 9 MB",
        });
      }
      // console.log(file.image.path);
      const img = await imgbb(process.env.imgbb,file.image.path);
      // console.log(img);
      newPost.imagePath = img.display_url;
      // const post = await newPost.save();

      const post = await Post.updateOne(
        { _id: req.params.id, creator:creator},
        {$set: newPost });

      if(post.n > 0)
      {
         return res.status(200).json({ 
            message: "Update successful!" });
      }
      else
      {
            res.status(401).json({
              message:"Un Authorized Access!"
            })
      }
       }
  }
    catch(err){
      console.error(err.message);
        res.status(500).send({
            msg:"unAuthorized Access!"
        })
    }
  })
};

  exports.getPosts = async (req, res, next) => {
    const pageSize= +req.query.pagesize;// to convert string to number
    const currentPage= +req.query.page; //since the url query is treated as text
    const postQuery=Post.find();
    let fetchedPosts;
  
    if(pageSize && currentPage)
    {
      postQuery
      .skip(pageSize*(currentPage-1))
      .limit(pageSize);
    }
  
    console.log(req.query);
  
     postQuery
     .then(documents => {
       fetchedPosts=documents;
       return Post.countDocuments();
      // res.status(200).json({
      //   message: "Posts fetched successfully!",
      //   posts: documents
      })
      .then(count=>{
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts:count
      });
    })
    .catch(err =>{
      res.status(500).json({
        message:"No posts found!"
      });
    });
  };


  exports.getpost = async (req, res, next) => {
    try{
    const post = await Post.findById(req.params.id);
      if (post) {
        return res.status(200).json(post);
      }
       else {
        res.status(404).json({ message: "Post not found!" });
      }
    }
    catch(err) {
      res.status(500).json({
        message:"Fetching the post Failed!"
      });
  }};



  exports.deletePost =  async (req, res) => {
    try{
    const post = await Post.findOne({_id:req.params.id})
    console.log(post)
    const deleteStatus = await Post.deleteOne({ _id: req.params.id, creator: req.userData.userId });
    if(deleteStatus.n> 0)
      res.status(200).json({ message: "deletion successful!" });
    else
    {
        res.status(401).json({
          message:"Un Authorized Access!"
        })
    }
  }
  catch(err){
    console.log(err.message)
    res.status(500).json({
              message:"Deleting the posts Failed!"
            });
  }
};

  exports.likePost = async (req,res)=>{
    try {
        const post = await Post.findById(req.params.postId);
        
        //check already liked

        if(post.likes.filter(like =>
            like.user.toString()===req.userData.userId).length>0){
                return res.status(400).json({
                    msg:"Post Already liked!!"
                });
        }

        post.likes.unshift({
            user:req.userData.userId,
            name:req.userData.name
        });

        console.log(post);

        await post.save();
        return res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        if(err.kind==='ObjectId'){
            return res.status(404).json({
                msg:"Post Not found!"
            });
        }
            res.status(500).send({
                msg:"Internal Server Error!"
        })
    }
}

exports.unLikePost = async (req,res)=>{
    try {
        const post = await Post.findById(req.params.postId);
        
        //check already liked

        if(post.likes.filter(like =>
            like.user.toString()===req.userData.creator).length === 0){
                return res.status(400).json({
                    msg:"Post has not been liked yet!!"
                });
        }

        const removeIndex= post.likes.map(like => like.user.toString()).indexOf(req.userData.creator);

        post.likes.splice(removeIndex,1);

        await post.save();
        return res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        if(err.kind==='ObjectId'){
            return res.status(404).json({
                msg:"Post Not found!"
            });
        }
            res.status(500).send({
                msg:"Internal Server Error!"
        })
    }
}

exports.addComment = async (req,res)=>{
    const errors= validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors:errors.array()
            });
        }

    try {
        const user = await User.findOne(req.userData.creator).select("-password");
      console.log(user)
        const post = await Post.findById(req.params.postId);

        const newComment = {
            text : req.body.text,
            name: user.name,
            avatar:user.avatar,
            user:req.userData.userId
        }

        // console.log(newComment);

        post.comments.unshift(newComment);

        await post.save();

        return res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({
            msg:"Internal Server Error!"
        })
    }
}

exports.deleteComment = async (req,res)=>{
    try {
        const post = await Post.findById(req.params.postId);
        // console.log(post)
        
        if(!post){
            return res.status(404).json({
                msg:"Post not found!"
            });
        }

        // find out comment

        const comment = post.comments.find(comment=> comment.id===req.params.commentId);
        // console.log(comment);

        if(!comment){
            return res.status(404).json({
                msg:"Comment doesn't exists!"
            });
        }

        //check authorization

        if(comment.user.toString()!==req.userData.userId){
            return res.status(401).json({
                msg:"Unauthorized Access!!"
            });
        }

        const removeIndex= post.comments
        .map(comment => comment.id.toString()).indexOf(req.params.commentId);

        // console.log(removeIndex);

        post.comments.splice(removeIndex,1);

        await post.save();

        res.json({
            msg:"Comment deleted successfully!"
        })
    } catch (err) {
        console.error(err.message);
        if(err.kind==='ObjectId'){
            return res.status(404).json({
                msg:"Comment Not found!"
            });
        }
            res.status(500).send({
                msg:"Internal Server Error!"
        })
    }
}