const express = require('express')
const Customer = require('../models/customer')
const { createCustomer,showCustomer,validateCustomer,updateProfile,addToWishlist,removeFromWishlist } = require('../controllers/customer')
const router = express.Router()
router.put('/profile/update/:id',updateProfile)
router.get('/profile/:id',showCustomer)
router.post('/signin',validateCustomer)
router.post('/signup',createCustomer)
router.post('/wishlist/:id1/:id2',addToWishlist)
router.put('/remove-wishlist-item/:id',removeFromWishlist)

module.exports = router