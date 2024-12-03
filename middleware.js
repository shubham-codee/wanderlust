const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const {reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");   

module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.user);
    // console.log(req.path, "..", req.originalUrl);
    // if the user is not logged in then we need to save its route in which he was previously on and then redirect it to the same route after he has logged in.
    if (!req.isAuthenticated()) {
        // isAuthenticated checks is the username exists and password is correct or not.
        // how to check if user is logged in or not?
        // req.isAuthenticated() => passport method => when we serialize session then it stores user information show passport will check the user is authentic or not with the hlep of that data.
        req.session.redirectUrl = req.originalUrl;
        // this will help that all the middlewares and requests will have access to this url unless the session is over.
        req.flash("error", "You must be logged in.");
        return res.redirect("/login");
    } else {
        next();
    }
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
    // we need to save this url which he was previously on just before letting him log in.  
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}