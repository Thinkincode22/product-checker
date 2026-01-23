import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

const ImageUploader = ({ label, onImageSelect, selectedImage }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageSelect(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = (e) => {
        e.stopPropagation();
        onImageSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            className="flex-1 min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 relative overflow-hidden group"
            onClick={() => fileInputRef.current.click()}
        >
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                capture="environment"
            />

            {selectedImage ? (
                <>
                    <img
                        src={selectedImage}
                        alt={label}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">Change Photo</span>
                    </div>
                    <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
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
                    <span className="text-xs text-gray-500 mt-1">Tap to take photo</span>
                </>
            )}
        </div>
    );
};

export default ImageUploader;
