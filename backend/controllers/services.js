const ServiceRequest = require('../models/ServiceRequest');
const { sendServiceRequestEmail } = require('../utils/email');
const adminNotificationService = require('../services/adminNotificationService');

// Submit service request
const submitServiceRequest = async (req, res) => {
  try {
    const {
      serviceType,
      name,
      email,
      phone,
      projectType,
      description,
      budget,
      timeline,
      requirements
    } = req.body;

    // Validate required fields
    if (!serviceType || !name || !email || !phone || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create service request
    const serviceRequest = new ServiceRequest({
      serviceType,
      name,
      email,
      phone,
      projectType,
      description,
      budget,
      timeline,
      requirements,
      status: 'pending'
    });

    await serviceRequest.save();

    // Send email to user
    try {
      await sendServiceRequestEmail(serviceRequest);
    } catch (emailError) {
      console.error('Failed to send confirmation email to user:', emailError);
    }

    // Send project request notification to configured admin recipients
    try {
      await adminNotificationService.sendProjectRequestNotification({
        _id: serviceRequest._id,
        title: `${serviceRequest.serviceType} - ${serviceRequest.projectType || 'Service Request'}`,
        customerName: serviceRequest.name,
        email: serviceRequest.email,
        phone: serviceRequest.phone,
        name: serviceRequest.name,
        description: serviceRequest.description,
        serviceType: serviceRequest.serviceType,
        projectType: serviceRequest.projectType,
        budget: serviceRequest.budget,
        timeline: serviceRequest.timeline,
        requirements: serviceRequest.requirements,
        requestNumber: serviceRequest.requestNumber
      });
    } catch (notificationError) {
      console.error('Failed to send project request notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully',
      data: {
        requestId: serviceRequest._id,
        serviceType: serviceRequest.serviceType
      }
    });

  } catch (error) {
    console.error('Error submitting service request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit service request'
    });
  }
};

// Get all service requests (admin only)
const getAllServiceRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, serviceType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;

    const serviceRequests = await ServiceRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await ServiceRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        serviceRequests,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalRequests: count
      }
    });

  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests'
    });
  }
};

// Get service request by ID (admin only)
const getServiceRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceRequest = await ServiceRequest.findById(id);
    
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.json({
      success: true,
      data: serviceRequest
    });

  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service request'
    });
  }
};

// Update service request status (admin only)
const updateServiceRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const serviceRequest = await ServiceRequest.findByIdAndUpdate(
      id,
      { 
        status,
        adminNotes,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.json({
      success: true,
      message: 'Service request status updated successfully',
      data: serviceRequest
    });

  } catch (error) {
    console.error('Error updating service request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service request status'
    });
  }
};

module.exports = {
  submitServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus
}; 