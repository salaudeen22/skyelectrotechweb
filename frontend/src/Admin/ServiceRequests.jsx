import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';
import { FiEye, FiEdit, FiFilter, FiSearch } from 'react-icons/fi';

const ServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    serviceType: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0
  });

  useEffect(() => {
    fetchServiceRequests();
  }, [pagination.currentPage, filters]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...filters
      };
      
      const response = await servicesAPI.getAllServiceRequests(params);
      
      if (response.success) {
        setServiceRequests(response.data.serviceRequests);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalRequests: response.data.totalRequests
        });
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast.error('Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus, adminNotes = '') => {
    try {
      const response = await servicesAPI.updateServiceRequestStatus(requestId, {
        status: newStatus,
        adminNotes
      });

      if (response.success) {
        toast.success('Service request status updated successfully');
        fetchServiceRequests();
        setShowModal(false);
        setSelectedRequest(null);
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating service request status:', error);
      toast.error('Failed to update service request status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'reviewing': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getServiceTypeDisplay = (type) => {
    const types = {
      '3d-printing': '3D Printing',
      'drone-services': 'Drone Services',
      'project-building': 'Project Building'
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const filteredRequests = serviceRequests.filter(request => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        request.name.toLowerCase().includes(searchTerm) ||
        request.email.toLowerCase().includes(searchTerm) ||
        request.requestNumber.toLowerCase().includes(searchTerm) ||
        request.description.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Service Requests</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and respond to service inquiries from customers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              className="px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Services</option>
              <option value="3d-printing">3D Printing</option>
              <option value="drone-services">Drone Services</option>
              <option value="project-building">Project Building</option>
            </select>

            <button
              onClick={() => {
                setFilters({ status: '', serviceType: '', search: '' });
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className="px-4 py-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{pagination.totalRequests}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">
            {serviceRequests.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {serviceRequests.filter(r => r.status === 'reviewing').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Under Review</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {serviceRequests.filter(r => r.status === 'approved').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Approved</div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{request.requestNumber}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {request.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getServiceTypeDisplay(request.serviceType)}
                    </span>
                    {request.projectType && (
                      <div className="text-sm text-gray-500">
                        {request.projectType}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.statusDisplay}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FiEye className="inline w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      <FiEdit className="inline w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredRequests.map((request) => (
          <div key={request._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Request Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">#{request.requestNumber}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.statusDisplay || request.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Customer</div>
              <div className="text-sm font-medium text-gray-900">{request.name}</div>
              <div className="text-xs text-gray-500">{request.email}</div>
              <div className="text-xs text-gray-500">{request.phone}</div>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Service Type</div>
                <div className="text-sm text-gray-900">{getServiceTypeDisplay(request.serviceType)}</div>
                {request.projectType && (
                  <div className="text-xs text-gray-500">{request.projectType}</div>
                )}
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Budget</div>
                <div className="text-sm text-gray-900">{request.budget || 'Not specified'}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</div>
              <p className="text-sm text-gray-700 line-clamp-2">{request.description}</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(request);
                  setShowModal(true);
                }}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 active:bg-blue-300"
              >
                <FiEye className="w-4 h-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(request);
                  setShowModal(true);
                }}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 active:bg-green-300"
              >
                <FiEdit className="w-4 h-4 mr-2" />
                Update Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiFilter className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-2">No service requests found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing page {pagination.currentPage} of {pagination.totalPages} 
              ({pagination.totalRequests} total requests)
            </div>
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>←</span>
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        page === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <span>→</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Service Request Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Service Request #{selectedRequest.requestNumber}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Customer Information</h4>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
                      <p className="text-sm"><span className="font-medium">Name:</span> {selectedRequest.name}</p>
                      <p className="text-sm"><span className="font-medium">Email:</span> {selectedRequest.email}</p>
                      <p className="text-sm"><span className="font-medium">Phone:</span> {selectedRequest.phone}</p>
                      <p className="text-sm"><span className="font-medium">Request Date:</span> {formatDate(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Service Details</h4>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
                      <p className="text-sm"><span className="font-medium">Service Type:</span> {getServiceTypeDisplay(selectedRequest.serviceType)}</p>
                      <p className="text-sm"><span className="font-medium">Project Type:</span> {selectedRequest.projectType || 'Not specified'}</p>
                      <p className="text-sm"><span className="font-medium">Budget:</span> {selectedRequest.budget || 'Not specified'}</p>
                      <p className="text-sm"><span className="font-medium">Timeline:</span> {selectedRequest.timeline || 'Not specified'}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.statusDisplay || selectedRequest.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Project Description</h4>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedRequest.description}</p>
                  </div>
                </div>

                {selectedRequest.requirements && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Additional Requirements</h4>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-sm leading-relaxed">{selectedRequest.requirements}</p>
                    </div>
                  </div>
                )}

                {selectedRequest.adminNotes && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Admin Notes</h4>
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-sm leading-relaxed">{selectedRequest.adminNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-xl">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Update Status</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  id="status-select"
                  className="flex-1 px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  defaultValue={selectedRequest.status}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
                
                <button
                  onClick={() => {
                    const newStatus = document.getElementById('status-select').value;
                    const adminNotes = prompt('Add admin notes (optional):');
                    handleStatusUpdate(selectedRequest._id, newStatus, adminNotes);
                  }}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests; 