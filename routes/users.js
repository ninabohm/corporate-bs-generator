const express = require("express");
const { check, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/user");
const router = express.Router();
const { checkIfUserIsAuthenticated, checkIfUserIsNotAuthenticated } = require("../basicAuth");
const { isAdmin } = require("../permissions/user")

const userLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "Too many requests. Please try again later."
});

const registerLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "Unfortunately, those were too many requests. Please try again later."
});


router.get("/", userLimiter, checkIfUserIsAuthenticated, authGetUser, async(req, res) => {
  const users = await User.find();
  res.render("users/all-users.ejs", { users: users });
});

router.get("/register", registerLimiter, checkIfUserIsNotAuthenticated, (req, res) => {
  res.render("users/register");
});

router.post("/register", registerLimiter, checkIfUserIsNotAuthenticated, 
  check("password")
      .isLength({ min: 6 })
      .withMessage("Your password must be at least 2 characters long"),
  async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      const alert = errors.array();
      try {
        res.render("users/register", { alert : alert } );
      } catch (error) {
        console.log(error);
      }
      
    } else {
      req.user = new User();
      next();
    }
}, saveUserAndRedirect("login"));

router.get("/register/terms", registerLimiter, checkIfUserIsNotAuthenticated, (req, res) => {
  res.render("terms.ejs");
});

router.get("/register/privacy", registerLimiter, checkIfUserIsNotAuthenticated, (req, res) => {
  res.render("privacy-policy.ejs");
});

router.get("/account", checkIfUserIsAuthenticated, userLimiter, async(req, res) => {
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