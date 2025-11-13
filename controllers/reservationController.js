const Reservation = require('../models/reservation');
const Branch = require('../models/branch');
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Public
const createReservation = asyncHandler(async (req, res) => {
  const { branch: branchId, date:reservationDate,time: reservationTime, partySize, customer, tableNumber } = req.body;

  const branch = await Branch.findById(branchId);
  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }
  
  // Check if table exists and can accommodate party size
  const table = branch.tables.find(t => t.tableNumber === tableNumber);
  if (!table) {
    return res.status(400).json({
      success: false,
      message: 'Table not found'
    });
  }
  
  if (table.capacity < partySize) {
    return res.status(400).json({
      success: false,
      message: `Table can only accommodate ${table.capacity} people`
    });
  }
  
  // Check availability
  const isAvailable = await Reservation.checkAvailability(
    branchId, 
    reservationDate, 
    reservationTime
  );
  
  if (!isAvailable) {
    return res.status(400).json({
      success: false,
      message: 'Table is not available at the requested time'
    });
  }
  
  // Create reservation
  const reservation = await Reservation.create({
    ...req.body,
    table: {
      tableNumber: table.tableNumber,
      capacity: table.capacity
    }
  });
  
  // Send confirmation email (you'll need to set up nodemailer)
  // await sendConfirmationEmail(reservation);
  
  res.status(201).json({
    success: true,
    data: reservation,
    message: 'Reservation created successfully'
  });
});

// @desc    Get all reservations (Admin/Staff)
// @route   GET /api/reservations
// @access  Private/Admin
const getAllReservations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, branch, date } = req.query;
  
  let filter = {};
  if (status) filter.status = status;
  if (branch) filter.branch = branch;
  if (date) filter.reservationDate = date;
  
  const reservations = await Reservation.find(filter)
    .populate('branch', 'name address')
    .sort({ reservationDate: -1, reservationTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Reservation.countDocuments(filter);
  
  res.json({
    success: true,
    count: reservations.length,
    total,
    pages: Math.ceil(total / limit),
    data: reservations
  });
});

// @desc    Get user's reservations
// @route   GET /api/reservations/my-reservations
// @access  Private
const getMyReservations = asyncHandler(async (req, res) => {
  const { email } = req.user; // Assuming user email from auth
  
  const reservations = await Reservation.find({ 'customer.email': email })
    .populate('branch', 'name address contact')
    .sort({ reservationDate: -1, reservationTime: -1 });
  
  res.json({
    success: true,
    count: reservations.length,
    data: reservations
  });
});

// @desc    Get single user reservation
// @route   GET /api/reservations/my-reservations/:id
// @access  Private
const getMyReservation = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const reservation = await Reservation.findOne({
    _id: req.params.id,
    'customer.email': email
  }).populate('branch', 'name address contact');

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  res.json({
    success: true,
    data: reservation
  });
});

// @desc    Update user's reservation
// @route   PUT /api/reservations/my-reservations/:id
// @access  Private
const updateMyReservation = asyncHandler(async (req, res) => {
  const { email } = req.user;
  let reservation = await Reservation.findOne({
    _id: req.params.id,
    'customer.email': email
  });

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  // Only allow updates to certain fields for customers
  const allowedUpdates = ['specialRequests', 'partySize'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('branch', 'name address contact');

  res.json({
    success: true,
    data: reservation
  });
});

// @desc    Cancel user's reservation
// @route   DELETE /api/reservations/my-reservations/:id
// @access  Private
const cancelMyReservation = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const reservation = await Reservation.findOne({
    _id: req.params.id,
    'customer.email': email
  });

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  // Update status to cancelled instead of deleting
  reservation.status = 'cancelled';
  await reservation.save();

  res.json({
    success: true,
    message: 'Reservation cancelled successfully'
  });
});

// @desc    Check availability
// @route   POST /api/reservations/availability
// @access  Public
const checkAvailability = asyncHandler(async (req, res) => {
  const { branch: branchId, date, time, partySize, duration = 120 } = req.body;
  
  const branch = await Branch.findById(branchId);
  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }
  
  // Check branch operating hours
  const requestedTime = time.substring(0, 5);
  if (requestedTime < branch.operatingHours.open || requestedTime > branch.operatingHours.close) {
    return res.json({
      success: true,
      available: false,
      message: 'Branch is closed at the requested time'
    });
  }
  
  // Check table availability
  const isAvailable = await Reservation.checkAvailability(branchId, date, time, duration);
  
  if (!isAvailable) {
    return res.json({
      success: true,
      available: false,
      message: 'No tables available at the requested time'
    });
  }
  
  // Get suitable tables
  const suitableTables = branch.tables.filter(table => 
    table.isAvailable && 
    table.capacity >= partySize
  );
  
  res.json({
    success: true,
    available: true,
    suitableTables: suitableTables.map(table => ({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      tableType: table.tableType,
      features: table.features
    })),
    branchHours: branch.operatingHours
  });
});

// @desc    Verify reservation
// @route   GET /api/reservations/verify/:code
// @access  Public
const verifyReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findOne({ reservationCode: req.params.code })
    .populate('branch', 'name address contact');
  
  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  res.json({
    success: true,
    data: reservation
  });
});

// @desc    Get reservations by branch
// @route   GET /api/reservations/branch/:branchId
// @access  Private/Admin
const getBranchReservations = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const { date, status } = req.query;
  
  let filter = { branch: branchId };
  if (date) filter.reservationDate = date;
  if (status) filter.status = status;
  
  const reservations = await Reservation.find(filter)
    .populate('branch', 'name address')
    .sort({ reservationDate: 1, reservationTime: 1 });
  
  res.json({
    success: true,
    count: reservations.length,
    data: reservations
  });
});

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private/Admin
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('branch', 'name address contact');
  
  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  res.json({
    success: true,
    data: reservation
  });
});

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private/Admin
const updateReservation = asyncHandler(async (req, res) => {
  let reservation = await Reservation.findById(req.params.id);
  
  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('branch', 'name address');
  
  res.json({
    success: true,
    data: reservation
  });
});

// @desc    Update reservation status
// @route   PATCH /api/reservations/:id/status
// @access  Private/Admin
const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('branch', 'name address');
  
  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  res.json({
    success: true,
    data: reservation
  });
});

// @desc    Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private/Admin
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  
  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }
  
  await Reservation.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Reservation deleted successfully'
  });
});

// @desc    Get reservation statistics
// @route   GET /api/reservations/dashboard/stats
// @access  Private/Admin
const getReservationStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));
  
  const [
    totalReservations,
    todayReservations,
    pendingReservations,
    confirmedReservations,
    completedReservations
  ] = await Promise.all([
    Reservation.countDocuments(),
    Reservation.countDocuments({
      reservationDate: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }),
    Reservation.countDocuments({ status: 'pending' }),
    Reservation.countDocuments({ status: 'confirmed' }),
    Reservation.countDocuments({ status: 'completed' })
  ]);
  
  res.json({
    success: true,
    data: {
      totalReservations,
      todayReservations,
      pendingReservations,
      confirmedReservations,
      completedReservations
    }
  });
});

// @desc    Get upcoming reservations
// @route   GET /api/reservations/dashboard/upcoming
// @access  Private/Admin
const getUpcomingReservations = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  
  const upcomingReservations = await Reservation.find({
    reservationDate: { $gte: startOfToday },
    status: { $in: ['pending', 'confirmed'] }
  })
  .populate('branch', 'name address')
  .sort({ reservationDate: 1, reservationTime: 1 })
  .limit(10);
  
  res.json({
    success: true,
    count: upcomingReservations.length,
    data: upcomingReservations
  });
});

// Email configuration (you'll need to set this up)
const sendConfirmationEmail = async (reservation) => {
  // Implement email sending logic here
  // You can use nodemailer or any email service
};

module.exports = {
  createReservation,
  getAllReservations,
  getMyReservations,
  getMyReservation,
  updateMyReservation,
  cancelMyReservation,
  checkAvailability,
  verifyReservation,
  getBranchReservations,
  getReservationById,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
  getReservationStats,
  getUpcomingReservations
};