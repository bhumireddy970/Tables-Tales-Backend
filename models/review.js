const mongoose = require('mongoose')
const express = require('express')

const router = express.Router()
const reviewSchema = new mongoose.Schema({
    rating: Number,
    comment: String,
    foodRating: String,
    serviceRating: String,
    atmosphereRating: String,
    dateOfVisit: String,
    customerName: String,
    image: { type: String, default: null },
    
},{timestamps:true});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review