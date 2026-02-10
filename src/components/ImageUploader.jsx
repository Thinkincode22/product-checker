import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';
import { validateImageFile, compressImage } from '../utils/validation';
import { t } from '../utils/i18n';

const ImageUploader = ({ label, onImageSelect, selectedImage }) => {
    const fileInputRef = useRef(null);
    const [error, setError] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError(null);

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        setIsCompressing(true);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    // Compress image to reduce API costs and improve performance
                    const compressed = await compressImage(reader.result);
                    onImageSelect(compressed);
                } catch (err) {
                    console.error('[ImageUploader] Compression failed:', err);
                    // Fall back to original if compression fails
                    onImageSelect(reader.result);
                } finally {
                    setIsCompressing(false);
                }
            };
            reader.onerror = () => {
                setError(t('errorInvalidImage'));
                setIsCompressing(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('[ImageUploader] Error:', err);
            setError(t('errorInvalidImage'));
            setIsCompressing(false);
        }
    };

    const clearImage = (e) => {
        e.stopPropagation();
        onImageSelect(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex-1 min-h-[200px] flex flex-col gap-2">
            <div
                className="flex-1 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 relative overflow-hidden group"
                onClick={() => fileInputRef.current.click()}
                role="button"
                aria-label={label}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        fileInputRef.current.click();
                    }
                }}
            >
                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    capture="environment"
                    aria-label={`Upload ${label}`}
                />

                {isCompressing ? (
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <span className="text-sm text-gray-600">Compressing...</span>
                    </div>
                ) : selectedImage ? (
                    <>
                        <img
                            src={selectedImage}
                            alt={label}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-medium">{t('changePhoto')}</span>
                        </div>
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                            aria-label={`Clear ${label}`}
                        >
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-600">
                            <Camera size={24} />
                        </div>
                        <span className="font-semibold text-gray-700">{label}</span>
                        <span className="text-xs text-gray-500 mt-1">{t('tapToPhoto')}</span>
                    </>
                )}
            </div>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg text-xs flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

ImageUploader.propTypes = {
    label: PropTypes.string.isRequired,
    onImageSelect: PropTypes.func.isRequired,
    selectedImage: PropTypes.string,
};

export default ImageUploader;
