import React, { useState, useEffect, startTransition, useCallback } from 'react';
import { Settings, Save, X, Zap } from 'lucide-react';
import { initializeOpenCV, isOpenCVAvailable } from '../utils/imageProcessing';

const APIKeyModal = ({ isOpen, onClose, onSave }) => {
    const [key, setKey] = useState('');
    const [useOpenCV, setUseOpenCV] = useState(localStorage.getItem('use_opencv') === 'true');
    const [cvLoading, setCvLoading] = useState(false);
    const [cvAvailable, setCvAvailable] = useState(isOpenCVAvailable());
    const [cvProgress, setCvProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const savedKey = localStorage.getItem('gemini_api_key');
            startTransition(() => {
                setKey(savedKey || '');
            });
        }
    }, [isOpen]);

    const handleToggleOpenCV = useCallback(async () => {
        setCvLoading(true);
        setCvProgress(0);
        try {
            if (!cvAvailable) {
                console.log('[Settings] Initializing OpenCV...');
                
                // Simulate progress updates (OpenCV loading happens in background)
                const progressInterval = setInterval(() => {
                    setCvProgress(prev => Math.min(prev + Math.random() * 30, 90));
                }, 300);
                
                // Initialize OpenCV without blocking UI
                await initializeOpenCV();
                clearInterval(progressInterval);
                setCvProgress(100);
                
                setCvAvailable(true);
                console.log('[Settings] OpenCV initialized successfully');
            }
            
            // Use startTransition to batch state updates
            startTransition(() => {
                const newValue = !useOpenCV;
                setUseOpenCV(newValue);
                localStorage.setItem('use_opencv', newValue.toString());
            });
        } catch (error) {
            console.error('[Settings] Failed to initialize OpenCV:', error);
            alert('Failed to load OpenCV. Image enhancement will be disabled.');
            startTransition(() => {
                setUseOpenCV(false);
                localStorage.setItem('use_opencv', 'false');
            });
        } finally {
            setCvLoading(false);
            setCvProgress(0);
        }
    }, [cvAvailable, useOpenCV]);

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', key);
        onSave(key);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Settings size={20} />
                        Settings
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Enter your Gemini API Key to enable image comparison.
                    <br />
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-500 underline">Get a free key here</a>.
                </p>

                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 font-semibold text-gray-700">
                            <Zap size={18} className="text-yellow-500" />
                            Enhance Image Quality
                        </label>
                        <button
                            onClick={handleToggleOpenCV}
                            disabled={cvLoading}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                useOpenCV
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                            } ${cvLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                        >
                            {cvLoading ? `Loading... ${cvProgress}%` : useOpenCV ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-600">
                        Use OpenCV.js to enhance image quality before analysis (increases accuracy)
                    </p>
                    
                    {/* Progress bar while loading */}
                    {cvLoading && cvProgress > 0 && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${cvProgress}%` }}
                            ></div>
                        </div>
                    )}
                    
                    {!cvAvailable && !useOpenCV && (
                        <p className="text-xs text-yellow-600 mt-2">
                            ⚠️ Click ON to download OpenCV (8 MB)
                        </p>
                    )}
                    {cvAvailable && (
                        <p className="text-xs text-green-600 mt-2">
                            ✓ OpenCV ready
                        </p>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    Save Key
                </button>
            </div>
        </div>
    );
};

export default APIKeyModal;
