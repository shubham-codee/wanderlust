const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,
    rating:{
        type: Number,
        min: 1, 
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User", // write model name here.
    }
})

module.exports = mongoose.model("Review", reviewSchema);