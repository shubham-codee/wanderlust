// creating collection.
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    // set is the case where image is coming but it is empty but what in case image not entered only then it will be image will be undefinied to tackle that we need default.
    // default is useful in testing but when client side comes into play when form will get submitted the it would be empty string where set logic will be used.
    price: Number,
    location: String,
    country: String,
    // one to many relation approach-2 { storing reference of child documents inside parent document }
    // documentation for type => populate
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review", // in this we write model name
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: String,
})

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } })
    }
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;