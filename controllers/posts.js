const Post = require("../models/post");


exports.createPost = (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    console.log("user data "+req.user);
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      user:req.userData.userId,
      name:req.userData.name
    });
    console.log("creating process is going on!");
    post.save().then(createdPost => {
      console.log(createdPost);
      res.status(201).json({
        message: "Post added successfully.",
        post: {
          ...createdPost,
          id: createdPost._id,
          name:createdPost.name
        } 
      });
    }).catch(err =>{
      res.status(500).json({
        message:"Error while creating the post! please retry."
      })
    });
  };

  exports.updatePost = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      user:req.userData.userId
    });
    console.log(post);
    Post.updateOne({ _id: req.params.id, user: req.userData.userId}, post)
    .then(result => {
    //   console.log(result);
      if(result.n > 0){
      res.status(200).json({ message: "Update successful!" });
      }else{
        res.status(401).json({
          message:"Un Authorized Access!"
        })
      }
    })
    .catch(err =>{
      res.status(500).json({
        message:"Coudn't update the post!"
      });
    })
  };

  exports.getPosts = (req, res, next) => {
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


  exports.getpost = (req, res, next) => {
    Post.findById(req.params.id).then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found!" });
      }
    })
    .catch(err =>{
      res.status(500).json({
        message:"Fetching the post Failed!"
      });
    });
  };



  exports.deletePost =  (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, user: req.userData.userId })
    .then(result => {
      console.log(result);
  if(result.n> 0){
        res.status(200).json({ message: "deletion successful!" });
        }else{
          res.status(401).json({
            message:"Un Authorized Access!"
          })
        }
      })
      .catch(err =>{
        res.status(500).json({
          message:"Deleting the posts Failed!"
        });
      });
  };

  exports.likePost = async (req,res)=>{
    try {
        const post = await Post.findById(req.params.postId);
        
        //check already liked

        if(post.likes.filter(like =>
            like.user.toString()===req.user.id).length>0){
                return res.status(400).json({
                    msg:"Post Already liked!!"
                });
        }

        post.likes.unshift({
            user:req.user.id
        });

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
            like.user.toString()===req.user.id).length === 0){
                return res.status(400).json({
                    msg:"Post has not been liked yet!!"
                });
        }

        const removeIndex= post.likes.map(like => like.user.toString()).indexOf(req.user.id);

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
        const user = await User.findById(req.user.id).select("-password");

        const post = await Post.findById(req.params.postId);

        const newComment = {
            text : req.body.text,
            name: user.name,
            avatar:user.avatar,
            user:req.user.id
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
        
        if(!post){
            return res.status(404).json({
                msg:"Post not found!"
            });
        }

        // find out comment

        const comment = post.comments.find(comment=> comment.id===req.params.commentId);
        console.log(comment);

        if(!comment){
            return res.status(404).json({
                msg:"Comment doesn't exists!"
            });
        }

        //check authorization

        if(comment.user.toString()!==req.user.id){
            return res.status(401).json({
                msg:"Unauthorized Access!!"
            });
        }

        const removeIndex= post.comments
        .map(comment => comment.id.toString()).indexOf(req.user.commentId);

        console.log(removeIndex);

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