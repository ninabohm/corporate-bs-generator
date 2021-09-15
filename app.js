const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const dotEnv = require("dotenv");
const helmet = require("helmet");
const mongoose = require("mongoose");
const passport = require("passport");
const User = require("./models/user");
const userRouter = require("./routes/users");
const entryRouter = require("./routes/entries");
const favicon = require("serve-favicon");
const generatorRouter = require("./routes/generator");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const { checkIfUserIsNotAuthenticated } = require("./basicAuth")

initializePassport(
  passport, 
  email =>  User.find(user => user.email === email),
  id => User.find(user => user.id === id)
);

const basicLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "Unfortunately, those were too many requests. Please try again later."
});


dotEnv.config();

mongoose
.connect(
  process.env.MONGODB_URI,{
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true
});

app.use(basicLimiter);
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session( {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

app.use("/entries", entryRouter);
// app.use("/register", registerRouter);
app.use("/users", userRouter);
app.use("/generator", generatorRouter);

app.get('/', (req, res) => {
  res.render("index");
});

app.get("/login", checkIfUserIsNotAuthenticated, (req, res) => {
  res.render("users/login");
});

app.post("/login", checkIfUserIsNotAuthenticated, passport.authenticate("local", {
  successMessage: "login successful",
  successRedirect: "/generator", 
  failureRedirect: "/login",
  failureFlash: true
}))


app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});


app.listen(process.env.PORT, () => {
  console.log(`Server up and running on port ${process.env.PORT}`
)});
