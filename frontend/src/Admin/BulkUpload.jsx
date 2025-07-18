import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiUpload, 
  FiDownload, 
  FiFile, 
  FiX, 
  FiCheck, 
  FiAlertCircle,
  FiRefreshCw,
  FiTrash2
} from 'react-icons/fi';
import { bulkUploadAPI } from '../services/apiServices';

const BulkUpload = ({ onClose, onSuccess }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setCsvFile(file);
    setResults(null);
    setShowResults(false);
  };

  const removeFile = () => {
    setCsvFile(null);
    setResults(null);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await bulkUploadAPI.downloadTemplate();
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulk-product-upload-template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  const exportProducts = async () => {
    try {
      const response = await bulkUploadAPI.exportProducts();
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `products-export-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Products exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export products');
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await bulkUploadAPI.uploadProducts(
        csvFile,
        (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      );

      if (response.success) {
        setResults(response.data);
        setShowResults(true);
        
        if (response.data.successful > 0) {
          toast.success(
            `Successfully uploaded ${response.data.successful} products${
              response.data.failed > 0 ? ` (${response.data.failed} failed)` : ''
            }`
          );
          onSuccess && onSuccess();
        } else {
          toast.error('No products were uploaded successfully');
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload products: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bulk Product Upload</h2>
              <p className="text-gray-600 mt-1">Upload multiple products using CSV file</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!showResults ? (
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
                  <li>Download the CSV template below</li>
                  <li>Fill in your product data following the template format</li>
                  <li>For specifications: use format "Name1:Value1|Name2:Value2"</li>
                  <li>For features: use format "Feature1|Feature2|Feature3"</li>
                  <li>For tags: use format "tag1,tag2,tag3"</li>
                  <li>For images: use format "url1,url2,url3" (max 5 images)</li>
                  <li>For dimensions: use separate columns for length, width, height, weight</li>
                  <li>Boolean fields (isFeatured, isActive): use true/false or 1/0</li>
                  <li>Upload the completed CSV file</li>
                  <li>Review the results and fix any errors if needed</li>
                </ol>
              </div>

              {/* Field Descriptions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Required Fields:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-800">
                  <div><strong>name:</strong> Product name (max 100 chars)</div>
                  <div><strong>description:</strong> Product description (max 2000 chars)</div>
                  <div><strong>price:</strong> Current selling price</div>
                  <div><strong>category:</strong> Must match existing category name</div>
                  <div><strong>stock:</strong> Available quantity</div>
                </div>
                <h3 className="font-semibold text-yellow-900 mb-2 mt-3">Optional Fields:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-800">
                  <div><strong>originalPrice:</strong> Original price before discount</div>
                  <div><strong>discount:</strong> Discount percentage (0-100)</div>
                  <div><strong>brand:</strong> Product brand name</div>
                  <div><strong>lowStockThreshold:</strong> Low stock alert level</div>
                  <div><strong>warranty:</strong> Warranty information</div>
                  <div><strong>dimensions_*:</strong> Product dimensions in cm/grams</div>
                </div>
              </div>

              {/* Template Download */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">CSV Template & Export</h3>
                    <p className="text-gray-600 text-sm">Download template or export existing products</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Download Template</span>
                  </button>
                  <button
                    onClick={exportProducts}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Export Current Products</span>
                  </button>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Upload CSV File</h3>
                
                {!csvFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your CSV file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-gray-500 text-sm">CSV files up to 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FiFile className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">{csvFile.name}</p>
                          <p className="text-green-700 text-sm">{formatFileSize(csvFile.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Results */
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiFile className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{results.total}</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Successful</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">{results.successful}</p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiAlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mt-1">{results.failed}</p>
                </div>
              </div>

              {/* Successfully Created Products */}
              {results.createdProducts && results.createdProducts.length > 0 && (
                <div className="border border-green-200 rounded-lg">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                    <h3 className="font-semibold text-green-900">Successfully Created Products</h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {results.createdProducts.map((product, index) => (
                      <div key={index} className="px-4 py-3 border-b border-green-100 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-900">{product.name}</p>
                            <p className="text-green-700 text-sm">SKU: {product.sku}</p>
                          </div>
                          <span className="text-green-600 text-sm">Row {product.row}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {results.errors && results.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                    <h3 className="font-semibold text-red-900">Errors</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="px-4 py-3 border-b border-red-100 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-red-900">
                              Row {error.row}: {error.product}
                            </p>
                            <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                              {error.errors.map((err, errIndex) => (
                                <li key={errIndex}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end space-x-3">
            {!showResults ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!csvFile || uploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiUpload className="w-4 h-4" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Upload Products'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setResults(null);
                    setCsvFile(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
