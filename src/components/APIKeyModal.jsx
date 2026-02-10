import React, { useState, useEffect, startTransition, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Settings, Save, X, Zap, Globe } from 'lucide-react';
import { initializeOpenCV, isOpenCVAvailable } from '../utils/imageProcessing';
import { t, getLanguage, setLanguage, getAvailableLanguages } from '../utils/i18n';

const APIKeyModal = ({ isOpen, onClose, onSave }) => {
    const [key, setKey] = useState('');
    const [useOpenCV, setUseOpenCV] = useState(localStorage.getItem('use_opencv') === 'true');
    const [cvLoading, setCvLoading] = useState(false);
    const [cvAvailable, setCvAvailable] = useState(isOpenCVAvailable());
    const [cvProgress, setCvProgress] = useState(0);
    const [currentLang, setCurrentLang] = useState(getLanguage());

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

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setCurrentLang(lang);
        // Trigger re-render of parent by reloading
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Settings size={20} />
                        {t('settingsTitle')}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Language Selector */}
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                        <Globe size={18} className="text-blue-500" />
                        Language / Мова
                    </label>
                    <div className="flex gap-2">
                        {getAvailableLanguages().map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    currentLang === lang.code
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
                                }`}
                            >
                                {lang.nativeName}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    {t('enterApiKey')}
                    <br />
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 underline"
                        aria-label="Get a free API key (opens in new tab)"
                    >
                        {t('getFreeKey')}
                    </a>.
                </p>

                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder={t('apiKeyPlaceholder')}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="API Key"
                />

                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 font-semibold text-gray-700">
                            <Zap size={18} className="text-yellow-500" />
                            {t('enhanceQuality')}
                        </label>
                        <button
                            onClick={handleToggleOpenCV}
                            disabled={cvLoading}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                useOpenCV
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                            } ${cvLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                            aria-label={`OpenCV ${useOpenCV ? 'enabled' : 'disabled'}`}
                        >
                            {cvLoading ? `${t('loading')} ${Math.round(cvProgress)}%` : useOpenCV ? t('on') : t('off')}
                        </button>
                    </div>
                    <p className="text-xs text-gray-600">
                        {t('enhanceDescription')}
                    </p>
                    
                    {/* Progress bar while loading */}
                    {cvLoading && cvProgress > 0 && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${cvProgress}%` }}
                                role="progressbar"
                                aria-valuenow={cvProgress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                    )}
                    
                    {!cvAvailable && !useOpenCV && (
                        <p className="text-xs text-yellow-600 mt-2">
                            {t('downloadOpenCV')}
                        </p>
                    )}
                    {cvAvailable && (
                        <p className="text-xs text-green-600 mt-2">
                            {t('openCVReady')}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                    aria-label="Save settings"
                >
                    <Save size={18} />
                    {t('saveKey')}
                </button>
            </div>
        </div>
    );
};

APIKeyModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default APIKeyModal;
