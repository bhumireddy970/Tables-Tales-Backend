const Branch = require('../models/branch');
const asyncHandler = require('express-async-handler');

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
const getAllBranches = asyncHandler(async (req, res) => {
  const { city, isActive } = req.query;

  let filter = {};
  if (city) filter['address.city'] = new RegExp(city, 'i');
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const branches = await Branch.find(filter)
    .select('-tables.features') // Exclude some fields for public
    .sort({ 'address.city': 1, name: 1 });
  
  res.json({
    success: true,
    count: branches.length,
    data: branches
  });
});

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Public
const getBranchById = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  
  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }
  
  res.json({
    success: true,
    data: branch
  });
});

// @desc    Get branches by city
// @route   GET /api/branches/city/:city
// @access  Public
const getBranchesByCity = asyncHandler(async (req, res) => {
  const branches = await Branch.find({
    'address.city': new RegExp(req.params.city, 'i'),
    isActive: true
  }).select('name address contact operatingHours amenities');
  
  res.json({
    success: true,
    count: branches.length,
    data: branches
  });
});

// @desc    Create new branch
// @route   POST /api/branches
// @access  Private/Admin
const createBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.create(req.body);
  
  res.status(201).json({
    success: true,
    data: branch
  });
});

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private/Admin
const updateBranch = asyncHandler(async (req, res) => {
  let branch = await Branch.findById(req.params.id);
  
  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }
  
  branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.json({
    success: true,
    data: branch
  });
});

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private/Admin
const deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  
  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }
  
  await Branch.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Branch deleted successfully'
  });
});

// @desc    Update branch tables
// @route   PATCH /api/branches/:id/tables
// @access  Private/Admin
const updateTables = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  
  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }
  
  branch.tables = req.body.tables;
  await branch.save();
  
  res.json({
    success: true,
    data: branch
  });
});

// @desc    Update branch status
// @route   PATCH /api/branches/:id/status
// @access  Private/Admin
const updateBranchStatus = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  
  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }
  
  branch.isActive = req.body.isActive;
  await branch.save();
  
  res.json({
    success: true,
    data: branch
  });
});

// @desc    Check table availability
// @route   POST /api/branches/:id/check-availability
// @access  Public
const checkTableAvailability = asyncHandler(async (req, res) => {
  const { date, time, partySize, duration = 120 } = req.body;
  
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }
  
  // Check if branch is open at requested time
  const requestedTime = time.substring(0, 5);
  if (requestedTime < branch.operatingHours.open || requestedTime > branch.operatingHours.close) {
    return res.json({
      success: true,
      available: false,
      message: 'Branch is closed at the requested time'
    });
  }
  
  // Get available tables that can accommodate party size
  const availableTables = branch.tables.filter(table => 
    table.isAvailable && 
    table.capacity >= partySize
  );
  
  res.json({
    success: true,
    available: availableTables.length > 0,
    availableTables: availableTables,
    branchHours: branch.operatingHours
  });
});

module.exports = {
  getAllBranches,
  getBranchById,
  getBranchesByCity,
  createBranch,
  updateBranch,
  deleteBranch,
  updateTables,
  updateBranchStatus,
  checkTableAvailability
};