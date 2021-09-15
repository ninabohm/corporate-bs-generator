const express = require("express");
const rateLimit = require("express-rate-limit");
const Entry = require("./../models/entry");
const router = express.Router();
const { checkIfUserIsAuthenticated, checkIfUserIsNotAuthenticated } = require("../basicAuth");
const { scopeEntries, canViewEntry} = require("../permissions/entry");

const entryLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "Unfortunately, those were too many requests. Please try again later."
});

router.get("/", checkIfUserIsAuthenticated, entryLimiter, async(req, res) => {
  const entries = await Entry.find().sort({ createdAt: "desc" });
  const scopedEntries = scopeEntries(entries, req.user);
  res.render("entries/all-entries.ejs", { entries: scopedEntries });
});

router.get("/create", checkIfUserIsAuthenticated, entryLimiter, (req, res) => {
  const entry = new Entry();
  res.render("entries/create.ejs", { entry: entry });
});

router.get("/:id", entryLimiter, checkIfUserIsAuthenticated, authGetEntry, async(req, res) => {
  if(!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    return res.send("Bad Request");
  }
  const entry = await Entry.findById(req.params.id);
  if (canViewEntry(entry, req.user)) {
    res.render("entries/show.ejs", { entry: entry });
  } else {
    res.status(401);
    return res.send("Unauthorized")
  }
});


router.get("/edit/:id", entryLimiter, checkIfUserIsAuthenticated, authGetEntry, async(req, res) => {
    const entry = await Entry.findById(req.params.id);
    res.render("entries/edit.ejs", { entry: entry });
});

router.post("/", checkIfUserIsAuthenticated, entryLimiter, async(req, res, next) => {
  req.entry = new Entry();
  next();
}, saveEntryAndRedirect("create"));

router.put("/:id", checkIfUserIsAuthenticated, authGetEntry, entryLimiter, async(req, res, next) => {
  req.entry = await Entry.findById(req.params.id);
  next();
}, saveEntryAndRedirect("edit"));

router.delete("/:id", checkIfUserIsAuthenticated, authGetEntry, entryLimiter, async(req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.redirect("/entries");
})


function saveEntryAndRedirect(path) {
  return async(req, res) => {
    let entry = req.entry
    entry.wordType = req.body.wordType
    entry.wordContent = req.body.wordContent
    entry.tag = req.body.tag
    entry.userId = req.user.id

    try {
      entry = await entry.save();
      res.redirect(`/entries/${entry.id}`);
    } catch (error) {
      console.log(error)
      res.render(`entries/${path}`, { entry: entry });
    }
  }
}

async function authGetEntry (req, res, next) {
  const entry = await Entry.findById(req.params.id);
  if (canViewEntry(entry, req.user)) {
    next();
  } else {
    res.render("users/unauthorized.ejs")
  }
}

module.exports = router;
