# CalSci - Scientific Calculator (with Graph Generation)

![CalSci Banner](https://img.shields.io/badge/CalSci-Neo--Brutalist-FF6B35?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-FFB627?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-7FD1AE?style=for-the-badge)

**🔗 Live Demo:** [https://calsci-five.vercel.app/](https://calsci-five.vercel.app/)

A modern, highly advanced scientific calculator with a stunning Neo-Brutalist Retro UI design. Built with pure vanilla JavaScript, HTML5, and CSS3 - no frameworks, just raw performance.

---

## ✨ Features

### 🧮 **Dual-Mode Calculator**
- **Standard Mode**: Basic arithmetic operations with a clean interface
- **Scientific Mode**: Advanced mathematical functions including trigonometry, logarithms, exponentials, factorials, and more

### 📊 **Interactive Graphing**
- Plot mathematical functions with real-time visualization
- Zoom in/out controls for detailed analysis
- Pan and reset functionality
- Bold axis lines with clear grid system
- Supports complex equations: `sin(x)`, `x^2`, `e^x`, `log(x)`, etc.
- Implicit multiplication support (e.g., `2x` → `2*x`)

### 🔄 **Unit Converter**
- **6 Categories**: Length, Weight, Temperature, Volume, Area, Speed
- Real-time conversion as you type
- Comprehensive unit support across all categories
- Clean card-based interface

### 📅 **Date Calculator**
- Calculate differences between two dates
- Add/subtract days from any date
- Displays results in years, months, and days
- Handles leap years and month variations automatically

### ⚙️ **Scientific Settings**
- **Angle Units**: Toggle between Degrees and Radians
- **Decimal Precision**: Adjustable from 2 to 10 decimal places
- **Number Format**: Standard, Scientific, or Engineering notation
- Settings persist across browser sessions

### 🔊 **Audio Feedback**
- Unique beep sounds for different button types
- Number keys, operators, functions, equals, and clear all have distinct tones
- Built with Web Audio API for crisp, retro sound effects

---

## 🎨 Design Philosophy

### Neo-Brutalist Retro Aesthetic
CalSci features a bold, unapologetic design inspired by 1980s computer terminals and brutalist architecture:

- **Heavy Black Borders** (3-4px) on every component
- **Brutal Drop Shadows** (6px offset) for depth
- **Warm Color Palette**: Beige backgrounds (#E8DCC8) with vibrant orange (#FF6B35), yellow (#FFB627), and green (#7FD1AE) accents
- **Bold Typography**: Arial Black and Impact fonts at 900 weight
- **Hard Edges**: Minimal border radius, rectangular button design
- **High Contrast**: Maximum readability with pure black text on white surfaces

---

## 🚀 Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties (CSS variables), Flexbox, Grid
- **Vanilla JavaScript (ES6+)**: Modular architecture, no dependencies
- **[math.js](https://mathjs.org/)**: Mathematical expression parsing and evaluation
- **[Chart.js](https://www.chartjs.org/)**: 2D graph plotting and visualization
- **Web Audio API**: Real-time sound generation

---

## 📱 Features Deep Dive

### Calculator Module
```javascript
// Supported operations:
Basic: +, -, ×, ÷, %, ^
Functions: sin, cos, tan, asin, acos, atan
Logarithms: log (base 10), ln (natural log)
Powers: x², xʸ, eˣ, √x, ∛x
Constants: π (pi), e (Euler's number)
Special: n! (factorial), |x| (absolute), mod
```

### Graph Module
```javascript
// Example equations to try:
sin(x)              // Sine wave
x^2                 // Parabola
e^(-x^2)           // Gaussian curve
sin(x)/x           // Sinc function
x^3-3x^2+2x-5      // Polynomial
```

### Unit Converter Categories
- **Length**: Millimeter, Centimeter, Meter, Kilometer, Inch, Foot, Yard, Mile
- **Weight**: Milligram, Gram, Kilogram, Ton, Ounce, Pound
- **Temperature**: Celsius, Fahrenheit, Kelvin
- **Volume**: Milliliter, Liter, Gallon, Fluid Ounce, Cup
- **Area**: Square Meter, Square Kilometer, Hectare, Acre, Square Foot
- **Speed**: m/s, km/h, mph, knot

---

## 🛠️ Installation & Usage

### **Online (Recommended)**
Simply visit: [https://calsci-five.vercel.app/](https://calsci-five.vercel.app/)

### **Local Development**
1. Clone the repository:
   ```bash
   git clone https://github.com/SauravSahoo-08/calsci-calculator.git
   cd calsci-calculator
   ```

2. Open `index.html` in your browser:
   ```bash
   # Windows
   start index.html
   
   # macOS
   open index.html
   
   # Linux
   xdg-open index.html
   ```

3. Or use a local server (optional):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```

---

## ⌨️ Keyboard Shortcuts

When in Calculator mode:
- **Numbers (0-9)**: Direct number input
- **Operators (+, -, *, /)**: Mathematical operators
- **Enter/=**: Evaluate expression
- **Escape**: Clear all
- **Backspace**: Delete last character
- **.**: Decimal point

---

## 📂 Project Structure

```
calsci-calculator/
├── index.html          # Main HTML structure (261 lines)
├── styles.css          # Neo-Brutalist styling (961 lines)
├── app.js             # Application logic (844 lines)
└── README.md          # This file
```

### Code Architecture
- **Modular Design**: Separate modules for Calc, Graph, Converter, DateCalc, and Settings
- **State Management**: Centralized state object with no external dependencies
- **Event-Driven**: Clean event handling with proper delegation
- **Responsive**: Mobile-first design with flex-based layouts

---

## 🎯 Browser Support

CalSci works on all modern browsers:
- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Opera (76+)

**Requirements:**
- JavaScript enabled
- Web Audio API support (for sounds)
- Canvas API support (for graphing)

---

## 🔧 Configuration

### Angle Units
Toggle between **Degrees** and **Radians** in Settings for trigonometric functions.

### Number Formatting
Choose from three display formats:
- **Standard**: `1234.56`
- **Scientific**: `1.23e+3`
- **Engineering**: `1.234e+3`

### Precision
Adjust decimal precision from 2 to 10 places based on your needs.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Maintain the Neo-Brutalist design aesthetic
- Keep code modular and well-commented
- Test across multiple browsers
- Follow existing code style (ES6+, no semicolons for statements)
- Update README if adding new features

---

## 📝 License

This project is licensed under the MIT License - feel free to use it for personal or commercial projects.

```
MIT License

Copyright (c) 2026 CalSci

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **[math.js](https://mathjs.org/)** - Powerful math library for JavaScript
- **[Chart.js](https://www.chartjs.org/)** - Simple yet flexible charting library
- Inspired by 1980s computer terminals and brutalist design principles
- Neo-Brutalism design trend in modern web design

---

## 📬 Contact & Support

- **Live App**: [https://calsci-five.vercel.app/](https://calsci-five.vercel.app/)
- **Issues**: Open an issue on GitHub
- **Discussions**: Start a discussion for feature requests

---

## 🎉 Fun Facts

- **100% Client-Side**: No backend, no API calls, works offline
- **Zero Dependencies** (except math.js and Chart.js via CDN)
- **Lightweight**: ~3000 lines of code total
- **Fast**: Instant calculations, no loading times
- **Accessible**: Keyboard navigation, ARIA labels, semantic HTML
- **Retro Sounds**: Generated in real-time using Web Audio API

---

## 🔮 Future Enhancements

Potential features for future versions:
- [ ] Dark mode toggle
- [ ] Matrix calculations
- [ ] Statistical functions (mean, median, std dev)
- [ ] Programmable calculator (binary, hex, octal)
- [ ] 3D graphing support
- [ ] Equation solver
- [ ] History/memory functions (M+, M-, MR, MC)
- [ ] Export graphs as images
- [ ] Multiple graph plotting on same canvas
- [ ] Custom color themes

---

## 🌟 Star This Project

If you find CalSci useful, please consider giving it a ⭐ on GitHub!

**Made with ❤️ and lots of bold borders**

---

**Version**: 1.0.0  
**Last Updated**: September 2026  
**Status**: Active Development
