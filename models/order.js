
const mongoose = require('mongoose');
const Item = require('./item'); // Model for menu items
const Customer = require('./customer'); // Model for customer details
const DeliveryBoy = require('./deliveryboy')

const orderSchema = new mongoose.Schema({
    items: [
        {
            menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
            quantity: { type: Number, required: true, min: 1 }, // Quantity must be at least 1
        }
    ],
    totalAmount: { type: Number, required: true }, // Will calculate dynamically
    customerName: { type: String,  required: true },
    
    status: { 
        type: String, 
        enum: ['pending','shipped', 'delivered', 'canceled'], 
        default: 'pending' // Track the order status
    },
    deliveryBoy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'DeliveryBoy'
    }
},{timestamps:true});
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;




