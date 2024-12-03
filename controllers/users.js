const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup")
}

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ email, username });
        let registeredUser = await User.register(newUser, password);
        // console.log(registeredUser);
        // 1st-argument => which user to login, 2nd-argument => cb similar to req.logout.
        // When the login operation completes, user will be assigned to req.user.
        // passport.authenticate() middleware invokes req.login() automatically. This function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        })
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async (req, res) => {
    // Passport provides an authenticate() function, which is used as route middleware to authenticate requests.
    // 1st-argument => strategy, 2nd-argument => options
    req.flash("success", "Welcome back to Wanderlust!");
    // res.redirect(res.locals.redirectUrl);
    // there is a problem in redirecting in case of simple login because isLoggedin didn't get triggered so undefined in res.locals.redirectUrl
    // but there is a problem that passport resets the session when the .authenticate which automatically calls .login method of request sends a success message 
    // solution is to save the redirectUrl in res.locals which can be accessed by any request or middleware. Passport has no access to delete locals.
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout((err, next) => {
        // passport method => req.logout => this will use serialize and deserialize middleware to delete the user from current session which is logged in.
        if (err) {
            return next(err);
        } else {
            req.flash("success", "You are logged out now.");
            res.redirect("/listings");
        }
    })
}   