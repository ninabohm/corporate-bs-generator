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
    try {
        let adverbs = await Entry.aggregate([ 
            { 
                $match: { wordType: "adverb" } 
            },
            {
                $sample: { size: 1 }
            }
        ]);
        let adverb = adverbs[0].wordContent;
        
        let verbs = await Entry.aggregate([ 
            { 
                $match: { wordType: "verb" } 
            },
            {
                $sample: { size: 1 }
            }
        ]);
        let verb = verbs[0].wordContent;

        let adjectives = await Entry.aggregate([ 
            { 
                $match: { wordType: "adjective" } 
            },
            {
                $sample: { size: 1 }
            }
        ]);
        let adjective = adjectives[0].wordContent;

        let nouns = await Entry.aggregate([ 
            { 
                $match: { wordType: "noun" } 
            },
            {
                $sample: { size: 1 }
            }
        ]);
        let noun = nouns[0].wordContent;

        res.render("generator/generator-front.ejs", { 
            adverb: adverb,
            verb: verb,
            adjective: adjective,
            noun: noun
           });
    } catch (error) {
        console.log(error);
        return res.status(500).send("something went wrong");
    }
});


module.exports = router;
