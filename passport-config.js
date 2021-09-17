const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/user");


function initialize(passport) {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use(
        new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
            User.findOne( { email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: "Don't have an account yet? Register now!" });
                } else {    
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Password incorrect" });
                        }
                    });
                }
            });
        })
    );
}

    
module.exports = initialize;
