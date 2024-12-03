// initializing with some data.
const mongoose = require("mongoose");
const initData = require("./data.js");
//here the whole object is assigned to initData and below is accessed using key. destructuring can also help.
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().catch(err => {
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "6742d78d3e5e63a687cea0ca"}))
    // first the map function will go on each object use the spread opertor and extract all the key:value and with it will add this owner filed in that object and will store in different array this different array we will equate to same array.
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();