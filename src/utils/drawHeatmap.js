export function drawBoxes(containerElement, imageElement, boxes) {
  console.log('[drawBoxes] Called with boxes:', boxes);
  console.log('[drawBoxes] Container:', containerElement);
  console.log('[drawBoxes] Image element:', imageElement);

  // Remove existing canvas if present
  const existingCanvas = containerElement.querySelector('canvas[data-heatmap="true"]');
  if (existingCanvas) {
    console.log('[drawBoxes] Removing existing canvas');
    existingCanvas.remove();
  }

  if (!boxes || boxes.length === 0) {
    console.log('[drawBoxes] No boxes to draw');
    return;
  }

  // Get actual displayed dimensions
  const displayedWidth = imageElement.offsetWidth;
  const displayedHeight = imageElement.offsetHeight;
  const actualWidth = imageElement.naturalWidth;
  const actualHeight = imageElement.naturalHeight;

  // Validate image dimensions
  if (!actualWidth || !actualHeight) {
    console.error('[drawBoxes] Image dimensions not loaded yet!', {
      naturalWidth: actualWidth,
      naturalHeight: actualHeight,
      offsetWidth: displayedWidth,
      offsetHeight: displayedHeight
    });
    return;
  }

  // Calculate scale factors to convert from original image coordinates to displayed coordinates
  const scaleX = displayedWidth / actualWidth;
  const scaleY = displayedHeight / actualHeight;

  console.log('[drawBoxes] Image dimensions:', {
    displayed: { width: displayedWidth, height: displayedHeight },
    actual: { width: actualWidth, height: actualHeight },
    scale: { scaleX, scaleY },
    boxCount: boxes.length
  });

  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-heatmap', 'true');
  canvas.width = displayedWidth;
  canvas.height = displayedHeight;
  
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.borderRadius = 'inherit';
  canvas.style.zIndex = '10';

  console.log('[drawBoxes] Canvas created:', { width: canvas.width, height: canvas.height });

  const ctx = canvas.getContext('2d');
  let validBoxes = 0;
  let skippedBoxes = 0;

  boxes.forEach((box, index) => {
    if (!box || box.length < 4) {
      console.warn('[drawBoxes] Invalid box format at index', index, ':', box);
      skippedBoxes++;
      return;
    }

    let [x1, y1, x2, y2] = box;

    // Validate and normalize coordinates
    if (x1 > x2) {
      console.log(`[drawBoxes] Box ${index}: x1 > x2, swapping`);
      [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
      console.log(`[drawBoxes] Box ${index}: y1 > y2, swapping`);
      [y1, y2] = [y2, y1];
    }

    // Check if coordinates are within bounds
    if (x1 < 0 || y1 < 0 || x2 > actualWidth || y2 > actualHeight) {
      console.warn('[drawBoxes] Box', index, 'out of bounds:', { 
        x1, y1, x2, y2, 
        actualWidth, actualHeight,
        clipped: {
          x1: Math.max(0, x1),
          y1: Math.max(0, y1),
          x2: Math.min(actualWidth, x2),
          y2: Math.min(actualHeight, y2)
        }
      });
      // Clip to bounds instead of skipping
      x1 = Math.max(0, x1);
      y1 = Math.max(0, y1);
      x2 = Math.min(actualWidth, x2);
      y2 = Math.min(actualHeight, y2);
    }

    // Scale coordinates to displayed dimensions
    const scaledX1 = Math.round(x1 * scaleX);
    const scaledY1 = Math.round(y1 * scaleY);
    const scaledX2 = Math.round(x2 * scaleX);
    const scaledY2 = Math.round(y2 * scaleY);
    const scaledWidth = scaledX2 - scaledX1;
    const scaledHeight = scaledY2 - scaledY1;

    // Skip if box is too small after scaling
    if (scaledWidth < 2 || scaledHeight < 2) {
      console.warn('[drawBoxes] Box', index, 'too small after scaling:', { scaledWidth, scaledHeight });
      skippedBoxes++;
      return;
    }

    console.log(`[drawBoxes] Drawing box ${index}:`, { 
      original: { x1, y1, x2, y2 }, 
      scaled: { scaledX1, scaledY1, scaledX2, scaledY2 },
      size: { width: scaledWidth, height: scaledHeight }
    });

    // Draw gradient background (semi-transparent red with fade)
    const gradient = ctx.createLinearGradient(scaledX1, scaledY1, scaledX2, scaledY2);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0.4)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(scaledX1, scaledY1, scaledWidth, scaledHeight);

    // Draw bright red border (very visible)
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeRect(scaledX1, scaledY1, scaledWidth, scaledHeight);

    // Draw inner border (lighter, for depth effect)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(scaledX1 + 2, scaledY1 + 2, scaledWidth - 4, scaledHeight - 4);

    // Draw corner marks (L-shaped corners for better visibility)
    const cornerSize = Math.min(10, scaledWidth / 4, scaledHeight / 4);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(scaledX1, scaledY1 + cornerSize);
    ctx.lineTo(scaledX1, scaledY1);
    ctx.lineTo(scaledX1 + cornerSize, scaledY1);
    ctx.stroke();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(scaledX2 - cornerSize, scaledY1);
    ctx.lineTo(scaledX2, scaledY1);
    ctx.lineTo(scaledX2, scaledY1 + cornerSize);
    ctx.stroke();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(scaledX1, scaledY2 - cornerSize);
    ctx.lineTo(scaledX1, scaledY2);
    ctx.lineTo(scaledX1 + cornerSize, scaledY2);
    ctx.stroke();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(scaledX2 - cornerSize, scaledY2);
    ctx.lineTo(scaledX2, scaledY2);
    ctx.lineTo(scaledX2, scaledY2 - cornerSize);
    ctx.stroke();

    // Draw label on first box
    if (index === 0 && boxes.length > 0) {
      const labelText = `${boxes.length} missing item${boxes.length > 1 ? 's' : ''}`;
      const fontSize = Math.max(12, Math.min(16, scaledWidth / 8));
      
      ctx.font = `bold ${fontSize}px Arial`;
      const metrics = ctx.measureText(labelText);
      const labelWidth = metrics.width + 8;
      const labelHeight = fontSize + 6;
      const labelX = scaledX1 + (scaledWidth - labelWidth) / 2;
      const labelY = scaledY1 - labelHeight - 4;

      // Label background
      ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
      ctx.fillRect(labelX - 4, labelY - 2, labelWidth, labelHeight);

      // Label border
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(labelX - 4, labelY - 2, labelWidth, labelHeight);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(labelText, scaledX1 + scaledWidth / 2, scaledY1 - 8);
    }

    validBoxes++;
  });

  console.log('[drawBoxes] Summary:', {
    drawn: validBoxes,
    skipped: skippedBoxes,
    total: boxes.length
  });

  // Make container position relative if not already
  const containerPosition = window.getComputedStyle(containerElement).position;
  if (containerPosition === 'static') {
    console.log('[drawBoxes] Setting container position to relative');
    containerElement.style.position = 'relative';
  }

  containerElement.appendChild(canvas);
  console.log('[drawBoxes] Canvas appended to container');
}

export function clearHeatmap(containerElement) {
  const canvas = containerElement.querySelector('canvas[data-heatmap="true"]');
  if (canvas) {
    canvas.remove();
  }
}
