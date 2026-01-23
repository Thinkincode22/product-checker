/**
 * Диагностические утилиты для отладки проблем с тепловой картой
 */

export function exportDiagnostics(result, imageElement) {
  if (!result || !imageElement) {
    console.error('[Diagnostics] Missing result or image element');
    return;
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    result: {
      summary: result.summary,
      missingCount: result.missing ? result.missing.length : 0,
      missing: result.missing || [],
    },
    imageInfo: {
      naturalWidth: imageElement.naturalWidth,
      naturalHeight: imageElement.naturalHeight,
      offsetWidth: imageElement.offsetWidth,
      offsetHeight: imageElement.offsetHeight,
      scale: {
        x: imageElement.offsetWidth / imageElement.naturalWidth,
        y: imageElement.offsetHeight / imageElement.naturalHeight,
      },
    },
    boxesAnalysis: (result.missing || []).map((item, idx) => {
      const box = item.box || [];
      const scale = {
        x: imageElement.offsetWidth / imageElement.naturalWidth,
        y: imageElement.offsetHeight / imageElement.naturalHeight,
      };

      return {
        index: idx,
        label: item.label,
        originalBox: {
          x1: box[0],
          y1: box[1],
          x2: box[2],
          y2: box[3],
          width: (box[2] || 0) - (box[0] || 0),
          height: (box[3] || 0) - (box[1] || 0),
        },
        scaledBox: {
          x1: Math.round((box[0] || 0) * scale.x),
          y1: Math.round((box[1] || 0) * scale.y),
          x2: Math.round((box[2] || 0) * scale.x),
          y2: Math.round((box[3] || 0) * scale.y),
          width: Math.round(((box[2] || 0) - (box[0] || 0)) * scale.x),
          height: Math.round(((box[3] || 0) - (box[1] || 0)) * scale.y),
        },
        analysis: analyzeBox(box, imageElement),
      };
    }),
  };

  console.log('[Diagnostics] Full Diagnostics Report:');
  console.table(diagnostics);
  console.log('[Diagnostics] Raw JSON:', JSON.stringify(diagnostics, null, 2));

  return diagnostics;
}

export function analyzeBox(box, imageElement) {
  if (!box || box.length < 4) {
    return { error: 'Invalid box format' };
  }

  const [x1, y1, x2, y2] = box;
  const imgWidth = imageElement.naturalWidth;
  const imgHeight = imageElement.naturalHeight;

  const issues = [];

  if (x1 >= x2) issues.push('x1 >= x2 (invalid width)');
  if (y1 >= y2) issues.push('y1 >= y2 (invalid height)');
  if (x1 < 0 || y1 < 0) issues.push('Negative coordinates');
  if (x2 > imgWidth || y2 > imgHeight) issues.push('Coordinates exceed image bounds');

  const width = x2 - x1;
  const height = y2 - y1;
  const area = width * height;
  const imgArea = imgWidth * imgHeight;
  const areaPercent = ((area / imgArea) * 100).toFixed(2);

  return {
    valid: issues.length === 0,
    issues,
    size: { width, height, area, areaPercent: `${areaPercent}%` },
    bounds: {
      insideImage: x1 >= 0 && y1 >= 0 && x2 <= imgWidth && y2 <= imgHeight,
      clipped: {
        x1: Math.max(0, x1),
        y1: Math.max(0, y1),
        x2: Math.min(imgWidth, x2),
        y2: Math.min(imgHeight, y2),
      },
    },
  };
}

export function validateAndRepairBoxes(boxes, imageElement) {
  console.log('[Diagnostics] Validating and repairing boxes...');

  return boxes.map((item, idx) => {
    const box = item.box || [];
    let [x1, y1, x2, y2] = box;

    // Fix swapped coordinates
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];

    // Clip to image bounds
    x1 = Math.max(0, x1);
    y1 = Math.max(0, y1);
    x2 = Math.min(imageElement.naturalWidth, x2);
    y2 = Math.min(imageElement.naturalHeight, y2);

    const repaired = { ...item, box: [x1, y1, x2, y2] };

    if (JSON.stringify(item.box) !== JSON.stringify([x1, y1, x2, y2])) {
      console.log(`[Diagnostics] Box ${idx} ("${item.label}") was repaired:`, {
        original: box,
        repaired: [x1, y1, x2, y2],
      });
    }

    return repaired;
  });
}

export function logCanvasInfo(canvas) {
  if (!canvas) {
    console.warn('[Diagnostics] Canvas element not found');
    return;
  }

  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Count non-transparent pixels
  let filledPixels = 0;
  for (let i = 3; i < imgData.data.length; i += 4) {
    if (imgData.data[i] > 0) filledPixels++;
  }

  console.log('[Diagnostics] Canvas Info:', {
    width: canvas.width,
    height: canvas.height,
    size: `${canvas.width}x${canvas.height}`,
    filledPixels,
    totalPixels: canvas.width * canvas.height,
    fillPercentage: ((filledPixels / (canvas.width * canvas.height)) * 100).toFixed(2) + '%',
  });
}
