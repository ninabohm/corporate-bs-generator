function checkIfUserIsAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
     } else {
        res.status(401);
        return res.redirect("/login");
     } 
}


function checkIfUserIsNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/account");
    }
    next();
}


module.exports = {
    checkIfUserIsAuthenticated,
    checkIfUserIsNotAuthenticated
}