const Post = require("../models/post");


exports.createPost = (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator:req.userData.userId
    });
    // console.log(req.userData);
    post.save().then(createdPost => {
      res.status(201).json({
        message: "Post added successfully.",
        post: {
          ...createdPost,
          id: createdPost._id
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
      creator:req.userData.userId
    });
    console.log(post);
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId}, post)
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
        message:"Fetching the posts Failed!"
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
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
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