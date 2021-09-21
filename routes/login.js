const express = require("express");
const router = express.Router();
const { checkIfUserIsNotAuthenticated } = require("../basicAuth");
const passport = require("passport");
const rateLimit = require("express-rate-limit");


const basicLimiter = rateLimit({
    windowMs: 1000,
    max: 5,
    message: "Unfortunately, those were too many requests. Please try again later."
  });

router.get("/", checkIfUserIsNotAuthenticated, (req, res) => {
    try {
        res.render("users/login");
    } catch (error) {
        console.log(error);
    }
    
});

router.post("/", basicLimiter, checkIfUserIsNotAuthenticated, passport.authenticate("local", {
    successMessage: "login successful",
    successRedirect: "/generator", 
    failureRedirect: "/login",
    failureFlash: true
}))

module.exports = router;