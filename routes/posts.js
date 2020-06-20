const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const postController= require('../controllers/posts');

const checkAuth = require("../middlewares/check-Auth");

router.post("/createPost",
    checkAuth,
    postController.createPost);

router.put("/updatePost/:id",
    checkAuth,
    postController.updatePost
    );

router.get("/getAllPosts",
    postController.getPosts 
    );

router.get("/getPost/:id", 
    postController.getpost
    );

router.delete("/deletePost/:id",
    checkAuth,
    postController.deletePost
    );

router.post("/like/:postId",
    checkAuth,
    postController.likePost);

router.put("/unLike/:postId",
    checkAuth,
    postController.unLikePost);

router.post("/comment/:postId",[
    checkAuth,[
    check("text","Text is required!").not().isEmpty()
    ]],
    postController.addComment
    )
    
router.delete("/deleteComment/:postId/:commentId",
    checkAuth,
    postController.deleteComment);

module.exports = router;
