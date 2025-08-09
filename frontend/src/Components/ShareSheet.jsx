import React, { useState, useCallback, useEffect } from 'react';
import { FiShare2, FiX } from 'react-icons/fi';
import ShareButtons from './ShareButtons';

const ShareSheet = ({ title, description, image, url, className = '' }) => {
  const [open, setOpen] = useState(false);

  const closeOnEscape = useCallback((e) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', closeOnEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [open, closeOnEscape]);

  return (
    <>
      {/* Floating Share Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share"
        className={`fixed bottom-5 right-5 z-40 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition transform focus:outline-none focus:ring-4 focus:ring-blue-300 p-4 ${className}`}
      >
        <FiShare2 className="w-6 h-6" />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed left-0 right-0 bottom-0 z-50 transform transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="mx-auto max-w-2xl rounded-t-2xl bg-white shadow-2xl">
          {/* Handle */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-2 pb-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Share this product</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close share"
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            <ShareButtons
              title={title}
              description={description}
              image={image}
              url={url}
              size="lg"
              className="justify-between flex-wrap"
              onShare={() => setOpen(false)}
            />

            {/* Preview */}
            <div className="mt-5 flex items-center gap-4 p-3 border rounded-xl bg-gray-50">
              {image ? (
                <img src={image} alt={title} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{title}</div>
                <div className="text-xs text-gray-500 truncate">{url}</div>
              </div>
            </div>

            <div className="h-4" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareSheet;


