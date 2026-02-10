/**
 * Validation utilities for Product Checker
 */

// Maximum file size in bytes (20MB)
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Allowed image formats
export const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  if (!ALLOWED_FORMATS.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid image format. Please use JPEG, PNG, or WebP.' 
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `Image is too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB.` 
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate base64 image string
 * @param {string} base64 - Base64 string
 * @returns {boolean}
 */
export function validateBase64Image(base64) {
  if (!base64 || typeof base64 !== 'string') {
    return false;
  }

  // Check if it's a data URL
  const dataUrlPattern = /^data:image\/(jpeg|jpg|png|webp);base64,/;
  return dataUrlPattern.test(base64);
}

/**
 * Get file size in MB
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Compress image if needed
 * Note: Always converts to JPEG format, which may lose transparency from PNG/WebP
 * @param {string} base64 - Base64 image string
 * @param {number} maxWidth - Maximum width (default: 1920)
 * @param {number} maxHeight - Maximum height (default: 1920)
 * @param {number} quality - Compression quality 0-1 (default: 0.85)
 * @returns {Promise<string>} - Compressed base64 image (JPEG format)
 */
export function compressImage(base64, maxWidth = 1920, maxHeight = 1920, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      console.log('[Validation] Image compressed:', {
        original: { width: img.width, height: img.height },
        compressed: { width, height },
        originalSize: base64.length,
        compressedSize: compressedBase64.length,
        reduction: Math.round((1 - compressedBase64.length / base64.length) * 100) + '%'
      });
      
      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = base64;
  });
}
