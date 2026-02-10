/**
 * Export utilities for Product Checker results
 * Allows exporting analysis results to various formats
 */

/**
 * Export results as JSON file
 * @param {Object} result - Analysis result
 * @param {string} filename - Optional filename
 */
export function exportAsJSON(result, filename = 'product-check-results.json') {
  const data = JSON.stringify(result, null, 2);
  downloadFile(data, filename, 'application/json');
}

/**
 * Format box coordinates as string
 * @param {Array} box - Box coordinates [x1, y1, x2, y2]
 * @returns {string} - Formatted coordinates
 */
function formatBoxCoordinates(box) {
  return box ? `${box[0]} ${box[1]} ${box[2]} ${box[3]}` : 'N/A';
}

/**
 * Export results as CSV file
 * @param {Object} result - Analysis result
 * @param {string} filename - Optional filename
 */
export function exportAsCSV(result, filename = 'product-check-results.csv') {
  if (!result || !result.missing) {
    console.warn('[Export] No missing items to export');
    return;
  }

  // Create CSV header
  let csv = 'Item,Status,Box Coordinates (x1 y1 x2 y2)\n';

  // Add missing items
  result.missing.forEach(item => {
    const box = formatBoxCoordinates(item.box);
    csv += `"${item.label}",Missing,"${box}"\n`;
  });

  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export results as text file
 * @param {Object} result - Analysis result
 * @param {string} filename - Optional filename
 */
export function exportAsText(result, filename = 'product-check-results.txt') {
  if (!result) {
    console.warn('[Export] No results to export');
    return;
  }

  const timestamp = new Date().toLocaleString();
  let text = `Product Check Results\n`;
  text += `Generated: ${timestamp}\n`;
  text += `${'='.repeat(50)}\n\n`;

  text += `Summary:\n${result.summary}\n\n`;

  if (result.missing && result.missing.length > 0) {
    text += `Missing Items (${result.missing.length}):\n`;
    text += `${'-'.repeat(50)}\n`;
    
    result.missing.forEach((item, idx) => {
      text += `${idx + 1}. ${item.label}\n`;
      const box = formatBoxCoordinates(item.box);
      if (box !== 'N/A') {
        text += `   Location: [${box.replace(/ /g, ', ')}]\n`;
      }
      text += '\n';
    });
  } else {
    text += '\nNo missing items detected.\n';
  }

  downloadFile(text, filename, 'text/plain');
}

/**
 * Export results with images as HTML report
 * @param {Object} result - Analysis result
 * @param {string} image1 - Before image (base64)
 * @param {string} image2 - After image (base64)
 * @param {string} filename - Optional filename
 */
export function exportAsHTML(result, image1, image2, filename = 'product-check-report.html') {
  const timestamp = new Date().toLocaleString();
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Check Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: #2563eb;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .images {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .image-container {
      text-align: center;
    }
    img {
      max-width: 100%;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
    }
    .missing-item {
      padding: 10px;
      margin: 10px 0;
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      border-radius: 4px;
    }
    .no-missing {
      padding: 10px;
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      border-radius: 4px;
      color: #166534;
    }
    .timestamp {
      color: #6b7280;
      font-size: 14px;
    }
    @media print {
      body { background: white; }
      .section { box-shadow: none; border: 1px solid #e5e7eb; }
    }
    @media (max-width: 768px) {
      .images { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛒 Product Check Report</h1>
    <p class="timestamp">Generated: ${timestamp}</p>
  </div>

  <div class="section">
    <h2>Summary</h2>
    <p>${result.summary}</p>
  </div>

  <div class="section">
    <h2>Comparison Images</h2>
    <div class="images">
      <div class="image-container">
        <h3>Before (Stock)</h3>
        <img src="${image1}" alt="Before image" />
      </div>
      <div class="image-container">
        <h3>After (Check)</h3>
        <img src="${image2}" alt="After image" />
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Analysis Results</h2>`;

  if (result.missing && result.missing.length > 0) {
    html += `<p><strong>Missing Items: ${result.missing.length}</strong></p>`;
    result.missing.forEach((item, idx) => {
      html += `
      <div class="missing-item">
        <strong>${idx + 1}. ${item.label}</strong>`;
      if (item.box) {
        html += `<br><small>Location: [${item.box.join(', ')}]</small>`;
      }
      html += `</div>`;
    });
  } else {
    html += `<div class="no-missing">✓ No missing items detected - shelves are fully stocked!</div>`;
  }

  html += `
  </div>

  <div class="section">
    <p style="color: #6b7280; font-size: 14px;">
      Generated by Product Checker - AI-powered shelf analyzer
    </p>
  </div>
</body>
</html>`;

  downloadFile(html, filename, 'text/html');
}

/**
 * Helper function to trigger file download
 * @param {string} data - File data
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
function downloadFile(data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('[Export] File downloaded:', filename);
}

/**
 * Get available export formats
 */
export function getExportFormats() {
  return [
    { value: 'html', label: 'HTML Report', icon: '📄', description: 'Complete report with images' },
    { value: 'json', label: 'JSON', icon: '📊', description: 'Machine-readable data' },
    { value: 'csv', label: 'CSV', icon: '📑', description: 'Spreadsheet format' },
    { value: 'txt', label: 'Text', icon: '📝', description: 'Plain text report' }
  ];
}
