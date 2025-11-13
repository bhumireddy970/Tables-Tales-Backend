const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true
    }
  },
  operatingHours: {
    open: {
      type: String,
      required: [true, 'Opening time is required']
    },
    close: {
      type: String,
      required: [true, 'Closing time is required']
    }
  },
  tables: [{
    tableNumber: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1']
    },
    tableType: {
      type: String,
      enum: ['indoor', 'outdoor', 'private', 'bar'],
      default: 'indoor'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    features: [{
      type: String,
      enum: ['window', 'garden-view', 'pool-side', 'smoking', 'non-smoking']
    }]
  }],
  amenities: [{
    type: String,
    enum: ['wifi', 'parking', 'valet', 'live-music', 'kids-zone', 'wheelchair-accessible']
  }],
  images: [{
    url: String,
    caption: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for location-based queries
branchSchema.index({ 'address.city': 1, 'address.state': 1 });

// Virtual for full address
branchSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Method to check if branch is open
branchSchema.methods.isOpen = function() {
  const now = new Date();
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
  return currentTime >= this.operatingHours.open && currentTime <= this.operatingHours.close;
};

// Method to get available tables
branchSchema.methods.getAvailableTables = function(partySize, date, time) {
  return this.tables.filter(table => 
    table.isAvailable && 
    table.capacity >= partySize
  );
};

module.exports = mongoose.model('Branch', branchSchema);