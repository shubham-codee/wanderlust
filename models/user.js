const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    // You're free to define your User how you like. Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value.
    // so we don't need to define username and password in the schema.
    // when schema will get created in database automcatically username and password field will add up. 
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

// used because of automatically implementation of hashing, salting, adding fields of username, password etc. 

module.exports = User;
