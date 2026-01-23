# 🔍 Диагностика теплової карти

## Кроки для швидкої діагностики проблеми

### 1. **Перевір дані Gemini**
Після натискання "Compare Photos":
1. Відкрий DevTools (F12)
2. Перейди на вкладку **Console**
3. Шукай логи з префіксом `[Gemini]`
4. Перевір:
   - `hasMissing: true` або `false`?
   - `missingCount: 0` чи `> 0`?
   - Чи є масив `missing` з координатами?

**Приклад очікуваного логу:**
```
[Gemini] Successfully parsed response: {
  missing: [
    { label: "Singleton", box: [100, 200, 300, 400] },
    { label: "Jack Daniels mini", box: [350, 180, 450, 380] }
  ],
  summary: "Found 2 missing items"
}
```

---

### 2. **Перевір, чи викликається рендеринг**
Шукай логи `[drawBoxes]`:
- `[drawBoxes] Called with boxes: [...]` - функція викликана?
- `[drawBoxes] Image dimensions:` - розміри правильні?
- `[drawBoxes] Drawing box 0:` - якось boxes малюються?

**Якщо логів нема:**
- Перевір, чи `result.missing.length > 0`
- Перевір, чи зображення завантажилось (повинен бути лог `[App] Image loaded`)

---

### 3. **Тест кнопкою "Test Heatmap (Debug)"**
Після аналізу (коли видно пропозицію Missing Items):
1. Натисни кнопку **"🧪 Test Heatmap (Debug)"**
2. У консолі повинні з'явитись логи з `[Debug]`
3. На зображенні повинна з'явитись червона точка в центрі

**Якщо точка видна:**
- Canvas працює, проблема в координатах або масштабуванні

**Якщо точка не видна:**
- Проблема в самому canvas або стилях

---

### 4. **Перевір координати вручну**
У консолі скопіюй і виконай:
```javascript
// Отримай останній результат з першого порівняння
const boxes = [
  [100, 200, 300, 400],  // Замість на реальні координати з логу
  [350, 180, 450, 380]
];

// Отримай посилання на зображення та контейнер
const img = document.querySelector('img[alt="Heat-map"]');
const container = img.parentElement;

console.log('Image dimensions:', {
  natural: [img.naturalWidth, img.naturalHeight],
  offset: [img.offsetWidth, img.offsetHeight]
});

console.log('First box:', {
  original: boxes[0],
  scaled: [
    Math.round(boxes[0][0] * (img.offsetWidth / img.naturalWidth)),
    Math.round(boxes[0][1] * (img.offsetHeight / img.naturalHeight)),
    Math.round(boxes[0][2] * (img.offsetWidth / img.naturalWidth)),
    Math.round(boxes[0][3] * (img.offsetHeight / img.naturalHeight))
  ]
});
```

---

## 🎯 Найвірогідніші причини

### ❌ Теплова карта зовсім не відображається
- **Причина 1:** Gemini не повернув координати (empty `missing` array)
- **Причина 2:** Зображення не завантажилось, коли викликалася функція рендерингу
- **Причина 3:** Canvas має нульовий розмір (перевір `[drawBoxes] Canvas created:`)

### ❌ Теплова карта видна, але прямокутники в неправильному місці
- **Причина 1:** Помилка в масштабуванні (неправильно розраховується `scaleX`/`scaleY`)
- **Причина 2:** Координати вказують на область вне межи зображення

### ❌ Теплова карта видна тільки для деяких товарів
- **Причина 1:** Деякі координати занадто малі після масштабування (`scaledWidth < 2`)
- **Причина 2:** Gemini не визначив bounding box для деяких товарів

---

## 💡 Оперативна діагностика

### Швидкий тест 1: Canvas взагалі працює?
```javascript
// У консолі:
const img = document.querySelector('img[alt="Heat-map"]');
const container = img.parentElement;

// Намалюй червону точку в центрі
const canvas = document.createElement('canvas');
canvas.width = img.offsetWidth;
canvas.height = img.offsetHeight;
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 50, 50);

container.style.position = 'relative';
container.appendChild(canvas);
```

Якщо червоний прямокутник видно - canvas працює, проблема в координатах.

---

## 📋 Чеклист діагностики

- [ ] Вгорі консолі 2 логи від `[App] Comparison result:`
- [ ] Перевірив `hasMissing` та `missingCount`
- [ ] Видно логи `[drawBoxes] Called with boxes:`
- [ ] Видно логи `[drawBoxes] Image dimensions:`
- [ ] Видно логи `[drawBoxes] Drawing box:`
- [ ] Натиснув кнопку "Test Heatmap (Debug)"
- [ ] Видно червону точку від тесту
- [ ] Видно координати в консолі для всіх items

---

## 🛠️ Якщо нічого не виходить

Зберегти цей лог і надати його разом з описом проблеми:
```javascript
// Скопіюй весь вивід консолі, що містить [App], [Gemini], [drawBoxes]
// Додай також скріншот з тепловою картою (або її відсутністю)
```
