const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    let allListings = await Listing.find();
    return res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    // whenever server restarts we will be loggedout.
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: "author" }).populate("owner"); //don't put curly braces when passing id.
    // we also want to know the username of author of the review so we need to use nested populate.
    // use populate method to fill entire data of that document and not just reference to other document
    // enter the field of the listing model as parameter in populate not the model or collection
    // console.log(listing);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    } else {
        // console.log(listing);
        res.render("listings/show.ejs", { listing });
    }
    // <li>&#8377;<%= listing.price.toLocaleString("en-IN") %></li> this put commas according to indian currency representation.
}

module.exports.createListing = async (req, res, next) => {
    const maptilersdk = await import('@maptiler/sdk');
    const mapToken = process.env.MAP_TOKEN;
    maptilersdk.config.apiKey = mapToken;
    const result = await maptilersdk.geocoding.forward(req.body.listing.location, {
        limit: 1,
    });

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = result.features[0].geometry;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    } else {
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
        res.render("listings/edit", { listing, originalImageUrl });
    }
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }


    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
}