# Aspect Ratio Calculator

A single-page web application for calculating and working with image aspect ratios. Enter dimensions or upload an image to get instant ratio calculations, resize tools, and helpful conversions.

## Features

- **Dual input modes**: Enter dimensions manually or upload an image file
- **Aspect ratio calculations**: 
  - Simplified ratio (e.g., 16:9)
  - Decimal representation
  - Pixel dimensions
  - Closest common ratio matching
- **Resize tools**:
  - Target width/height with automatic aspect ratio preservation
  - Fit inside box (max width/height)
  - Scale by percentage
  - Configurable rounding (round, floor, ceil)
- **Additional tools**:
  - Copy ratio or pixel dimensions to clipboard
  - Swap width and height
  - Image drag & drop support
  - Paste dimension format parsing (e.g., `1200x800` or `1200×800`)

## Usage

1. Open `index.html` in a modern web browser
2. Enter image dimensions:
   - Type width and height in the input fields, or
   - Upload an image file, or
   - Drag and drop an image onto the drop zone
3. View calculated aspect ratio information
4. Use resize tools to calculate new dimensions while maintaining aspect ratio

## File Structure

```
aspect-ratio-calculator/
├── index.html      # HTML structure
├── styles.css      # All CSS styles
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Technical Details

- **No dependencies**: Pure vanilla JavaScript, HTML, and CSS
- **Browser-based**: Runs entirely in the browser (no server required)
- **Responsive**: Works on desktop and mobile devices
- **Accessible**: Uses semantic HTML and ARIA attributes

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript features
- `querySelector` API
- Clipboard API (for copy functionality)
- File API (for image upload)

