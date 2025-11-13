const mongoose = require('mongoose');

// Define the schema for catering requests
const cateringEventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true,  // Remove leading/trailing spaces
  },
  eventDate: {
    type: Date,
    required: true,
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: [1, 'Number of guests must be at least 1'],
  },
  dietaryPreferences: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true,
  },
  noOfDays:{
    type:Number,
    required:true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /\+?\d{1,4}[\s-]?\(?\d+\)?[\s-]?\d+[\s-]?\d+$/.test(v);  // Simple phone number validation
      },
      message: 'Please enter a valid phone number',
    },
  },
  specialRequests: {
    type: String,
    trim: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: ['wedding', 'corporate', 'birthday', 'other'],
  },
  completed:{
    type:Boolean,
    default:false
  },
  status:{
    type:String,
    enum:['Not yet done','running','completed'],
    default:'Not yet done'
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create a model from the schema
const CateringEvent = mongoose.model('CateringRequest', cateringEventSchema);

module.exports = CateringEvent;
