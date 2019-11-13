module.exports = function(req, res, next){
    // check and see if the user is logged in
    // if not, redirect them to log-in page with message saying you
    if(req.session.logged){
        console.log("LOGGED IN");
        console.log(req.session.username);
        next();
    }
    else {
        console.log("NOT LOGGED IN -- redirecting");
        req.session.message = "You need to log in before you can do that."
        res.redirect("/auth/login");
    };
}