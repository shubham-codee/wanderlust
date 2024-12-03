const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js")
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// re-formatting
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image][url]'), validateListing, wrapAsync(listingController.createListing))

// index route
// router.get("/", wrapAsync(listingController.index))

// new route // it should be above show route else new will be considered as id.
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image][url]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))

//show route
// router.get("/:id", wrapAsync(listingController.showListing))


//create route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing))

// edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm))

// update route
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// delete route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))

module.exports = router;