/**
 * Image Processing Utilities using OpenCV.js
 * Enhances image quality before sending to Gemini API
 * 
 * OPTIMIZATION: Non-blocking, async initialization to avoid UI freezing
 */

let cv = null;
let cvInitPromise = null;

/**
 * Initialize OpenCV asynchronously
 * - Uses Web Worker pattern to avoid blocking UI
 * - Caches result to avoid re-loading
 * - Returns when OpenCV is ready
 */
export async function initializeOpenCV() {
  // Return cached promise if already loading/loaded
  if (cvInitPromise) {
    return cvInitPromise;
  }

  // Check if already loaded
  if (window.cv && window.cv.Mat) {
    cv = window.cv;
    console.log('[OpenCV] Already initialized');
    return cv;
  }

  // Create initialization promise
  cvInitPromise = new Promise((resolve, reject) => {
    // Safety timeout - if OpenCV doesn't load in 30 seconds, fail
    const timeoutId = setTimeout(() => {
      console.error('[OpenCV] Loading timeout');
      reject(new Error('OpenCV.js loading timeout'));
    }, 30000);

    // Define callback BEFORE loading script
    window.onOpenCVReady = () => {
      clearTimeout(timeoutId);
      cv = window.cv;
      console.log('[OpenCV] Successfully loaded and ready');
      
      // Use requestIdleCallback to not block if available
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          resolve(cv);
        });
      } else {
        // Fallback to setTimeout for older browsers
        setTimeout(() => {
          resolve(cv);
        }, 0);
      }
    };

    // Create and load script
    const script = document.createElement('script');
    script.async = true;
    script.onerror = () => {
      clearTimeout(timeoutId);
      console.error('[OpenCV] Failed to load script');
      reject(new Error('Failed to load OpenCV.js'));
    };
    // Use OpenCV.js with onRuntimeInitialized built-in
    script.src = 'https://docs.opencv.org/4.5.0/opencv.js';
    document.head.appendChild(script);
  });

  try {
    await cvInitPromise;
    return cv;
  } catch (error) {
    cvInitPromise = null; // Reset so next attempt can try again
    throw error;
  }
}

/**
 * Check if OpenCV is available
 */
export function isOpenCVAvailable() {
  return window.cv && window.cv.Mat;
}

/**
 * Convert base64 image to canvas
 */
function base64ToCanvas(base64) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

/**
 * Convert canvas to base64
 */
function canvasToBase64(canvas) {
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Покращити якість зображення
 * - CLAHE контраст
 * - Bilateral фільтр (шум)
 * - Unsharp маска (різкість)
 */
export async function enhanceImage(imageBase64) {
  try {
    if (!isOpenCVAvailable()) {
      console.warn('[ImageProcessing] OpenCV недоступний');
      return imageBase64;
    }

    console.log('[ImageProcessing] Обробка розпочалась');
    const startTime = performance.now();

    const canvas = await base64ToCanvas(imageBase64);
    const src = cv.imread(canvas);
    const dst = new cv.Mat();

    // 1. CLAHE - контраст
    const lab = new cv.Mat();
    cv.cvtColor(src, lab, cv.COLOR_RGB2Lab);
    
    const channels = new cv.MatVector();
    cv.split(lab, channels);
    
    const l = channels.get(0);
    const clahe = cv.createCLAHE(2.0, new cv.Size(8, 8));
    clahe.apply(l, l);
    
    cv.merge(channels, lab);
    cv.cvtColor(lab, dst, cv.COLOR_Lab2RGB);

    // 2. Bilateral - шум
    const denoised = new cv.Mat();
    cv.bilateralFilter(dst, denoised, 9, 75, 75);

    // 3. Unsharp - різкість
    const blurred = new cv.Mat();
    cv.GaussianBlur(denoised, blurred, new cv.Size(0, 0), 2);
    
    const sharpened = new cv.Mat();
    cv.addWeighted(denoised, 1.5, blurred, -0.5, 0, sharpened);

    cv.imshow(canvas, sharpened);
    const enhancedBase64 = canvasToBase64(canvas);

    // Очистити пам'ять
    src.delete();
    dst.delete();
    lab.delete();
    channels.delete();
    l.delete();
    clahe.delete();
    denoised.delete();
    blurred.delete();
    sharpened.delete();

    const duration = performance.now() - startTime;
    console.log(`[ImageProcessing] Завершено за ${duration.toFixed(0)}ms`);
    return enhancedBase64;
  } catch (error) {
    console.error('[ImageProcessing] Помилка:', error);
    return imageBase64;
  }
}

/**
 * Extract product contours using edge detection
 * Useful for identifying shelf items
 */
export async function extractContours(imageBase64) {
  try {
    if (!isOpenCVAvailable()) {
      console.warn('[ImageProcessing] OpenCV not available');
      return null;
    }

    console.log('[ImageProcessing] Extracting contours...');

    const canvas = await base64ToCanvas(imageBase64);
    const src = cv.imread(canvas);
    
    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGB2GRAY);

    // Apply Canny edge detection
    const edges = new cv.Mat();
    cv.Canny(gray, edges, 50, 150);

    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    // Draw contours on original image
    const dst = src.clone();
    cv.drawContours(dst, contours, -1, new cv.Scalar(0, 255, 0, 255), 2);

    cv.imshow(canvas, dst);
    const contouredBase64 = canvasToBase64(canvas);

    // Extract bounding rectangles
    const boundingBoxes = [];
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      
      // Only keep significant contours
      if (area > 1000) {
        const rect = cv.boundingRect(contour);
        boundingBoxes.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          area
        });
      }
    }

    // Clean up
    src.delete();
    gray.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
    dst.delete();

    console.log('[ImageProcessing] Found', boundingBoxes.length, 'contours');
    
    return {
      image: contouredBase64,
      boundingBoxes: boundingBoxes.sort((a, b) => b.area - a.area)
    };
  } catch (error) {
    console.error('[ImageProcessing] Error extracting contours:', error);
    return null;
  }
}

/**
 * Resize image to optimal size for API
 * Balances quality and performance
 */
export async function resizeImage(imageBase64, maxWidth = 2048, maxHeight = 2048) {
  try {
    console.log('[ImageProcessing] Resizing image...');

    const canvas = await base64ToCanvas(imageBase64);
    let width = canvas.width;
    let height = canvas.height;

    // Calculate new dimensions
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const src = cv.imread(canvas);
      const dst = new cv.Mat();
      
      const newSize = new cv.Size(width, height);
      cv.resize(src, dst, newSize, 0, 0, cv.INTER_AREA);

      // Create new canvas with resized image
      const newCanvas = document.createElement('canvas');
      newCanvas.width = width;
      newCanvas.height = height;
      
      cv.imshow(newCanvas, dst);
      const resizedBase64 = canvasToBase64(newCanvas);

      src.delete();
      dst.delete();

      console.log('[ImageProcessing] Resized to', width, 'x', height);
      return resizedBase64;
    }

    return imageBase64;
  } catch (error) {
    console.error('[ImageProcessing] Error resizing image:', error);
    return imageBase64;
  }
}

/**
 * Apply adaptive histogram equalization
 * Improves details in dark and bright areas
 */
export async function improveDetails(imageBase64) {
  try {
    if (!isOpenCVAvailable()) {
      console.warn('[ImageProcessing] OpenCV not available');
      return imageBase64;
    }

    console.log('[ImageProcessing] Improving details...');

    const canvas = await base64ToCanvas(imageBase64);
    const src = cv.imread(canvas);
    
    // Convert to LAB color space
    const lab = new cv.Mat();
    cv.cvtColor(src, lab, cv.COLOR_RGB2Lab);

    // Split channels
    const channels = new cv.MatVector();
    cv.split(lab, channels);

    // Apply CLAHE to L channel
    const l = channels.get(0);
    const clahe = cv.createCLAHE(4.0, new cv.Size(8, 8));
    clahe.apply(l, l);

    // Merge and convert back
    cv.merge(channels, lab);
    const dst = new cv.Mat();
    cv.cvtColor(lab, dst, cv.COLOR_Lab2RGB);

    cv.imshow(canvas, dst);
    const improvedBase64 = canvasToBase64(canvas);

    // Clean up
    src.delete();
    lab.delete();
    channels.delete();
    l.delete();
    clahe.delete();
    dst.delete();

    console.log('[ImageProcessing] Details improved');
    return improvedBase64;
  } catch (error) {
    console.error('[ImageProcessing] Error improving details:', error);
    return imageBase64;
  }
}

/**
 * Full pipeline: enhance and resize
 */
export async function processImageForAI(imageBase64) {
  try {
    console.log('[ImageProcessing] Starting full processing pipeline...');

    let processed = imageBase64;

    // Try to enhance if OpenCV is available
    if (isOpenCVAvailable()) {
      processed = await enhanceImage(processed);
    } else {
      console.warn('[ImageProcessing] OpenCV not available, skipping enhancement');
    }

    // Always resize to optimal size
    processed = await resizeImage(processed, 2048, 2048);

    console.log('[ImageProcessing] Processing complete');
    return processed;
  } catch (error) {
    console.error('[ImageProcessing] Error in processing pipeline:', error);
    return imageBase64;
  }
}
