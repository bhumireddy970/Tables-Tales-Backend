const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');


// Public routes
router.post('/', reservationController.createReservation);
router.get('/verify/:code', reservationController.verifyReservation);
router.post('/availability', reservationController.checkAvailability);

// Customer routes (protected)
router.get('/my-reservations',  reservationController.getMyReservations);
router.get('/my-reservations/:id',  reservationController.getMyReservation);
router.put('/my-reservations/:id',  reservationController.updateMyReservation);
router.delete('/my-reservations/:id', reservationController.cancelMyReservation);

// Admin/Staff routes
router.get('/', reservationController.getAllReservations);
router.get('/branch/:branchId', reservationController.getBranchReservations);
router.get('/:id',  reservationController.getReservationById);
router.put('/:id', reservationController.updateReservation);
router.patch('/:id/status',  reservationController.updateReservationStatus);
router.delete('/:id',  reservationController.deleteReservation);

// Dashboard routes
router.get('/dashboard/stats',  reservationController.getReservationStats);
router.get('/dashboard/upcoming',  reservationController.getUpcomingReservations);

module.exports = router;