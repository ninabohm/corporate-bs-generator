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
    const verbs = filterByWordType(entries, "verb");
    const adjectives = filterByWordType(entries, "adjective");
    const nouns = filterByWordType(entries, "noun");
    const adverb = getRandomWord(adverbs);
    const verb = getRandomWord(verbs);
    const adjective = getRandomWord(adjectives);
    const noun = getRandomWord(nouns);
    
  res.render("generator/generator-front.ejs", { 
      adverb: adverb,
      verb: verb,
      adjective: adjective,
      noun: noun
     });
});

function filterByWordType(entries, wordType) {
    return entries.filter(entry => entry.wordType === wordType);
}


function getRandomWord(filteredWords) {
    const randomNumber = getRandomInt(1);
    const randomWord = filteredWords[randomNumber];
    return randomWord.wordContent;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

module.exports = router;
