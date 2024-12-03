const Listing = require("../models/listing.js");
const Review = require("../models/review.js")

module.exports.createReview = async (req, res) => {
    // previously it couldn't access id because /listings/:id/reviews in this route id remain in app.js only doesnt come to review.js
    // console.log(req.params);
    // this :id param remain inside app.js and doesn't propagate to review.js
    // this in app.js is parent route and routes in review.js or listing.js is child route then to pass the parameter
    // to child route too then mergeParams option is used while creating router object.
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");

    res.redirect(`/listings/${req.params.id}`)
}

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    // $pull operator => removes from an existing array all instances of a value that match a condition.
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    // in this case only when review gets deleted then from both collections review gets deleted.
    // but reviews from reviews collection wont get deleted when that listing will get deleted.
    // solution: using post-middleware

    req.flash("success", "Review Delete!");
    res.redirect(`/listings/${id}`);
}