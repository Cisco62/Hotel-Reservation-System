module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('success', 'You must be registered or signed in as a user');
        req.flash('error', 'Incorrect username or password');
        return res.redirect('/userlogin');
    }
    next();
}

