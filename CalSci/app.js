/* =========================================================================
   Super Calculator — app.js
   Modular vanilla JS. All logic separated from rendering.
   ========================================================================= */

'use strict';

const App = (() => {
  /* ----- State --------------------------------------------------------- */
  const state = {
    currentTab: 'calculator',
    calcMode: 'standard',       // 'standard' | 'scientific'
    expression: '',
    displayValue: '0',
    history: '',
    justEvaluated: false,
    settings: {
      angleUnit: 'deg',         // 'deg' | 'rad'
      precision: 6,
      numberFormat: 'standard', // 'standard' | 'scientific' | 'engineering'
    },
    graph: {
      xMin: -10,
      xMax: 10,
      chart: null,
    },
    converter: {
      category: 'length',
    },
  };

  /* ----- Helpers -------------------------------------------------------- */
  function $(id) { return document.getElementById(id); }

  /** Sound system using Web Audio API */
  const Sound = (() => {
    let audioContext = null;
    
    function init() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    function playBeep(frequency = 800, duration = 50, volume = 0.1) {
      init();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    }

    function playClick() {
      playBeep(600, 30, 0.08);
    }

    function playOperator() {
      playBeep(750, 40, 0.1);
    }

    function playEquals() {
      playBeep(900, 60, 0.12);
    }

    function playClear() {
      playBeep(500, 50, 0.1);
    }

    function playFunction() {
      playBeep(850, 35, 0.09);
    }

    return { playClick, playOperator, playEquals, playClear, playFunction };
  })();

  /** Add ripple visual to a button */
  function addRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) - rect.left) / rect.width * 100;
    const y = ((e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) - rect.top) / rect.height * 100;
    btn.style.setProperty('--ripple-x', x + '%');
    btn.style.setProperty('--ripple-y', y + '%');
    btn.classList.add('ripple');
    setTimeout(() => btn.classList.remove('ripple'), 400);
  }

  function formatNumber(n, precision) {
    if (typeof n === 'string') return n;
    if (!isFinite(n)) return String(n);
    const p = precision ?? state.settings.precision;
    
    // Apply number format based on settings
    if (state.settings.numberFormat === 'scientific') {
      return n.toExponential(p);
    } else if (state.settings.numberFormat === 'engineering') {
      // Engineering notation: exponent is multiple of 3
      const exp = Math.floor(Math.log10(Math.abs(n)));
      const engExp = Math.floor(exp / 3) * 3;
      const mantissa = n / Math.pow(10, engExp);
      return mantissa.toFixed(p) + 'e' + (engExp >= 0 ? '+' : '') + engExp;
    } else {
      // Standard format - avoid trailing zeros
      const fixed = Number(n.toFixed(p));
      return String(fixed);
    }
  }

  function updateDisplaySize() {
    const el = $('calc-display');
    const len = el.textContent.length;
    el.classList.toggle('shrink', len > 12);
    el.classList.toggle('shrink2', len > 18);
  }

  function showToast(msg) {
    const toast = $('error-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  /* ----- Tab Switching -------------------------------------------------- */
  function switchTab(tabName) {
    
    state.currentTab = tabName;

    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });
    document.querySelectorAll('.panel').forEach(p => {
      p.classList.toggle('active', p.id === 'panel-' + tabName);
    });

    // Initialize modules on first visit
    if (tabName === 'graphing' && !state.graph.chart) {
      Graph.init();
    }
    if (tabName === 'converter') {
      Converter.changeCategory();
    }
  }

  /* ===== CALCULATOR MODULE ============================================== */
  const Calc = (() => {
    function setMode(mode) {
      
      state.calcMode = mode;
      $('mode-standard').classList.toggle('active', mode === 'standard');
      $('mode-scientific').classList.toggle('active', mode === 'scientific');
      $('sci-buttons').classList.toggle('hidden', mode !== 'scientific');
    }

    function render() {
      $('calc-display').textContent = state.displayValue;
      $('calc-history').textContent = state.history;
      updateDisplaySize();
    }

    function input(val) {
      // Play appropriate sound
      if (/[\d.]/.test(val)) {
        Sound.playClick();
      } else if (['+', '-', '*', '/'].includes(val)) {
        Sound.playOperator();
      } else {
        // Functions like sin, cos, sqrt, etc.
        Sound.playFunction();
      }

      // After evaluating, start fresh on number/dot input
      if (state.justEvaluated) {
        if (/[\d.]/.test(val)) {
          state.expression = '';
          state.displayValue = '';
          state.history = '';
        }
        state.justEvaluated = false;
      }

      // Prevent double operators (but allow negative after operator)
      const lastChar = state.expression.slice(-1);
      const operators = ['+', '-', '*', '/'];
      if (operators.includes(val) && operators.includes(lastChar)) {
        state.expression = state.expression.slice(0, -1);
      }

      // Prevent double dots in the same number
      if (val === '.') {
        const parts = state.expression.split(/[\+\-\*\/\(\)]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('.')) return;
      }

      state.expression += val;
      state.displayValue = state.expression;
      render();
    }

    function clear() {
      Sound.playClear();
      state.expression = '';
      state.displayValue = '0';
      state.history = '';
      state.justEvaluated = false;
      render();
    }

    function toggleSign() {
      
      if (state.displayValue === '0' || state.displayValue === '') return;

      if (state.justEvaluated) {
        // Negate the result
        const num = parseFloat(state.displayValue);
        if (isNaN(num)) return;
        state.displayValue = formatNumber(-num);
        state.expression = state.displayValue;
        state.justEvaluated = false;
      } else {
        // Wrap/unwrap with negation
        if (state.expression.startsWith('-(') && state.expression.endsWith(')')) {
          state.expression = state.expression.slice(2, -1);
        } else {
          state.expression = '-(' + state.expression + ')';
        }
        state.displayValue = state.expression;
      }
      render();
    }

    function evaluate() {
      Sound.playEquals();
      if (!state.expression) return;

      try {
        // Build the expression string for mathjs
        let expr = state.expression;

        // Handle implicit multiplication: 2pi -> 2*pi, 5e -> 5*e, )( -> )*(
        expr = expr.replace(/(\d)(pi|e\b)/g, '$1*$2');
        expr = expr.replace(/\)\(/g, ')*(');

        // Handle e^ as exp()
        expr = expr.replace(/e\^/g, 'exp(');

        // Configure mathjs parser with overrides based on angle unit
        const parser = math.parser();

        if (state.settings.angleUnit === 'deg') {
          // Override trig functions to accept degrees
          parser.set('sin', (x) => Math.sin(x * Math.PI / 180));
          parser.set('cos', (x) => Math.cos(x * Math.PI / 180));
          parser.set('tan', (x) => {
            if (Math.abs(x % 180 - 90) < 1e-10) return Infinity;
            return Math.tan(x * Math.PI / 180);
          });
          parser.set('asin', (x) => Math.asin(x) * 180 / Math.PI);
          parser.set('acos', (x) => Math.acos(x) * 180 / Math.PI);
          parser.set('atan', (x) => Math.atan(x) * 180 / Math.PI);
        }

        // In mathjs, log() is natural log. We want:
        // - UI "log" -> mathjs "log10" (base-10 log)  
        // - UI "ln"  -> mathjs "log" (natural log)
        // Order matters: replace log first, then ln
        expr = expr.replace(/\blog\(/g, 'log10(');
        expr = expr.replace(/\bln\(/g, 'log(');

        // Auto-close unclosed parentheses
        let openCount = 0;
        for (const ch of expr) {
          if (ch === '(') openCount++;
          else if (ch === ')') openCount--;
        }
        while (openCount > 0) { expr += ')'; openCount--; }

        const result = parser.evaluate(expr);

        if (result === undefined || result === null) {
          throw new Error('Invalid expression');
        }

        const resultStr = formatNumber(typeof result === 'object' && result.toNumber
          ? result.toNumber()
          : Number(result));

        state.history = state.expression + ' =';
        state.displayValue = resultStr;
        state.expression = resultStr;
        state.justEvaluated = true;
        render();
      } catch (err) {
        state.history = state.expression;
        state.displayValue = 'Error';
        state.expression = '';
        state.justEvaluated = true;
        render();
      }
    }

    return { setMode, input, clear, toggleSign, evaluate };
  })();

  /* ===== GRAPHING MODULE ================================================ */
  const Graph = (() => {
    function init() {
      buildChart();
    }

    function buildChart() {
      const ctx = $('graph-canvas').getContext('2d');
      if (state.graph.chart) state.graph.chart.destroy();

      state.graph.chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'y',
            data: [],
            borderColor: '#FF6B35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            borderWidth: 3,
            pointRadius: 0,
            showLine: true,
            tension: 0,
            fill: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 200, easing: 'linear' },
          interaction: { mode: 'nearest', axis: 'x', intersect: false },
          scales: {
            x: {
              type: 'linear',
              position: 'center',
              min: state.graph.xMin,
              max: state.graph.xMax,
              grid: {
                color: (context) => {
                  if (context.tick.value === 0) {
                    return '#000000';
                  }
                  return 'rgba(0, 0, 0, 0.1)';
                },
                lineWidth: (context) => {
                  if (context.tick.value === 0) {
                    return 2;
                  }
                  return 1;
                },
                drawTicks: true,
              },
              ticks: {
                color: '#2a2a2a',
                font: { size: 11, family: "'Arial Black', sans-serif", weight: 'bold' },
              },
              border: { 
                color: '#000000',
                width: 3
              },
            },
            y: {
              type: 'linear',
              position: 'center',
              grid: {
                color: (context) => {
                  if (context.tick.value === 0) {
                    return '#000000';
                  }
                  return 'rgba(0, 0, 0, 0.1)';
                },
                lineWidth: (context) => {
                  if (context.tick.value === 0) {
                    return 2;
                  }
                  return 1;
                },
                drawTicks: true,
              },
              ticks: {
                color: '#2a2a2a',
                font: { size: 11, family: "'Arial Black', sans-serif", weight: 'bold' },
              },
              border: { 
                color: '#000000',
                width: 3
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#000000',
              titleColor: '#FFFFFF',
              bodyColor: '#FFFFFF',
              borderColor: '#FF6B35',
              borderWidth: 3,
              padding: 10,
              displayColors: false,
              titleFont: { size: 12, family: "'Arial Black', sans-serif", weight: 'bold' },
              bodyFont: { size: 11, family: "'Arial Black', sans-serif", weight: 'bold' },
              callbacks: {
                title: () => '',
                label: (ctx) => `(${ctx.parsed.x.toFixed(2)}, ${ctx.parsed.y.toFixed(2)})`
              }
            }
          }
        }
      });
    }

    function plot() {
      
      const rawEq = $('graph-equation').value.trim();
      if (!rawEq) return;

      try {
        // Parse equation: strip leading "y=" if present
        let exprStr = rawEq.replace(/^([a-zA-Z]\s*=|(y|f\(x\))\s*=)\s*/i, '');

        // Improve compatibility: implicit multiplication
        // Strategy: Add * between patterns, but be careful not to break function names
        
        // 1. Number followed by letter or ( -> add *
        //    e.g., 2x -> 2*x, 3( -> 3*(
        exprStr = exprStr.replace(/(\d)([a-zA-Z\(])/g, '$1*$2');
        
        // 2. ) followed by ( or digit -> add *
        //    e.g., (x+1)(x-1) -> (x+1)*(x-1)
        exprStr = exprStr.replace(/\)([\d\(])/g, ')*$1');
        
        // 3. Single letter variable (not part of a word) followed by ( -> add *
        //    But ONLY if it's actually a standalone variable like x, y, z, a, b, etc.
        //    We detect "not part of word" by ensuring it's preceded by operator, space, or start
        //    e.g., x( -> x*(  BUT NOT sin( or log(
        exprStr = exprStr.replace(/(^|[^a-zA-Z])([a-z])(\()/gi, '$1$2*$3');

        const compiled = math.compile(exprStr);

        const { xMin, xMax } = state.graph;
        const step = (xMax - xMin) / 400;
        const data = [];

        // Check if formula is valid at least at some point
        let validCount = 0;

        for (let x = xMin; x <= xMax; x += step) {
          try {
            const y = compiled.evaluate({ x });
            // Complex number check from mathjs
            if (y && y.im) {
               data.push({ x: parseFloat(x.toFixed(6)), y: NaN });
               continue;
            }
            const val = Number(y);
            if (isFinite(val) && Math.abs(val) < 1e7) {
              data.push({ x: parseFloat(x.toFixed(6)), y: parseFloat(val.toFixed(6)) });
              validCount++;
            } else {
              data.push({ x: parseFloat(x.toFixed(6)), y: NaN });
            }
          } catch {
            data.push({ x: parseFloat(x.toFixed(6)), y: NaN });
          }
        }

        if (validCount === 0 && configHasNoVars(compiled, 'x')) {
           throw new Error("Cannot plot missing or invalid variables");
        }

        state.graph.chart.data.datasets[0].data = data;
        state.graph.chart.options.scales.x.min = xMin;
        state.graph.chart.options.scales.x.max = xMax;
        state.graph.chart.update();

        $('graph-equation').classList.remove('shake');
        $('graph-error').classList.add('hidden');
      } catch (err) {
        // Red popup / animation
        const eqInput = $('graph-equation');
        eqInput.classList.remove('shake');
        // trigger reflow
        void eqInput.offsetWidth;
        eqInput.classList.add('shake');
        
        let msg = 'Invalid equation structure';
        if (err.message) msg = err.message.substring(0, 45);
        showToast("Error: " + msg);
        
        $('graph-error').classList.add('hidden');
      }

      updateRangeLabel();
    }
    
    function configHasNoVars(compiled, varName) {
       try {
           compiled.evaluate({ [varName]: 1 });
           return false; // it evaluated properly
       } catch (e) {
           return true; // it failed, maybe missing variables
       }
    }

    function zoom(dir) {
      
      const factor = dir > 0 ? 0.6 : 1.6;
      const center = (state.graph.xMin + state.graph.xMax) / 2;
      const halfRange = ((state.graph.xMax - state.graph.xMin) / 2) * factor;
      state.graph.xMin = center - halfRange;
      state.graph.xMax = center + halfRange;
      updateRangeLabel();
      // Re-plot if there's data
      if (state.graph.chart && state.graph.chart.data.datasets[0].data.length > 0) {
        plot();
      }
    }

    function reset() {
      
      state.graph.xMin = -10;
      state.graph.xMax = 10;
      updateRangeLabel();
      if (state.graph.chart && state.graph.chart.data.datasets[0].data.length > 0) {
        plot();
      }
    }

    function updateRangeLabel() {
      $('graph-range-label').textContent =
        `x: [${state.graph.xMin.toFixed(1)}, ${state.graph.xMax.toFixed(1)}]`;
    }

    return { init, plot, zoom, reset };
  })();

  /* ===== CONVERTER MODULE ============================================== */
  const Converter = (() => {
    const tables = {
      length: {
        units: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch'],
        // All relative to Meter
        factors: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 }
      },
      mass: {
        units: ['Kilogram', 'Gram', 'Milligram', 'Pound', 'Ounce', 'Ton (metric)', 'Stone'],
        factors: { Kilogram: 1, Gram: 0.001, Milligram: 1e-6, Pound: 0.453592, Ounce: 0.0283495, 'Ton (metric)': 1000, Stone: 6.35029 }
      },
      temperature: {
        units: ['Celsius', 'Fahrenheit', 'Kelvin'],
        factors: null // special handling
      },
      volume: {
        units: ['Liter', 'Milliliter', 'Gallon (US)', 'Quart', 'Pint', 'Cup', 'Fluid Ounce', 'Cubic Meter'],
        factors: { Liter: 1, Milliliter: 0.001, 'Gallon (US)': 3.78541, Quart: 0.946353, Pint: 0.473176, Cup: 0.24, 'Fluid Ounce': 0.0295735, 'Cubic Meter': 1000 }
      },
      data: {
        units: ['Byte', 'Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte', 'Petabyte', 'Bit'],
        factors: { Byte: 1, Kilobyte: 1024, Megabyte: 1048576, Gigabyte: 1073741824, Terabyte: 1099511627776, Petabyte: 1125899906842624, Bit: 0.125 }
      },
      speed: {
        units: ['m/s', 'km/h', 'mph', 'knot', 'ft/s'],
        factors: { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knot': 0.514444, 'ft/s': 0.3048 }
      }
    };

    function changeCategory() {
      state.converter.category = $('conv-category').value;
      const cat = tables[state.converter.category];
      populateSelect('conv-from-unit', cat.units, 0);
      populateSelect('conv-to-unit', cat.units, 1);
      convert();
    }

    function populateSelect(id, units, defaultIndex) {
      const sel = $(id);
      sel.innerHTML = '';
      units.forEach((u, i) => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = u;
        if (i === defaultIndex) opt.selected = true;
        sel.appendChild(opt);
      });
    }

    function convert() {
      const cat = tables[state.converter.category];
      const fromUnit = $('conv-from-unit').value;
      const toUnit = $('conv-to-unit').value;
      const fromVal = parseFloat($('conv-from-val').value);

      if (isNaN(fromVal)) {
        $('conv-to-val').value = '';
        return;
      }

      let result;
      if (state.converter.category === 'temperature') {
        result = convertTemp(fromVal, fromUnit, toUnit);
      } else {
        // Convert through base unit
        const base = fromVal * cat.factors[fromUnit];
        result = base / cat.factors[toUnit];
      }

      $('conv-to-val').value = formatNumber(result);
    }

    function convertTemp(val, from, to) {
      // Normalize to Celsius first
      let c;
      if (from === 'Celsius') c = val;
      else if (from === 'Fahrenheit') c = (val - 32) * 5 / 9;
      else c = val - 273.15; // Kelvin

      // Convert from Celsius to target
      if (to === 'Celsius') return c;
      if (to === 'Fahrenheit') return c * 9 / 5 + 32;
      return c + 273.15; // Kelvin
    }

    function swap() {
      
      const fromSel = $('conv-from-unit');
      const toSel = $('conv-to-unit');
      const tmpVal = fromSel.value;
      fromSel.value = toSel.value;
      toSel.value = tmpVal;
      convert();
    }

    return { changeCategory, convert, swap };
  })();

  /* ===== DATE CALCULATOR MODULE ========================================= */
  const DateCalc = (() => {
    function setToday() {
      
      const today = new Date();
      $('date-target').value = formatDate(today);
      calculate();
    }

    function formatDate(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function calculate() {
      const dobStr = $('date-dob').value;
      const targetStr = $('date-target').value;

      if (!dobStr || !targetStr) {
        $('date-results').classList.add('hidden');
        $('date-error').classList.add('hidden');
        return;
      }

      const dob = new Date(dobStr + 'T00:00:00');
      const target = new Date(targetStr + 'T00:00:00');

      if (isNaN(dob.getTime()) || isNaN(target.getTime())) {
        showError('Invalid date input.');
        return;
      }

      if (target < dob) {
        showError('Target date must be after the date of birth.');
        return;
      }

      // Calculate age in years, months, days
      let years = target.getFullYear() - dob.getFullYear();
      let months = target.getMonth() - dob.getMonth();
      let days = target.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        // Days in previous month of target
        const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      // Total days
      const msPerDay = 86400000;
      const totalDays = Math.floor((target - dob) / msPerDay);

      // Next birthday
      const thisYear = target.getFullYear();
      let nextBday = new Date(thisYear, dob.getMonth(), dob.getDate());
      if (nextBday <= target) {
        nextBday = new Date(thisYear + 1, dob.getMonth(), dob.getDate());
      }
      const daysUntilBday = Math.ceil((nextBday - target) / msPerDay);

      $('date-age').textContent = `${years}y ${months}m ${days}d`;
      $('date-total-days').textContent = totalDays.toLocaleString() + ' days';
      $('date-next-bday').textContent = `${daysUntilBday} day${daysUntilBday !== 1 ? 's' : ''} away`;

      $('date-results').classList.remove('hidden');
      $('date-error').classList.add('hidden');
    }

    function showError(msg) {
      $('date-error').textContent = msg;
      $('date-error').classList.remove('hidden');
      $('date-results').classList.add('hidden');
    }

    return { setToday, calculate };
  })();

  /* ===== SETTINGS MODULE =============================================== */
  const Settings = (() => {
    function open() {
      $('settings-overlay').classList.remove('hidden');
      $('settings-drawer').classList.remove('hidden');
      // Trigger reflow for transition
      requestAnimationFrame(() => {
        $('settings-overlay').classList.add('show');
        $('settings-drawer').classList.add('show');
      });
    }

    function close() {
      $('settings-overlay').classList.remove('show');
      $('settings-drawer').classList.remove('show');
      setTimeout(() => {
        $('settings-overlay').classList.add('hidden');
        $('settings-drawer').classList.add('hidden');
      }, 350);
    }

    function toggleAngle(isRad) {
      state.settings.angleUnit = isRad ? 'rad' : 'deg';
      $('angle-label').textContent = isRad ? 'Radians' : 'Degrees';
      saveSettings();
    }

    function setPrecision(val) {
      state.settings.precision = parseInt(val, 10);
      $('precision-value').textContent = val;
      saveSettings();
    }

    function setNumberFormat(format) {
      state.settings.numberFormat = format;
      saveSettings();
      // Re-render the current display with new format
      if (state.displayValue !== '0' && state.displayValue !== 'Error') {
        const num = parseFloat(state.displayValue);
        if (!isNaN(num)) {
          state.displayValue = formatNumber(num);
          $('calc-display').textContent = state.displayValue;
        }
      }
    }

    function saveSettings() {
      try {
        localStorage.setItem('supercalc_settings', JSON.stringify(state.settings));
      } catch { /* ignore */ }
    }

    function loadSettings() {
      try {
        const saved = JSON.parse(localStorage.getItem('supercalc_settings'));
        if (!saved) return;
        Object.assign(state.settings, saved);

        // Apply angle unit
        const isRad = state.settings.angleUnit === 'rad';
        $('toggle-angle').checked = isRad;
        $('angle-label').textContent = isRad ? 'Radians' : 'Degrees';

        // Apply precision
        $('precision-slider').value = state.settings.precision;
        $('precision-value').textContent = state.settings.precision;

        // Apply number format
        if (state.settings.numberFormat) {
          $('number-format').value = state.settings.numberFormat;
        }
      } catch { /* ignore */ }
    }

    return { open, close, toggleAngle, setPrecision, setNumberFormat, loadSettings };
  })();

  /* ===== KEYBOARD SUPPORT ============================================== */
  function handleKeyboard(e) {
    if (state.currentTab !== 'calculator') return;

    const key = e.key;
    if (/^[0-9]$/.test(key)) { Calc.input(key); e.preventDefault(); }
    else if (key === '.') { Calc.input('.'); e.preventDefault(); }
    else if (key === '+') { Calc.input('+'); e.preventDefault(); }
    else if (key === '-') { Calc.input('-'); e.preventDefault(); }
    else if (key === '*') { Calc.input('*'); e.preventDefault(); }
    else if (key === '/') { Calc.input('/'); e.preventDefault(); }
    else if (key === '(' || key === ')') { Calc.input(key); e.preventDefault(); }
    else if (key === '%') { Calc.input('%'); e.preventDefault(); }
    else if (key === '^') { Calc.input('^'); e.preventDefault(); }
    else if (key === '!' ) { Calc.input('!'); e.preventDefault(); }
    else if (key === 'Enter' || key === '=') { Calc.evaluate(); e.preventDefault(); }
    else if (key === 'Backspace') {
      
      if (state.justEvaluated) {
        Calc.clear();
      } else {
        state.expression = state.expression.slice(0, -1);
        state.displayValue = state.expression || '0';
        $('calc-display').textContent = state.displayValue;
        updateDisplaySize();
      }
      e.preventDefault();
    }
    else if (key === 'Escape' || key === 'Delete') { Calc.clear(); e.preventDefault(); }
  }

  /* ===== MOBILE TOUCH ENHANCEMENTS ===================================== */
  function initMobileTouch() {
    // Prevent double-tap zoom on buttons
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault();
      }
      lastTap = now;
    }, { passive: false });

    // Prevent context menu on long press for buttons
    document.querySelectorAll('.btn, .icon-btn, .tab, .mode-btn').forEach(el => {
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    // Pinch-to-zoom on graph canvas
    const canvasWrap = document.querySelector('.graph-canvas-wrap');
    if (canvasWrap) {
      let initialDist = 0;
      let initialRange = 0;

      canvasWrap.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          initialDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          initialRange = state.graph.xMax - state.graph.xMin;
        }
      }, { passive: true });

      canvasWrap.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialDist > 0) {
          e.preventDefault();
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const scale = initialDist / dist;
          const center = (state.graph.xMin + state.graph.xMax) / 2;
          const halfRange = (initialRange / 2) * scale;
          state.graph.xMin = center - halfRange;
          state.graph.xMax = center + halfRange;
          if (state.graph.chart && state.graph.chart.data.datasets[0].data.length > 0) {
            Graph.plot();
          }
        }
      }, { passive: false });
    }
  }

  /* ===== INIT =========================================================== */
  function init() {
    // Load saved settings
    Settings.loadSettings();

    // Attach ripple + haptic to all buttons
    document.querySelectorAll('.btn, .icon-btn, .tab, .swap-btn, .mode-btn').forEach(btn => {
      btn.addEventListener('pointerdown', addRipple);
    });

    // Keyboard
    document.addEventListener('keydown', handleKeyboard);

    // Graph: Enter key to plot
    $('graph-equation').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') Graph.plot();
    });

    // Set default target date to today for date calculator
    const today = new Date();
    $('date-target').value = DateCalc_formatDate(today);

    // Mobile touch enhancements
    initMobileTouch();
  }

  function DateCalc_formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);

  /* ----- Public API ---------------------------------------------------- */
  return { switchTab, Calc, Graph, Converter, DateCalc, Settings };
})();
