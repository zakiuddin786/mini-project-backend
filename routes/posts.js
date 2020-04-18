const express = require("express");

const router = express.Router();

const postController= require('../controllers/posts');

const checkAuth = require("../middlewares/check-Auth");
const fileExtract = require('../middlewares/fileExtract');

router.post("",checkAuth,fileExtract,postController.createPost);

router.put("/:id",checkAuth,fileExtract,postController.updatePost);

router.get("",postController.getPosts );

router.get("/:id", postController.getpost);

router.delete("/:id",checkAuth,postController.deletePost);

module.exports = router;
