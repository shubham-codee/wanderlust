if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// it is useful where there is common layout in multiple pages like navbar, footer. 
// similar like we use includes/partials in ejs.
// modularity should be emphasized.
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js") 
// everything commented out because of restructuing. we made routes folder and then segreggated based on similar 
// routes 
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const wrapAsync = require('./utils/wrapAsync.js');


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
    .then(res => {
        console.log("connected to DB");
    })
    .catch(err => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
// whenever we want to send files in form then we set enctype(encoding type) = mutipart/form-data.
// when express.urlencoded is used but from enctype is different and form is submitted then in req.body it's empty
// because data of form is parsed in url form but the format is multipart/form-data so we will use multer to parse this form data.
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // to prevent cross-scripting attacks.
    }
}



app.use(session(sessionOptions));
// to test session is working or not when you see connect.sid in cookies then it working perfectly fine.

// why setting cookie expiry is good.
//  By default, no expiration is set, and most browser will consider this a "non-persistent cookie" and will delete it on a condition like exiting a web browser application.
// for example: we log in to linked in and the close the tab and then login after one day then also we are logged in. this shows that cookie containing session  info have a some longer expiry say 21days.

app.use(flash())
// in our code where we are passing routes in app.use before that we have use flash

// passport related middleware is used here.
// because to implement password we need sessions because we don't want the user to login again and again in different tabs or at different time in a particular session.

app.use(passport.initialize());
app.use(passport.session());
// A web application needs the ability to identify users as they browse from page to page. The series of requests and responses 
// each associated with the same user, is known as session.
// in one session user can login once and no need to login again and again on different pages.
passport.use(new LocalStrategy(User.authenticate()));
// use static authenticate method of model in LocalStrategy
// authenticate() Generates a function that is used in Passport's LocalStrategy
// to tell we are using local method not through facebook or instagram etc.

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// serializeUser() Generates a function that is used by Passport to serialize users into the session
// this stores user data in the session. => serializing user.

// deserializeUser() Generates a function that is used by Passport to deserialize users into the session
// this is for removing user data from the session. => deserializing user.


// app.get("/testListing", async (req, res) => {
//     let sample = new Listing({
//         title: "my new villa",
//         description: "by the beach",
//         image: {
//             filename: "listingimage",
//             url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
//         },
//         price: 1200,
//         location: "abc, goa",
//         country: "india",
//     })

//     await sample.save();
//     console.log("sample was savedd.");
//     res.send("testing successful");
// })

// this middleware is used for defining locals
// these variables in res.locals can be accessed directly in ejs without passing them as object.
// Use this property to set variables accessible in templates rendered with res.render. The variables set on res.locals are available within a single request-response cycle, and will not be shared between requests.
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    // console.log(res.locals.success);
    // res.locals.success is an array

    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next(); // not to forget calling next() else we will get stuck in the middleware only.
})

// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//         throw new ExpressError(400, error);
//     } else {
//         next();
//     }
// }

// // validations for review.
// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//         throw new ExpressError(400, error);
//     } else {
//         next();
//     }
// }

// demo user to test how passport works
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//         // we have only mentioned email in our userSchema but passport-local-mongoose add username and password by itself.
//     })

//     let registeredUser = await User.register(fakeUser, "helloword"); //1st-argument => user, 2nd-argument => password.
//     // register(user, password, cb) Convenience method to register a new user instance with a given password.
//     // Checks if username is unique.
//     // this will automatically save in database.
//     res.send(registeredUser);
// })

app.get('/search', wrapAsync(async (req, res) => {
    let { country, filter } = req.query;
    if (filter) {
        let allListings = await Listing.find({
            category: { $regex: new RegExp(`${filter}`, 'i') }
        });

        if (allListings.length) {
            req.flash("searchingError", ``);
            res.locals.searchingError = req.flash("searchingError");
            res.render('listings/result', { allListings });
        } else {
            req.flash("searchingError", `No listings found.`);
            res.locals.searchingError = req.flash("searchingError");
            res.render("listings/result");
        }
    }

    if (country) {
        let allListings = await Listing.find({
            country: { $regex: new RegExp(`^${country}`, 'i') }
        });
        if (allListings.length) {
            req.flash("searchingError", ``);
            res.locals.searchingError = req.flash("searchingError");
            res.render('listings/result', { allListings });
        } else {
            req.flash("searchingError", `No listings found.`);
            res.locals.searchingError = req.flash("searchingError");
            res.render("listings/result");
        }
    } else {
        req.flash("searchingError", ``);
        res.locals.searchingError = req.flash("searchingError");
        let allListings = await Listing.find();
        res.render("listings/result", { allListings });
    }
}));


app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
// this :id param remain inside app.js and doesn't propagate to review.js
// this in app.js is parent route and routes in review.js or listing.js is child route then to pass the parameter
// to child route too then mergeParams option is used while creating router object.
app.use("/", userRouter);


// // index route
// app.get("/listings", wrapAsync(async (req, res) => {
//     let allListings = await Listing.find({})
//     res.render("listings/index.ejs", { allListings });
// }))

// //new route
// app.get("/listings/new", (req, res) => {
//     res.render("listings/new");
// })

// //show route
// app.get("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate("reviews"); //don't put curly braces when passing id.
//     // use populate method to fill entire data of that document and not just reference to other document
//     // enter the field as parameter in populate not the model or collection
//     // console.log(listing);
//     res.render("listings/show.ejs", { listing });
//     // <li>&#8377;<%= listing.price.toLocaleString("en-IN") %></li> this put commas according to indian currency representation.
// }))

// //create route
// app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
//     // here validateListing is passed as middleware.
//     // let {title, description, image, price, country, location} = req.body; this is one way. but longer.
//     // this way will wrok when name attribute have same varaible name.
//     // another way making name attribute as object key. object = listing. ex. = listing[title] and then parsing it to Listing model.
//     // if (!req.body.listing) {
//     //     throw new ExpressError(400, "Send valid data for listing.");
//     // }
//     // 400 => bad request => because of client's fault server cannnot handle the request.
//     // let result = listingSchema.validate(req.body);
//     // the things i mentioned in joi schema like image default url it works. and other validations obviously works.
//     // joi gives us the errors. then depend on us what to do. it is useful when requests are send through hopscots or postman.
//     // console.log(result);
//     // if (result.error){
//     //     throw new ExpressError(400, result.error);
//     // }
//     // joi helps in validating individual fields. it could be done by multipe if statements for each field of req.body but joi provides efficient method.
//     // now convert all these to form of middleware by defining it as a function.
//     let listing = req.body.listing;
//     // console.log(listing);   
//     // listing.image.filename = "listingimage";
//     const newListing = new Listing(listing);
//     // if (!newListing.title){
//     //     throw new ExpressError(400, "Title is missing.");
//     // }
//     // if (!newListing.description){
//     //     throw new ExpressError(400, "Description is missing");
//     // }
//     // if (!newListing.location){
//     //     throw new ExpressError(400, "Location is missing");
//     // }
//     // this is not efficient in case we will add more new fields in future or there will be multiple models
//     // soln => use joi api => validate schema of model
//     // commented all ifs because using joi package
//     await newListing.save();
//     // suppose user uses postman or hopscotch services then he can crack loop holes of client side form validations
//     // so no solutions is server side error handling.
//     // error handling middleware.
//     res.redirect("/listings");
// }))

// // edit route
// app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit", { listing });
// }))

// // update route
// app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
//     // now we don't need to write validations in the form of if-else it will be handled by joi
//     // if (!req.body.listing) {
//     //     throw new ExpressError(400, "Send valid data for listing.");
//     // }
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
//     // res.redirect("/listings") rather than bringing to index page bring it to show page
//     res.redirect(`/listings/${id}`);
// }));

// // delete route
// app.delete("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// }))

//new route
// app.get("/listings/new", (req, res) => {
//     res.send("working");
// }) always write this above because express considers "new" as id because look at the above function it is getting called.

// // Reviews
// // every review should know for which listing it is created.
// // Post Review Route
// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();

//     res.redirect(`/listings/${req.params.id}`)
// }))

// // Delete Review Route
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;
//     // $pull operator => removes from an existing array all instances of a value that match a condition.
//     await Listing.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
//     await Review.findByIdAndDelete(reviewId);
//     // in this case only when review gets deleted then from both collections review gets deleted.
//     // but reviews from reviews collection wont get deleted when that listing will get deleted.

//     res.redirect(`/listings/${id}`);
// }))

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found."));
})

// first it will will try to match api request with all the above mentioned paths, if not match then this will 
// apply for every api request.

// "*" match with any incoming request in case doesn't match with any above requests.

app.use((err, req, res, next) => {
    // res.send("something went wrong.");
    let { statusCode = 500, message = "something went wrong!" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error", { err });
})

app.listen(8080, () => {
    console.log("server listening to 8080...");
})

/* 
Form validations:  => client side, server side.
client side => When we enter data in the form the browser will check to see the data is in correct format and with
the constraints set by the application.

if we set required attribute then on different message will pop up in different browsers so use bootstrap 
validation in forms.

for error.ejs we'll use bootstrap alerts.  

MVC: Model, View, Controller.

Models: database core,
Views: frontend core, 
Controller: backend core,

MVC(Design Patter, Framework) is a way of writing code, it doesn't add anything to code.
in routes we will only keep routes and the working and inside functions shift to controllers.

Router.route 
it helps that we are not defining same path in our code.
Returns an instance of a single route which you can then use to handle HTTP verbs with optional middleware. Use router.route() to avoid duplicate route naming and thus typing errors.
*/