const express = require('express');
const { check }=require("express-validator");


const router = express.Router();

const userController = require('../controllers/user');

router.post("/signup",
    [
    check("name","name should be at least 3 characters long.").isLength({min:3}),
    check("email","email is required").isEmail(),
    check("password","password should be at least 8 characters long.").isLength({min:8})
    ],
    userController.userSignup);

router.post("/login",[
    check("email","Email is required").isEmail(),
    check("password","password is required").isLength({min:6})
    ],
    userController.userLogin);

router.get("/getAllUsers",
    userController.getUsers 
    );

module.exports = router;