const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: true,
    enum: ['3d-printing', 'drone-services', 'project-building']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  projectType: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    type: String,
    trim: true
  },
  timeline: {
    type: String,
    trim: true
  },
  requirements: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  requestNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate request number before saving
serviceRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const count = await mongoose.model('ServiceRequest').countDocuments();
    this.requestNumber = `SR${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for service type display name
serviceRequestSchema.virtual('serviceTypeDisplay').get(function() {
  const displayNames = {
    '3d-printing': '3D Printing',
    'drone-services': 'Drone Services',
    'project-building': 'Project Building'
  };
  return displayNames[this.serviceType] || this.serviceType;
});

// Virtual for status display name
serviceRequestSchema.virtual('statusDisplay').get(function() {
  const statusNames = {
    'pending': 'Pending',
    'reviewing': 'Under Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'completed': 'Completed'
  };
  return statusNames[this.status] || this.status;
});

// Ensure virtuals are included in JSON output
serviceRequestSchema.set('toJSON', { virtuals: true });
serviceRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema); 