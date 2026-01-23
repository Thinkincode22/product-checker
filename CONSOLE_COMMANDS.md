# 🚀 Quick Console Commands Reference

Скопіюй та виконай ці команди в DevTools Console (F12) для швидкої діагностики.

## 1️⃣ Перевір результаты аналізу

```javascript
// Виведе останній результат порівняння фото
const lastResult = window.__lastResult || null;
console.log('Last analysis result:', lastResult);
```

## 2️⃣ Перевір розміри зображення

```javascript
// Отримай інформацію про поточне зображення на сторінці
const img = document.querySelector('img[alt="Heat-map"]');
if (img) {
  console.log('Image Information:', {
    natural: { width: img.naturalWidth, height: img.naturalHeight },
    displayed: { width: img.offsetWidth, height: img.offsetHeight },
    scale: {
      x: img.offsetWidth / img.naturalWidth,
      y: img.offsetHeight / img.naturalHeight
    }
  });
}
```

## 3️⃣ Перевір canvas

```javascript
// Перевір, чи canvas існує та має контент
const canvas = document.querySelector('canvas[data-heatmap="true"]');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let pixels = 0;
  for (let i = 3; i < imgData.data.length; i += 4) {
    if (imgData.data[i] > 0) pixels++;
  }
  console.log('Canvas:', {
    size: `${canvas.width}x${canvas.height}`,
    filledPixels: pixels,
    fillPercentage: ((pixels / (canvas.width * canvas.height)) * 100).toFixed(2) + '%'
  });
} else {
  console.warn('Canvas not found!');
}
```

## 4️⃣ Намалюй тестовий прямокутник

```javascript
// Намалюй червоний прямокутник в центрі зображення
const img = document.querySelector('img[alt="Heat-map"]');
const container = img?.parentElement;
if (img && container) {
  const canvas = document.createElement('canvas');
  canvas.width = img.offsetWidth;
  canvas.height = img.offsetHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(255, 0, 0, 0.35)';
  ctx.fillRect(
    img.offsetWidth * 0.25,
    img.offsetHeight * 0.25,
    img.offsetWidth * 0.5,
    img.offsetHeight * 0.5
  );
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    img.offsetWidth * 0.25,
    img.offsetHeight * 0.25,
    img.offsetWidth * 0.5,
    img.offsetHeight * 0.5
  );
  
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  container.appendChild(canvas);
  console.log('Test rectangle drawn!');
}
```

## 5️⃣ Аналізуй координати

```javascript
// Аналізуй перші координати (замість на реальні з логу)
const boxes = [
  [100, 200, 300, 400],  // Замість на реальні
  [350, 180, 450, 380]
];

const img = document.querySelector('img[alt="Heat-map"]');
if (img) {
  console.log('Box Analysis:');
  boxes.forEach((box, idx) => {
    const scale = {
      x: img.offsetWidth / img.naturalWidth,
      y: img.offsetHeight / img.naturalHeight
    };
    console.log(`Box ${idx}:`, {
      original: { x1: box[0], y1: box[1], x2: box[2], y2: box[3] },
      scaled: {
        x1: Math.round(box[0] * scale.x),
        y1: Math.round(box[1] * scale.y),
        x2: Math.round(box[2] * scale.x),
        y2: Math.round(box[3] * scale.y)
      },
      inBounds: box[0] >= 0 && box[1] >= 0 && box[2] <= img.naturalWidth && box[3] <= img.naturalHeight
    });
  });
}
```

## 6️⃣ Очисти всі canvas елементи

```javascript
// Видали всі heatmap canvas (якщо вони залишилися)
const canvases = document.querySelectorAll('canvas[data-heatmap="true"]');
console.log(`Removing ${canvases.length} canvas elements...`);
canvases.forEach(c => c.remove());
console.log('Done!');
```

## 7️⃣ Перевір LocalStorage

```javascript
// Перевір збережений API ключ
const apiKey = localStorage.getItem('gemini_api_key');
console.log('Saved API Key:', apiKey ? `${apiKey.slice(0, 10)}...` : 'Not set');
```

## 8️⃣ Збережи всі логи в файл

```javascript
// Скопіюй це в консоль, потім зроби: Ctrl+A, Ctrl+C
// Потім вклей у блокнот і збережи як .txt файл
console.log('=== DIAGNOSTIC REPORT ===');
console.log('Timestamp:', new Date().toISOString());
console.log('Scroll up and copy all [App], [Gemini], [drawBoxes] logs');
console.log('=== END REPORT ===');
```

## 🆚 Порівняй 2 зображення (якщо вони різні)

```javascript
// Якщо одне зображення показує heatmap, а друге ні
const img1 = document.querySelector('img[alt="Heat-map"]');
if (img1) {
  console.log('Current image:', {
    src: img1.src.slice(0, 50) + '...',
    natural: `${img1.naturalWidth}x${img1.naturalHeight}`,
    displayed: `${img1.offsetWidth}x${img1.offsetHeight}`,
    aspect: (img1.naturalWidth / img1.naturalHeight).toFixed(2)
  });
}
```

## 🔧 Найважливіші команди (ТОП 3)

### 1. Перевір наявність canvas та його розмір
```javascript
const canvas = document.querySelector('canvas[data-heatmap="true"]');
console.log(canvas ? `Canvas found: ${canvas.width}x${canvas.height}` : 'Canvas NOT found!');
```

### 2. Перевір результат аналізу
```javascript
// Відкрий DevTools, перейди на вкладку Network або Elements
// Шукай останній запит до Gemini API
// Або в Console шукай логи [Gemini]
```

### 3. Намалюй тестовий прямокутник
```javascript
// Див. команду 4️⃣ вище
```

---

## 💡 Tips

- 🟢 Всі команди можна копіювати цілком, вони самодостатні
- 🟡 Замінюй `[100, 200, 300, 400]` на реальні координати з логу
- 🔴 Якщо команда не спрацює, перевір, що зображення завантажилось
- 📱 На мобільних використовуй DevTools через USB debugging

---

## 📋 Порядок тестування

1. Завантажити 2 фото
2. Натиснути "Compare Photos"
3. Виконати команду 1️⃣ (перевір результати)
4. Виконати команду 3️⃣ (перевір canvas)
5. Якщо canvas не знайдено → виконати 4️⃣ (намалюй тест)
6. Якщо тест не працює → можлива проблема в браузері
7. Якщо все працює → виконати 5️⃣ (аналізуй координати)

---

## 🎯 Чекліст діагностики

- [ ] Логи в консолі показують результати ([App] та [Gemini])?
- [ ] Canvas існує і має розмір?
- [ ] Тестовий прямокутник з команди 4️⃣ видно?
- [ ] Реальні координати розраховуються правильно?
- [ ] Зображення правильно масштабується?

Якщо все перевірено - діагностика завершена! 🎉
