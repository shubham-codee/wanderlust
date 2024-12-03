const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        country: Joi.string().required(),
        location: Joi.string().required(),
        image: {
            filename: Joi.string().default("listingimage"),
            url: Joi.string().default("https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60").allow("", null),
        },
        category: Joi.string(),
    }).required()
})

// why she did listing as object then inside that fields? because in req.body we have made it come like that.
// inside req.body it is not individual fields rather there is listing object inside req.body object.

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required(),
    }).required()
})

// always delete in mongoDB like this => db.reviews.deleteOne({_id: ObjectId('6735d5de569e84de3241f27f')})