const express = require('express');
const rateLimit = require("express-rate-limit");
const User = require("./../models/user");
const bcrypt = require("bcrypt");

const {checkIfUserIsNotAuthenticated } = require("../basicAuth");
const router = express.Router();


const registerLimiter = rateLimit({
    windowMs: 1000,
    max: 5,
    message: "Unfortunately, those were too many requests. Please try again later."
});


router.get("/", registerLimiter, checkIfUserIsNotAuthenticated, (req, res) => {
    res.render("register");
  });


router.post("/", registerLimiter, checkIfUserIsNotAuthenticated, async(req, res, next) => {
    req.user = new User();
    next();
}, saveUserAndRedirect("/"));




function saveUserAndRedirect(path) {
    return async (req, res) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        let user = req.user
        user.firstName = req.body.firstName
        user.lastName = req.body.lastName
        user.email = req.body.email
        user.password = hashedPassword
  
      try {
        user = await user.save();
        res.redirect("/login");
      } catch (err) {
            if(err.name === 'MongoError' && err.code === 11000) {
                res.json("A user with that email already exists. Please go back and try again with a different email.");
            }
            res.render("/register");
      }
    }
  }

module.exports = router;