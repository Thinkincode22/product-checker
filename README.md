# 🛒 Product Checker

AI-powered shelf analyzer that detects missing products by comparing two photos.

## ✨ Features

- 📸 **Photo comparison** - Upload "before" and "after" shelf photos
- 🤖 **AI-powered detection** - Uses Google Gemini 2.5 Flash for intelligent analysis
- 🔥 **Visual heatmap** - Shows exactly where items are missing with red overlays
- 💾 **Offline support** - PWA (Progressive Web App) for offline functionality
- 📱 **Mobile-friendly** - Designed for smartphones and tablets
- 🎨 **Tailwind CSS** - Beautiful, responsive UI

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Google Gemini API key (get free one at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### First Use
1. Open the app in your browser (usually http://localhost:5173)
2. Click the ⚙️ settings icon
3. Enter your Google Gemini API key
4. Upload two shelf photos (before and after)
5. Click "Compare Photos"
6. View results with red heatmap showing missing items

## 🛠️ Debugging

The app includes comprehensive debugging tools:

### 🔍 Automatic Console Logging
Open DevTools (F12) → Console to see detailed logs:
- `[App]` - Application flow and results
- `[Gemini]` - API responses and parsed data
- `[drawBoxes]` - Canvas rendering and coordinate scaling

### 🧪 Debug Buttons (visible after analysis)
When analysis shows missing items, two debug buttons appear:
- **"🧪 Test Heatmap (Debug)"** - Draws a test red box to verify canvas works
- **"📊 Export Diagnostics"** - Exports detailed analysis to browser console

### 📋 Documentation
- **`DIAGNOSTICS_GUIDE.md`** - Complete guide for debugging heatmap display issues
- **`DEBUG_GUIDE.md`** - Quick troubleshooting checklist and common problems

## 📁 Project Structure

```
src/
├── App.jsx                    # Main application component
├── main.jsx                   # Entry point
├── App.css                    # Global styles
├── index.css                  # Base CSS
├── components/
│   ├── ImageUploader.jsx      # Photo upload component
│   └── APIKeyModal.jsx        # Settings/API key modal
└── utils/
    ├── gemini.js              # Gemini API integration
    ├── drawHeatmap.js         # Canvas rendering with automatic scaling
    └── diagnostics.js         # Debugging utilities
```

## 🔧 Technologies

- **React 19** - UI framework
- **Vite 7** - Build tool with HMR
- **Tailwind CSS 4** - Styling and layout
- **Google Gemini 2.5 Flash** - AI image analysis
- **Lucide React** - Beautiful icons
- **Vite PWA Plugin** - Progressive Web App support

## 📊 How It Works

### Data Flow
```
Upload Photos → Gemini API → Parse Response → Draw Canvas → Display Results
```

### Detailed Process

1. **Photo Selection**
   - User uploads "stock" photo (reference) and "current" photo (to check)
   - Images stored as base64 data URLs

2. **Gemini API Call**
   - Both images sent to Google's Gemini 2.5 Flash model
   - Model analyzes visual differences
   - Returns JSON with missing items and bounding boxes

3. **Response Parsing**
   - API returns: `{ missing: [{ label: "name", box: [x1, y1, x2, y2] }], summary: "..." }`
   - Box coordinates are in original image resolution

4. **Canvas Rendering**
   - JavaScript calculates display scale: `scale = displayWidth / naturalWidth`
   - Draws semi-transparent red rectangles with borders
   - Scales coordinates: `displayX = originalX * scale`

5. **Result Display**
   - Heatmap overlay shown on the current photo
   - Lists all missing items with coordinates
   - Red zones highlight exactly where items are missing

## 🔴 Understanding the Heatmap

The heatmap visualizes missing items with:
- **Semi-transparent red fill** - Indicates missing area
- **Red border** - Highlights item boundaries
- **White text label** - Shows count of missing items
- **Coordinates** - Can be viewed in the results list

### Example
```
Missing item: Singleton
Box: [100, 200, 300, 400]
This means: starting at pixel (100, 200) and ending at (300, 400)
```

## 🐛 Troubleshooting

### ❌ Red heatmap zones don't appear

**Step 1: Check console logs**
```bash
1. Press F12 to open DevTools
2. Go to "Console" tab
3. Look for logs starting with [App], [Gemini], [drawBoxes]
```

**Step 2: Test with debug button**
```bash
1. Look for "🧪 Test Heatmap (Debug)" button
2. Click it - a red box should appear on the image
3. If test box appears → problem is in coordinates
4. If no test box → problem is in canvas setup
```

**Step 3: Export diagnostics**
```bash
1. Click "📊 Export Diagnostics" button
2. Check console for detailed analysis
3. Look for "scale" values and "analysis" for each missing item
4. See DIAGNOSTICS_GUIDE.md for interpretation
```

**See `DIAGNOSTICS_GUIDE.md` for detailed troubleshooting**

### ❌ "No missing items detected" message

This means Gemini couldn't find differences. Try:
- ✅ Use photos with more obvious differences
- ✅ Ensure photos are well-lit and in focus
- ✅ Check API key is valid at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- ✅ Verify API quota hasn't been exceeded

### ❌ API Key errors

```bash
Error: "Please set your API Key in settings"
→ Click settings (⚙️ icon) and enter your Gemini API key

Error: "Failed to compare images"
→ Check your API key is valid and hasn't exceeded quota
→ Try again with different photos
```

### ❌ Photos not loading

- ✅ Check file size (should be < 20MB)
- ✅ Ensure image format is JPEG/PNG
- ✅ Try a different photo
- ✅ Check browser permissions for camera/files

## 📱 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Recommended | Best performance |
| Firefox | ✅ Excellent | Full support |
| Safari 15+ | ✅ Good | iOS/macOS support |
| Mobile Safari | ✅ Good | iOS device support |
| Chrome Mobile | ✅ Good | Android support |

## 🎯 Key Improvements Made

### ✅ Heatmap Rendering
- Added automatic coordinate scaling based on display size
- Fixed coordinate validation and clipping
- Improved canvas positioning and z-index

### ✅ Diagnostics
- Comprehensive console logging at each step
- Debug buttons for testing canvas functionality
- Detailed diagnostic export function
- Box analysis with validation

### ✅ Error Handling
- Better error messages
- Validation of image dimensions
- Graceful fallbacks for edge cases

### ✅ Documentation
- Complete troubleshooting guides
- Detailed console logging reference
- Step-by-step debugging workflow

## 🔍 Advanced: Understanding Coordinate Scaling

The app automatically scales bounding box coordinates from the original image resolution to the displayed resolution:

```javascript
// Original image: 4000x3000 pixels
// Displayed size: 300x225 pixels
// Scale factor: 0.075x, 0.075y

// Gemini returns (original coordinates):
box = [1000, 800, 1500, 1200]

// App converts to display coordinates:
displayBox = [
  1000 * 0.075 = 75,
  800 * 0.075 = 60,
  1500 * 0.075 = 112.5,
  1200 * 0.075 = 90
]
```

This ensures red zones appear exactly where items are missing, regardless of photo resolution.

## 📄 License

MIT License - feel free to use this project for any purpose

## 🙏 Acknowledgments

- Google Gemini 2.5 Flash for powerful image analysis
- Lucide React for beautiful icons
- Tailwind CSS for modern styling
- Vite for blazing-fast development experience
