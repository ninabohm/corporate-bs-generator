const express = require("express");
const app = express();
const dotEnv = require("dotenv");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const initializePassport = require("./passport-config");
const User = require("./models/user");
const userRouter = require("./routes/users");
const entryRouter = require("./routes/entries");
const generatorRouter = require("./routes/generator");
const loginRouter = require('./routes/login');
const favicon = require("serve-favicon");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const flash = require("express-flash");
const session = require("express-session");


dotEnv.config();

app.set("view engine", "ejs");
app.use(basicLimiter);
app.use(cookieParser());
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/images/favicon.png"));
app.use(methodOverride('_method'));
app.use(flash());

app.use(session( {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

const basicLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "Unfortunately, those were too many requests. Please try again later."
});

initializePassport(
  passport, 
  email =>  User.find(user => user.email === email),
  id => User.find(user => user.id === id)
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/login", loginRouter);
app.use("/entries", entryRouter);
app.use("/users", userRouter);
app.use("/generator", generatorRouter);

app.get('/', (req, res) => {
  res.render("index.ejs");
});

app.on('ready', function() { 
  app.listen(process.env.PORT, () => { 
      console.log(`Server up and running on port ${process.env.PORT}`); 
  }); 
}); 


mongoose
.connect(
  process.env.MONGODB_URI,{
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true
}, () => {
  console.log("Connected to db")
});

mongoose.connection.once('open', () => { 
  app.emit('ready'); 
})

