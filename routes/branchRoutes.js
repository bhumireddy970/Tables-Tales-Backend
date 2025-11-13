const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
// const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', branchController.getAllBranches);
router.get('/:id', branchController.getBranchById);
router.get('/city/:city', branchController.getBranchesByCity);
router.post('/:id/check-availability', branchController.checkTableAvailability);

// Admin only routes
router.post('/',  branchController.createBranch);
router.put('/:id', branchController.updateBranch);
router.delete('/:id',  branchController.deleteBranch);
router.patch('/:id/tables',  branchController.updateTables);
router.patch('/:id/status',  branchController.updateBranchStatus);

module.exports = router;