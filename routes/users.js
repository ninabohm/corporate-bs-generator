const express = require('express');
const rateLimit = require("express-rate-limit");
const User = require('../models/user');
const router = express.Router();
const { checkIfUserIsAuthenticated } = require("../basicAuth");
const { isAdmin } = require("../permissions/user")

const userLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "Too many requests. Please try again later."
});

router.get("/", userLimiter, checkIfUserIsAuthenticated, authGetUser, async(req, res) => {
  const users = await User.find();
  res.render("users/all-users.ejs", { users: users });
});

router.get("/account", checkIfUserIsAuthenticated, userLimiter, authGetUser, async(req, res) => {
  res.render("users/account.ejs");
});

router.get("/:id", userLimiter, checkIfUserIsAuthenticated, authGetUser, async(req, res) => {
  if(!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    return res.send("Bad Request");
  }
  const user = await User.findById(req.params.id);
  res.render("users/show.ejs", {user: user});
})


router.get("/edit/:id", userLimiter, checkIfUserIsAuthenticated, authGetUser, async(req, res) => {
  if(!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    return res.send("Bad Request");
  }
  const user = await User.findById(req.params.id);
  res.render("users/edit.ejs", { user: user });
});

router.put("/:id", checkIfUserIsAuthenticated, userLimiter, authPutUser, async(req, res, next) => {
  req.user = await User.findById(req.params.id);
  next();
}, saveUserAndRedirect("edit"))


function authGetUser(req, res, next) {
  if (isAdmin(req.user)) {
    next();
  } else {
    res.render("users/unauthorized.ejs")
  }
}

function authPutUser(req, res, next) {
  if (isAdmin(req.user)) {
    next();
  } else {
    res.render("users/unauthorized.ejs")
  }
}

function saveUserAndRedirect(path) {
  return async(req, res) => {
    let user = req.user
    user.role = req.body.role
    user.firstName = req.body.firstName
    user.lastName = req.body.lastName
    user.email = req.body.email
    
    try {
      user = await user.save();
      res.redirect(`/users/${user.id}`);
  
    } catch (e) {
      res.render(`users/${path}`, { user: user })
    }
  }
}


module.exports = router;