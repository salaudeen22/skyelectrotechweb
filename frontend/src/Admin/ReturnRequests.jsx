import React, { useState, useEffect, useCallback } from 'react';
import { FiEye, FiCheck, FiX, FiClock, FiPackage, FiUser, FiCalendar, FiFilter } from 'react-icons/fi';
import { ordersAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';

const ReturnRequests = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupRequest, setPickupRequest] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  // UI polish
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  // Enhanced filters & pagination
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchReturnRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const response = await ordersAPI.getReturnRequests(params);
      setReturnRequests(response.data.returnRequests || []);
      const meta = response.data.meta || response.meta;
      if (meta) {
        const tp = meta.totalPages || (meta.total && meta.limit ? Math.ceil(meta.total / meta.limit) : 1) || 1;
        setTotalPages(tp);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching return requests:', error);
      toast.error('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchReturnRequests();
  }, [fetchReturnRequests]);

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

  const markReceived = async (requestId) => {
    try {
      setProcessingRequest(requestId);
      await ordersAPI.markReturnReceived(requestId, {});
      toast.success('Marked as received and refund processed if applicable');
      fetchReturnRequests();
      closeModal();
    } catch (error) {
      console.error('Error marking return as received:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as received');
    } finally {
      setProcessingRequest(null);
    }
  };

  const confirmPickup = async (requestId, date) => {
    try {
      setProcessingRequest(requestId);
      await ordersAPI.confirmReturnPickup(requestId, date ? { pickupDate: date } : {});
      toast.success('Pickup confirmed and email sent to user');
      fetchReturnRequests();
      closeModal();
    } catch (error) {
      console.error('Error confirming pickup:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm pickup');
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
    <div className="p-4 sm:p-6">
      <div className="space-y-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Return Requests</h1>
          <p className="text-gray-600 text-sm mt-1">Review and process customer return requests</p>
        </div>
        
        {/* Mobile-first search and controls */}
        <div className="space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search by customer name or email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
          
          <div className="flex items-center justify-between">
            <button
              className="sm:hidden inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <FiFilter className="w-4 h-4" />
              More Filters
            </button>
            <div className="text-sm text-gray-600 font-medium">Page {page} of {totalPages}</div>
          </div>

          {/* Desktop filters */}
          <div className="hidden sm:flex items-center flex-wrap gap-3">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => { setPage(1); setFilter(e.target.value); }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setPage(1); setDateFrom(e.target.value); }}
              className="border border-gray-300 rounded-lg px-2 py-2 text-sm min-w-[150px]"
              title="From"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setPage(1); setDateTo(e.target.value); }}
              className="border border-gray-300 rounded-lg px-2 py-2 text-sm min-w-[150px]"
              title="To"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
              title="Sort by"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile filters panel */}
      {filtersOpen && (
        <div className="sm:hidden mb-4 space-y-2 p-3 border rounded-lg bg-white">
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs text-gray-600">Status</label>
            <select
              value={filter}
              onChange={(e) => { setPage(1); setFilter(e.target.value); }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setPage(1); setDateFrom(e.target.value); }}
                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setPage(1); setDateTo(e.target.value); }}
                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs text-gray-600">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      )}

      {/* Status tabs (mobile-friendly quick filters) */}
      <div className="mb-4">
        <div className="flex overflow-x-auto scrollbar-hide space-x-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setPage(1); setFilter(t.id); }}
              className={`px-3 py-1.5 rounded-full text-sm border ${filter === t.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
              <div className="h-3 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No return requests found</h3>
          <p className="text-gray-600">There are no return requests matching your current filter.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {([...filteredRequests]
            .sort((a, b) => sortBy === 'newest' ? new Date(b.requestedAt) - new Date(a.requestedAt) : new Date(a.requestedAt) - new Date(b.requestedAt))
          ).map((request) => (
            <div
              key={request._id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                request.status === 'pending' ? 'border-l-yellow-400' : request.status === 'approved' ? 'border-l-green-500' : 'border-l-red-500'
              }`}
            >
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

              {/* Pickup & Order Status Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Pickup:</span>
                  {request.pickupScheduled ? (
                    <span className="ml-2 text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                      Scheduled {request.pickupDate ? `on ${new Date(request.pickupDate).toLocaleDateString()}` : ''}
                    </span>
                  ) : (
                    <span className="ml-2 text-sm text-gray-600">Not scheduled</span>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Order Status:</span>
                  <span className="ml-2 text-sm text-gray-700">
                    {request.order.orderStatus?.charAt(0).toUpperCase() + request.order.orderStatus?.slice(1)}
                  </span>
                  {request.status === 'approved' && (
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                      Awaiting pickup & receipt
                    </span>
                  )}
                </div>
                {request.deliveryPartner || request.trackingNumber ? (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Return Tracking:</span>
                    <span className="ml-2 text-sm text-gray-700">
                      {request.deliveryPartner || 'Partner N/A'} {request.trackingNumber ? `- ${request.trackingNumber}` : ''}
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">&nbsp;</div>
                )}
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

              {/* Order Total and Actions */}
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Order Total:</span> ₹{request.order.totalPrice}
                </div>
                
                {/* Mobile-friendly action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => openModal(request)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  
                  {request.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => processReturnRequest(request._id, 'approved')}
                        disabled={processingRequest === request._id}
                        className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 disabled:opacity-50 transition-colors"
                      >
                        <FiCheck className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => processReturnRequest(request._id, 'rejected')}
                        disabled={processingRequest === request._id}
                        className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 disabled:opacity-50 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                  
                  {request.status === 'approved' && !request.adminPickupConfirmed && (
                    <button
                      onClick={() => {
                        setPickupRequest(request);
                        setPickupDate(request.pickupDate ? new Date(request.pickupDate).toISOString().slice(0,10) : '');
                        setPickupModalOpen(true);
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>Confirm Pickup</span>
                    </button>
                  )}
                  
                  {request.status === 'approved' && request.adminPickupConfirmed && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <span className="px-3 py-2 rounded-lg bg-indigo-100 text-indigo-800 text-sm font-medium">Pickup Confirmed</span>
                      <button
                        onClick={() => markReceived(request._id)}
                        disabled={processingRequest === request._id}
                        className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 disabled:opacity-50 transition-colors"
                        title="Mark item received and process refund (if prepaid)"
                      >
                        <FiCheck className="w-4 h-4" />
                        <span>Mark Received</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700 px-3 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page >= totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
          >
            Next
          </button>
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

                {selectedRequest.status === 'approved' && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Next Steps</h3>
                    <p className="text-sm text-gray-700 mb-3">User can schedule pickup. After you receive the item, click below to finalize and refund (if prepaid).</p>
                    <div className="flex">
                      <button
                        onClick={() => markReceived(selectedRequest._id)}
                        disabled={processingRequest === selectedRequest._id}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark Received & Refund
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

      {/* Confirm Pickup Modal */}
      {pickupModalOpen && pickupRequest && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Confirm Pickup</h3>
              <button onClick={() => setPickupModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-xs text-gray-600">An email confirmation will be sent to the customer.</p>
            </div>
            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button onClick={() => setPickupModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button
                onClick={async () => {
                  await confirmPickup(pickupRequest._id, pickupDate);
                  setPickupModalOpen(false);
                }}
                disabled={processingRequest === pickupRequest._id}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnRequests; 