const mongoose = require('mongoose')
const Customer = require('./customer')

 const itemSchema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    likes:{
        type:Number,
        required:true,
        default:0
    },
    dislikes:{
        type:Number,
        required:true,
        default:0
    },
    category:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    imageURL:{
        type:String,
        required:true,
    }

 },{timestamps:true})

 const Item = new mongoose.model('item',itemSchema)




 module.exports = Item