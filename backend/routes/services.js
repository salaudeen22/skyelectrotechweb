const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/services');

// Submit service request
router.post('/submit', servicesController.submitServiceRequest);

// Get all service requests (admin only)
router.get('/requests', servicesController.getAllServiceRequests);

// Get service request by ID (admin only)
router.get('/requests/:id', servicesController.getServiceRequestById);

// Update service request status (admin only)
router.patch('/requests/:id/status', servicesController.updateServiceRequestStatus);

module.exports = router; 