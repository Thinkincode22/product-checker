import React, { useState, useRef } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import APIKeyModal from './components/APIKeyModal';
import { compareImages } from './utils/gemini';
import { drawBoxes, clearHeatmap } from './utils/drawHeatmap';
import { exportDiagnostics } from './utils/diagnostics';
import { processImageForAI, isOpenCVAvailable } from './utils/imageProcessing';

function App() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [useOpenCV] = useState(localStorage.getItem('use_opencv') === 'true');
  const image2ContainerRef = useRef(null);
  const image2Ref = useRef(null);

  const handleCompare = async () => {
    if (!image1 || !image2) {
      setError("Please take both photos first.");
      return;
    }
    if (!apiKey) {
      setError("Please set your API Key in settings.");
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    
    // Clear previous heatmap
    if (image2ContainerRef.current) {
      clearHeatmap(image2ContainerRef.current);
    }

    try {
      console.log('[App] Starting image comparison...');
      
      let img1 = image1;
      let img2 = image2;

      // Process images with OpenCV if enabled
      // Using non-blocking async processing
      if (useOpenCV && isOpenCVAvailable()) {
        console.log('[App] Processing images with OpenCV (non-blocking)...');
        try {
          // Process images in parallel, allowing UI to remain responsive
          const [processedImg1, processedImg2] = await Promise.all([
            processImageForAI(image1),
            processImageForAI(image2)
          ]);
          img1 = processedImg1;
          img2 = processedImg2;
          console.log('[App] Images processed successfully');
        } catch (err) {
          console.warn('[App] OpenCV processing failed, using original images:', err);
          // Fall back to original images
        }
      }

      const difference = await compareImages(apiKey, img1, img2);
      
      console.log('[App] Comparison result:', {
        hasMissing: difference.missing && difference.missing.length > 0,
        missingCount: difference.missing ? difference.missing.length : 0,
        missing: difference.missing,
        summary: difference.summary
      });

      setResult(difference);
      
      // Don't draw here - let onLoad of the image handle it
      // This prevents race conditions and ensures image is loaded first
    } catch (err) {
      console.error('[App] Error during comparison:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestDebugHeatmap = () => {
    if (!image2Ref.current || !image2ContainerRef.current) {
      console.warn('[Debug] Image ref not available');
      return;
    }

    console.log('[Debug] Drawing test heatmap...');
    console.log('[Debug] Image info:', {
      offsetWidth: image2Ref.current.offsetWidth,
      offsetHeight: image2Ref.current.offsetHeight,
      naturalWidth: image2Ref.current.naturalWidth,
      naturalHeight: image2Ref.current.naturalHeight,
    });

    // Draw a test box in the center
    const testBox = [
      image2Ref.current.naturalWidth * 0.2,
      image2Ref.current.naturalHeight * 0.2,
      image2Ref.current.naturalWidth * 0.4,
      image2Ref.current.naturalHeight * 0.4,
    ];

    drawBoxes(image2ContainerRef.current, image2Ref.current, [testBox]);
    console.log('[Debug] Test box drawn with coordinates:', testBox);
  };

  const handleExportDiagnostics = () => {
    if (!result || !image2Ref.current) {
      console.warn('[App] Result or image ref not available for diagnostics');
      return;
    }

    console.log('[App] Exporting diagnostics...');
    exportDiagnostics(result, image2Ref.current);
    console.log('[App] Diagnostics exported successfully');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-900 pb-20">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
          <CheckCircle className="text-blue-500" />
          Product Checker
        </h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Settings size={24} />
        </button>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        {/* API Key Warning */}
        {!apiKey && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3 cursor-pointer" onClick={() => setShowSettings(true)}>
            <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-yellow-800 font-medium">API Key Needed</p>
              <p className="text-xs text-yellow-600">Tap to configure Google Gemini API.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <ImageUploader
            label="1. Before (Stock)"
            selectedImage={image1}
            onImageSelect={setImage1}
          />
          <ImageUploader
            label="2. After (Check)"
            selectedImage={image2}
            onImageSelect={setImage2}
          />
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !image1 || !image2}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95
            ${loading || !image1 || !image2
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
            }`}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              Compare Photos
            </>
          )}
        </button>

        {/* Debug Button */}
        {result && result.missing && result.missing.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={handleTestDebugHeatmap}
              className="w-full py-2 px-4 rounded-lg text-sm bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200"
            >
              🧪 Test Heatmap (Debug)
            </button>
            <button
              onClick={handleExportDiagnostics}
              className="w-full py-2 px-4 rounded-lg text-sm bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200"
            >
              📊 Export Diagnostics
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-green-500 text-white p-3 font-semibold flex items-center gap-2">
              <CheckCircle size={20} />
              Analysis Result
            </div>
            <div className="p-4">
              <p className="text-gray-700 font-medium mb-3">{result.summary}</p>
              
              {result.missing && result.missing.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Missing Items ({result.missing.length}):</h3>
                  <ul className="space-y-3">
                    {result.missing.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700 border-l-4 border-red-500 pl-3 py-2 bg-red-50 rounded">
                        <div className="font-medium">{item.label}</div>
                        {item.box && (
                          <div className="text-xs text-gray-600 mt-1 font-mono">
                            Box: [{item.box[0]}, {item.box[1]}, {item.box[2]}, {item.box[3]}]
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      🔥 Red zones on the photo show where items are missing (scroll down to see)
                    </p>
                  </div>
                </div>
              )}
              
              {result.missing && result.missing.length === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">✓ No missing items detected - shelves are fully stocked!</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Heat-map visualization */}
        {result && result.missing && result.missing.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-purple-500 text-white p-3 font-semibold">
              🔥 Heat-map View (Missing Items)
            </div>
            <div 
              ref={image2ContainerRef}
              className="relative w-full bg-gray-200 rounded-b-xl overflow-hidden"
            >
              <img
                ref={image2Ref}
                src={image2}
                alt="Heat-map"
                className="w-full h-auto display-block"
                onLoad={() => {
                  console.log('[App] Image loaded, drawing heatmap...');
                  if (image2ContainerRef.current && image2Ref.current && result && result.missing && result.missing.length > 0) {
                    drawBoxes(
                      image2ContainerRef.current,
                      image2Ref.current,
                      result.missing.map(item => item.box)
                    );
                  }
                }}
              />
            </div>
          </div>
        )}
      </main>

      <APIKeyModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={setApiKey}
      />
    </div>
  );
}

export default App;
