import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Download, X, FileText, FileJson, FileSpreadsheet, File } from 'lucide-react';
import { exportAsHTML, exportAsJSON, exportAsCSV, exportAsText, getExportFormats } from '../utils/export';

const ExportModal = ({ isOpen, onClose, result, image1, image2 }) => {
  const [selectedFormat, setSelectedFormat] = useState('html');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  if (!isOpen) return null;

  const handleExport = () => {
    setExporting(true);
    setExportError(null);
    
    try {
      switch (selectedFormat) {
        case 'html':
          exportAsHTML(result, image1, image2);
          break;
        case 'json':
          exportAsJSON(result);
          break;
        case 'csv':
          exportAsCSV(result);
          break;
        case 'txt':
          exportAsText(result);
          break;
        default:
          console.warn('[Export] Unknown format:', selectedFormat);
      }
      
      // Close modal after successful export
      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('[Export] Error:', error);
      setExportError('Failed to export results. Please try again.');
      setExporting(false);
    }
  };

  const getIcon = (format) => {
    switch (format) {
      case 'html': return <FileText size={24} />;
      case 'json': return <FileJson size={24} />;
      case 'csv': return <FileSpreadsheet size={24} />;
      case 'txt': return <File size={24} />;
      default: return <Download size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Download size={20} />
            Export Results
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Choose a format to export your analysis results:
        </p>

        <div className="space-y-2 mb-6">
          {getExportFormats().map(format => (
            <button
              key={format.value}
              onClick={() => setSelectedFormat(format.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedFormat === format.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{format.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{format.label}</div>
                  <div className="text-xs text-gray-600">{format.description}</div>
                </div>
                {selectedFormat === format.value && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {exportError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {exportError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
              exporting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                {getIcon(selectedFormat)}
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  result: PropTypes.object.isRequired,
  image1: PropTypes.string,
  image2: PropTypes.string,
};

export default ExportModal;
