const express = require("express");
const { check, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/user");
const router = express.Router();
const { checkIfUserIsAuthenticated, checkIfUserIsNotAuthenticated } = require("../basicAuth");
const { isAdmin } = require("../permissions/user");
const bcrypt = require("bcrypt");

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
  check("email")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Your password must be at least 6 characters long"),
    async(req, res, next) => {
      const errors = validationResult(req);
      const alert = errors.array();
      User.findOne( { email : req.body.email }, function(error, user) {
        if (error) {
          console.log(error)
        }
        if (user) {
          const alreadyExistsError = { 
            'value' : req.body.email,
            'msg' : 'An account with this email already exists',
            'param' : 'email',
            'location' : 'body'
          }
          alert.push(alreadyExistsError);
          console.log(alert);
          res.render("users/register" , { alert : alert } );
        } else {
          if(!errors.isEmpty()) {
            try {
              res.render("users/register", { alert : alert } );
            } catch (error) {
              console.log(error);
            }
            
          } else {
            req.user = new User();
            next();
          }
        }
      });
  }, saveUserAndRedirect("login"));



router.get("/register/terms", registerLimiter, checkIfUserIsNotAuthenticated, (req, res) => {
  res.render("terms.ejs");
});

router.get("/register/privacy", registerLimiter, checkIfUserIsNotAuthenticated, (req, res) => {
  res.render("privacy-policy.ejs");
});

router.get("/account", checkIfUserIsAuthenticated, userLimiter, async(req, res) => {
  const user = req.user
  res.render("users/account.ejs", { user : user });
  
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    let user = req.user
    user.role = "basic"
    user.firstName = req.body.firstName
    user.lastName = req.body.lastName
    user.email = req.body.email
    user.password = hashedPassword
    
    try {
      user = await user.save();
      res.redirect(`/users/${user.id}`);
  
    } catch (error) {
      console.log(error);
      res.render(`users/${path}`, { user: user })
    }
  }
}


module.exports = router;