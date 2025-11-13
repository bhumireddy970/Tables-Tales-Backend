const mongoose = require('mongoose')

const chefSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    experience:{
        type:Number,
        required:true
    },
    speciality:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    imageURL:{
        type:String,
        required:true
    }
},{timestamps:true})

const Chef = new mongoose.model('chef',chefSchema)

module.exports = Chef