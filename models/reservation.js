const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    }
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  table: {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required']
    },
    capacity: {
      type: Number,
      required: true
    }
  },
  date: {
    type: Date,
    required: [true, 'Reservation date is required']
  },
  time: {
    type: String, // Store as HH:MM format
    required: [true, 'Reservation time is required']
  },
  partySize: {
    type: Number,
    required: [true, 'Party size is required'],
    min: [1, 'Party size must be at least 1'],
    max: [20, 'Party size cannot exceed 20']
  },
  duration: {
    type: Number, // in minutes
    default: 120 // 2 hours default
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  reservationCode: {
    type: String,
    unique: true
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'walk-in', 'partner'],
    default: 'website'
  }
}, {
  timestamps: true
});

// Index for efficient queries
reservationSchema.index({ branch: 1, reservationDate: 1, reservationTime: 1 });
reservationSchema.index({ 'customer.email': 1 });
reservationSchema.index({ reservationCode: 1 });

// Pre-save middleware to generate reservation code
reservationSchema.pre('save', async function(next) {
  if (!this.reservationCode) {
    this.reservationCode = await generateReservationCode();
  }
  next();
});

// Method to check if reservation is active
reservationSchema.methods.isActive = function() {
  const reservationDateTime = new Date(
    this.reservationDate.toDateString() + ' ' + this.reservationTime
  );
  const endDateTime = new Date(reservationDateTime.getTime() + this.duration * 60000);
  const now = new Date();
  return now >= reservationDateTime && now <= endDateTime;
};

// Static method to check table availability
reservationSchema.statics.checkAvailability = async function(branchId, date, time, duration = 120) {
  const reservationDateTime = new Date(date + ' ' + time);
  const endDateTime = new Date(reservationDateTime.getTime() + duration * 60000);
  
  const conflictingReservations = await this.find({
    branch: branchId,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      {
        reservationDate: date,
        reservationTime: time
      },
      {
        reservationDate: date,
        $expr: {
          $and: [
            { $lt: [{ $toDate: { $concat: [{ $toString: "$reservationDate" }, " ", "$reservationTime"] } }, endDateTime] },
            { $gt: [{ $toDate: { $concat: [{ $toString: "$reservationDate" }, " ", "$reservationTime"] } }, reservationDateTime] }
          ]
        }
      }
    ]
  });
  
  return conflictingReservations.length === 0;
};

// Generate unique reservation code
async function generateReservationCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const existingReservation = await mongoose.model('Reservation').findOne({ reservationCode: code });
    if (!existingReservation) {
      isUnique = true;
    }
  }
  
  return code;
}

module.exports = mongoose.model('Reservation', reservationSchema);