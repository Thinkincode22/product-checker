/**
 * Internationalization utility for Product Checker
 * Supports Ukrainian and English languages
 */

const translations = {
  uk: {
    // Header
    appTitle: 'Перевірка Товарів',
    settings: 'Налаштування',
    
    // API Key Warning
    apiKeyNeeded: 'Потрібен API ключ',
    apiKeyTapConfig: 'Натисніть для налаштування Google Gemini API',
    
    // Image Upload
    uploadBefore: '1. До (Склад)',
    uploadAfter: '2. Після (Перевірка)',
    tapToPhoto: 'Натисніть, щоб зробити фото',
    changePhoto: 'Змінити фото',
    
    // Compare Button
    comparePhotos: 'Порівняти фотографії',
    comparing: 'Порівнюю...',
    
    // Errors
    errorBothPhotos: 'Будь ласка, зробіть обидві фотографії спочатку.',
    errorApiKey: 'Будь ласка, встановіть ваш API ключ у налаштуваннях.',
    errorInvalidImage: 'Невірний формат зображення. Використовуйте JPEG або PNG.',
    errorImageTooLarge: 'Зображення занадто велике. Максимальний розмір: {size}MB.',
    errorComparisonFailed: 'Не вдалося порівняти зображення. Спробуйте ще раз.',
    
    // Results
    analysisResult: 'Результат аналізу',
    missingItems: 'Відсутні товари',
    noMissingItems: '✓ Відсутніх товарів не виявлено - полиці повністю укомплектовані!',
    heatmapView: '🔥 Теплова карта (Відсутні товари)',
    heatmapHint: '🔥 Червоні зони на фото показують, де відсутні товари (прокрутіть вниз, щоб побачити)',
    
    // Debug
    testHeatmap: '🧪 Тестова теплова карта (Налагодження)',
    exportDiagnostics: '📊 Експортувати діагностику',
    
    // Settings Modal
    settingsTitle: 'Налаштування',
    enterApiKey: 'Введіть ваш Gemini API ключ для увімкнення порівняння зображень.',
    getFreeKey: 'Отримайте безкоштовний ключ тут',
    apiKeyPlaceholder: 'AIzaSy...',
    enhanceQuality: 'Покращити якість зображення',
    enhanceDescription: 'Використовуйте OpenCV.js для покращення якості зображення перед аналізом (підвищує точність)',
    downloadOpenCV: '⚠️ Натисніть УВІМКНУТИ, щоб завантажити OpenCV (8 MB)',
    openCVReady: '✓ OpenCV готовий',
    loading: 'Завантаження...',
    on: 'УВІМКНЕНО',
    off: 'ВИМКНЕНО',
    saveKey: 'Зберегти ключ',
    
    // Image Processing
    processingImages: 'Обробка зображень...',
    
    // Box coordinates
    box: 'Рамка',
  },
  en: {
    // Header
    appTitle: 'Product Checker',
    settings: 'Settings',
    
    // API Key Warning
    apiKeyNeeded: 'API Key Needed',
    apiKeyTapConfig: 'Tap to configure Google Gemini API',
    
    // Image Upload
    uploadBefore: '1. Before (Stock)',
    uploadAfter: '2. After (Check)',
    tapToPhoto: 'Tap to take photo',
    changePhoto: 'Change Photo',
    
    // Compare Button
    comparePhotos: 'Compare Photos',
    comparing: 'Comparing...',
    
    // Errors
    errorBothPhotos: 'Please take both photos first.',
    errorApiKey: 'Please set your API Key in settings.',
    errorInvalidImage: 'Invalid image format. Please use JPEG or PNG.',
    errorImageTooLarge: 'Image is too large. Maximum size: {size}MB.',
    errorComparisonFailed: 'Failed to compare images. Please try again.',
    
    // Results
    analysisResult: 'Analysis Result',
    missingItems: 'Missing Items',
    noMissingItems: '✓ No missing items detected - shelves are fully stocked!',
    heatmapView: '🔥 Heat-map View (Missing Items)',
    heatmapHint: '🔥 Red zones on the photo show where items are missing (scroll down to see)',
    
    // Debug
    testHeatmap: '🧪 Test Heatmap (Debug)',
    exportDiagnostics: '📊 Export Diagnostics',
    
    // Settings Modal
    settingsTitle: 'Settings',
    enterApiKey: 'Enter your Gemini API Key to enable image comparison.',
    getFreeKey: 'Get a free key here',
    apiKeyPlaceholder: 'AIzaSy...',
    enhanceQuality: 'Enhance Image Quality',
    enhanceDescription: 'Use OpenCV.js to enhance image quality before analysis (increases accuracy)',
    downloadOpenCV: '⚠️ Click ON to download OpenCV (8 MB)',
    openCVReady: '✓ OpenCV ready',
    loading: 'Loading...',
    on: 'ON',
    off: 'OFF',
    saveKey: 'Save Key',
    
    // Image Processing
    processingImages: 'Processing images...',
    
    // Box coordinates
    box: 'Box',
  }
};

/**
 * Get current language from localStorage or default to English
 * Validates that the saved language exists in translations
 */
export function getLanguage() {
  const saved = localStorage.getItem('app_language');
  // Validate that the saved language exists, otherwise default to English
  return (saved && translations[saved]) ? saved : 'en';
}

/**
 * Set current language
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem('app_language', lang);
    return true;
  }
  return false;
}

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {object} params - Optional parameters for interpolation
 */
export function t(key, params = {}) {
  const lang = getLanguage();
  let translation = translations[lang]?.[key] || translations.en[key] || key;
  
  // Parameter interpolation - replace all occurrences
  Object.keys(params).forEach(param => {
    const regex = new RegExp(`\\{${param}\\}`, 'g');
    translation = translation.replace(regex, params[param]);
  });
  
  return translation;
}

/**
 * Get all available languages
 */
export function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' }
  ];
}
