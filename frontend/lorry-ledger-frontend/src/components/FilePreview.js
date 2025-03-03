// FilePreview.js component
import React, { useState } from 'react';

const FilePreview = ({ fileUrl, fileName, className }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Function to determine file type from URL or file name
  const getFileType = () => {
    if (!fileUrl) return 'unknown';
    
    // Check file extension from URL
    const extension = fileUrl.split('.').pop().toLowerCase();
    
    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return 'image';
    }
    
    // PDF
    if (extension === 'pdf') {
      return 'pdf';
    }
    
    // Documents
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension)) {
      return 'document';
    }
    
    // Default unknown type
    return 'unknown';
  };

  // If no file URL, show empty state
  if (!fileUrl) {
    return (
      <div className={`flex items-center justify-center p-4 bg-gray-100 rounded-md ${className || ''}`}>
        <p className="text-gray-500">No file available</p>
      </div>
    );
  }

  const fileType = getFileType();
  const displayName = fileName || fileUrl.split('/').pop();

  // File Preview Modal
  const FilePreviewModal = () => {
    if (!isPreviewOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] backdrop-blur-sm">
        <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-4xl max-h-[90vh] w-[90vw] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">{displayName}</h3>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {fileType === 'image' ? (
              <img 
                src={fileUrl} 
                alt={displayName} 
                className="max-w-full max-h-full object-contain"
              />
            ) : fileType === 'pdf' ? (
              <iframe 
                src={fileUrl} 
                title={displayName}
                className="w-full h-full border-0" 
              />
            ) : (
              <div className="text-center p-8">
                <div className="bg-blue-50 p-4 rounded-full mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                  <svg className="h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-4">This file type cannot be previewed directly.</p>
                <a 
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors inline-block"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
          
          <div className="border-t p-4 flex justify-end">
            <a 
              href={fileUrl}
              download={displayName}
              className="px-4 py-2 text-primary hover:text-primary-dark text-sm font-medium"
            >
              Download
            </a>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="ml-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className={`rounded-md overflow-hidden border border-gray-200 ${className || ''}`}
        onClick={() => setIsPreviewOpen(true)}
      >
        {fileType === 'image' ? (
          // Image preview
          <div className="flex flex-col cursor-pointer">
            <div className="relative overflow-hidden" style={{ maxHeight: '160px' }}>
              <img 
                src={fileUrl} 
                alt={displayName}
                className="w-full object-cover" 
              />
            </div>
            <div className="p-2 flex justify-between items-center bg-gray-50">
              <span className="text-sm text-gray-700 truncate max-w-xs">{displayName}</span>
              <button 
                type="button"
                className="text-primary hover:text-primary-dark text-sm font-medium ml-2"
              >
                View
              </button>
            </div>
          </div>
        ) : fileType === 'pdf' ? (
          // PDF preview
          <div className="flex items-center p-3 bg-gray-50 cursor-pointer">
            <div className="bg-red-50 p-2 rounded-md text-red-600 mr-3">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-grow truncate">
              <span className="text-sm text-gray-700 truncate block">{displayName}</span>
              <span className="text-xs text-gray-500">PDF Document</span>
            </div>
            <button 
              type="button"
              className="text-primary hover:text-primary-dark text-sm font-medium ml-2"
            >
              View
            </button>
          </div>
        ) : (
          // Generic document preview
          <div className="flex items-center p-3 bg-gray-50 cursor-pointer">
            <div className="bg-blue-50 p-2 rounded-md text-blue-600 mr-3">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-grow truncate">
              <span className="text-sm text-gray-700 truncate block">{displayName}</span>
              <span className="text-xs text-gray-500">Document</span>
            </div>
            <button 
              type="button"
              className="text-primary hover:text-primary-dark text-sm font-medium ml-2"
            >
              View
            </button>
          </div>
        )}
      </div>
      
      <FilePreviewModal />
    </>
  );
};

export default FilePreview;