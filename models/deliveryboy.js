const mongoose = require('mongoose')
const Order = require('../models/order')
const deliveryboySchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
      },
      status: {
        type: String,
        enum: ['available', 'on_delivery', 'inactive'],  // Delivery boy's status
        default: 'available',
      },
      assignedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',  // Reference to an Order model (if any)
      }],
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      completedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',  // Number of orders completed by the delivery boy
      }],
      imageURL:{
        type:String,
        required:true,
    }
},{timestamps:true})

const DeliveryBoy = new mongoose.model('deliveryboy',deliveryboySchema)

module.exports = DeliveryBoy