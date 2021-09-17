const express = require("express");
const router = express.Router();
const { checkIfUserIsNotAuthenticated } = require("../basicAuth");
const passport = require("passport");


router.get("/", checkIfUserIsNotAuthenticated, (req, res) => {
    try {
        res.render("users/login");
    } catch (error) {
        console.log(error);
    }
    
});

router.post("/", checkIfUserIsNotAuthenticated, passport.authenticate("local", {
    successMessage: "login successful",
    successRedirect: "/generator", 
    failureRedirect: "/login",
    failureFlash: true
}))

module.exports = router;