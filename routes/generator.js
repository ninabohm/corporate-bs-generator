const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { checkIfUserIsAuthenticated} = require("../basicAuth");


const entryLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "Unfortunately, those were too many requests. Please try again later."
});

router.get("/", checkIfUserIsAuthenticated, entryLimiter, async(req, res) => {
  res.render("generator/generator-front.ejs");
});




module.exports = router;
