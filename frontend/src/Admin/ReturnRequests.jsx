import React, { useState, useEffect } from 'react';
import { FiEye, FiCheck, FiX, FiClock, FiPackage, FiUser, FiCalendar, FiFilter } from 'react-icons/fi';
import { ordersAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';

const ReturnRequests = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getReturnRequests();
      setReturnRequests(response.data.returnRequests);
    } catch (error) {
      console.error('Error fetching return requests:', error);
      toast.error('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason) => {
    const reasons = {
      defective: 'Product is defective/damaged',
      wrong_item: 'Wrong item received',
      not_as_described: 'Product not as described',
      size_issue: 'Size doesn\'t fit',
      quality_issue: 'Quality not satisfactory',
      changed_mind: 'Changed my mind',
      duplicate_order: 'Duplicate order',
      other: 'Other reason'
    };
    return reasons[reason] || reason;
  };

  const getConditionLabel = (condition) => {
    const conditions = {
      good: 'Good - Like new condition',
      fair: 'Fair - Minor wear/tear',
      poor: 'Poor - Significant damage'
    };
    return conditions[condition] || condition;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'approved':
        return <FiCheck className="w-4 h-4" />;
      case 'rejected':
        return <FiX className="w-4 h-4" />;
      default:
        return <FiPackage className="w-4 h-4" />;
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const processReturnRequest = async (requestId, status, adminNotes = '') => {
    try {
      setProcessingRequest(requestId);
      await ordersAPI.processReturnRequest(requestId, { status, adminNotes });
      toast.success(`Return request ${status} successfully`);
      fetchReturnRequests(); // Refresh the list
      closeModal();
    } catch (error) {
      console.error('Error processing return request:', error);
      toast.error('Failed to process return request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const filteredRequests = returnRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No return requests found</h3>
          <p className="text-gray-600">There are no return requests matching your current filter.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{request.order.orderId}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Request #{request.requestNumber}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FiUser className="w-4 h-4" />
                      <span>{request.user.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Reason:</span>
                  <span className="ml-2 text-sm text-gray-600">
                    {getReasonLabel(request.reason)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Condition:</span>
                  <span className="ml-2 text-sm text-gray-600">
                    {getConditionLabel(request.condition)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Description:</span>
                <p className="mt-1 text-sm text-gray-600">{request.description}</p>
              </div>

              {request.images && request.images.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Images ({request.images.length})
                  </span>
                  <div className="flex space-x-2 mt-2">
                    {request.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Return evidence ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ))}
                    {request.images.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                        +{request.images.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Order Total:</span> ₹{request.order.totalPrice}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(request)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => processReturnRequest(request._id, 'approved')}
                        disabled={processingRequest === request._id}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        <FiCheck className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => processReturnRequest(request._id, 'rejected')}
                        disabled={processingRequest === request._id}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <FiX className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Return Request Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Order Information</h3>
                  <p className="text-sm text-gray-600">Order #{selectedRequest.order.orderId}</p>
                  <p className="text-sm text-gray-600">Request #{selectedRequest.requestNumber}</p>
                  <p className="text-sm text-gray-600">Customer: {selectedRequest.user.name}</p>
                  <p className="text-sm text-gray-600">Email: {selectedRequest.user.email}</p>
                  <p className="text-sm text-gray-600">
                    Requested: {new Date(selectedRequest.requestedAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Return Details</h3>
                  <p className="text-sm text-gray-600">
                    Reason: {getReasonLabel(selectedRequest.reason)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Condition: {getConditionLabel(selectedRequest.condition)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Description: {selectedRequest.description}
                  </p>
                </div>

                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Return Evidence Images ({selectedRequest.images.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {selectedRequest.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Return evidence ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Process Request</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => processReturnRequest(selectedRequest._id, 'approved')}
                        disabled={processingRequest === selectedRequest._id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve Return
                      </button>
                      <button
                        onClick={() => processReturnRequest(selectedRequest._id, 'rejected')}
                        disabled={processingRequest === selectedRequest._id}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject Return
                      </button>
                    </div>
                  </div>
                )}

                {selectedRequest.status !== 'pending' && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900">Processing Information</h3>
                    <p className="text-sm text-gray-600">
                      Status: {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </p>
                    {selectedRequest.adminNotes && (
                      <p className="text-sm text-gray-600">
                        Admin Notes: {selectedRequest.adminNotes}
                      </p>
                    )}
                    {selectedRequest.processedBy && (
                      <p className="text-sm text-gray-600">
                        Processed by: {selectedRequest.processedBy.name}
                      </p>
                    )}
                    {selectedRequest.processedAt && (
                      <p className="text-sm text-gray-600">
                        Processed at: {new Date(selectedRequest.processedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnRequests; 