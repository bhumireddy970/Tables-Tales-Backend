const mongoose = require('mongoose');
const Item = require('./item')
const Order = require('./order')
const bcrypt = require('bcrypt');
const { createHmac, randomBytes } = require('crypto')
const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    role: { type: String, enum: ['admin', 'customer', 'chef', 'deliveryboy'], default: 'customer' },
    mobileNumber: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
    },
    address: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    ],
    wishList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'item'
        }
    ],
}, { timestamps: true });

// Hash password before saving the customer document
customerSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
