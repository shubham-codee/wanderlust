const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
// const { reviewSchema } = require("../schema.js");
// const ExpressError = require("../utils/ExpressError.js"); // not required as shifted to middleware.js
const Review = require("../models/review.js")
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// validations for review.
// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//         throw new ExpressError(400, error);
//     } else {
//         next();
//     }
// } //shifted to middleware.js

// Reviews
// every review should know for which listing it is created.
// Post Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview))

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router;