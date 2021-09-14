const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { checkIfUserIsAuthenticated} = require("../basicAuth");
const Entry = require("../models/entry");


const entryLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "Unfortunately, those were too many requests. Please try again later."
});

router.get("/", checkIfUserIsAuthenticated, entryLimiter, async(req, res) => {
    const entries = await Entry.find();
    const adverbs = filterByWordType(entries, "adverb");
    const randomAdverb = entries.aggregate(
        [ { $sample: { size: 1 } } ]
     )
    console.log(randomAdverb);
  res.render("generator/generator-front.ejs", { 
      adverb: "enthusiastically",
      verb: "foster",
      adjective: "next-generation",
      noun: "products"
     });
});

function filterByWordType(entries, wordType) {
    return entries.filter(entry => entry.wordType === wordType);
}

function pickRandomAdverb(entries) {
    
}


module.exports = router;
