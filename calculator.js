/* ============================================================
   Calculator — CodeAlpha Task 2
   State machine:
     current    — digits typed on screen (string, '' when empty)
     previous   — committed operand waiting for the result
     operation  — pending operator ('+', '−', '×', '÷') or null
     resultState— true right after a result shows; next digit starts fresh
     lastExpr   — completed expression shown above the result (e.g. "7 + 5 =")
   ============================================================ */
(function () {
  'use strict';

  const exprEl = document.getElementById('displayExpr');
  const valueEl = document.getElementById('displayValue');

  function roundTo(n) {
    if (Number.isInteger(n)) return String(n);
    return String(parseFloat(n.toFixed(10)));
  }

  class Calculator {
    constructor() { this.reset(); }

    reset() {
      this.current = '';
      this.previous = '';
      this.operation = null;
      this.resultState = false;
      this.error = false;
      this.lastExpr = '';
    }

    show() {
      let val;
      if (this.error) {
        exprEl.textContent = '';
        val = 'Error';
      } else if (this.operation && this.previous !== '') {
        // Pending operation: expression line shows "7 +", value = typed operand
        exprEl.textContent = this.previous + ' ' + this.operation;
        val = this.current !== '' ? this.current : this.previous;
      } else {
        exprEl.textContent = this.lastExpr;
        val = this.current !== '' ? this.current : '0';
      }
      valueEl.textContent = val;
      valueEl.classList.toggle('len-md', val.length > 10);
      valueEl.classList.toggle('len-sm', val.length > 16);
    }

    typeDigit(d) {
      if (this.error) { this.reset(); return; }
      if (this.resultState) {
        this.current = d;
        this.resultState = false;
        this.lastExpr = '';
        return;
      }
      if (this.current === '' || this.current === '0') this.current = d;
      else this.current += d;
    }

    decimal() {
      if (this.error) { this.reset(); return; }
      if (this.resultState) {
        this.current = '0.';
        this.resultState = false;
        this.lastExpr = '';
        return;
      }
      if (this.current.includes('.')) return;
      this.current = (this.current === '' ? '0' : this.current) + '.';
    }

    chooseOperation(op) {
      if (this.error) { this.reset(); return; }
      if (this.current !== '') {
        if (this.previous !== '' && this.operation) this.compute();
        this.previous = this.current;
        this.current = '';
        this.lastExpr = '';
      }
      this.operation = op;
    }

    compute() {
      if (!this.operation || this.previous === '') return;
      const a = parseFloat(this.previous);
      const b = parseFloat(this.current || '0');
      let result;
      switch (this.operation) {
        case '+':  result = a + b; break;
        case '−':  result = a - b; break;
        case '×':  result = a * b; break;
        case '÷':
          if (b === 0) { this.error = true; return; }
          result = a / b;
          break;
      }
      this.lastExpr = this.previous + ' ' + this.operation + ' ' + (this.current || '0') + ' =';
      this.current = roundTo(result);
      this.previous = '';
      this.operation = null;
      this.resultState = true;
    }

    equal() {
      if (this.error) return;
      if (this.operation && this.previous !== '') this.compute();
    }

    negate() {
      if (this.error) { this.reset(); return; }
      if (this.current !== '') {
        this.current = String(-parseFloat(this.current));
        if (this.resultState) this.lastExpr = '';
      }
    }

    sqrt() {
      if (this.error) { this.reset(); return; }
      const raw = this.current !== ''
        ? parseFloat(this.current)
        : (this.previous !== '' ? parseFloat(this.previous) : NaN);
      if (Number.isNaN(raw)) return;   // nothing entered — do nothing
      if (raw < 0) { this.error = true; return; }
      const source = this.current !== '' ? this.current : this.previous;
      this.lastExpr = '√(' + source + ') =';
      this.current = roundTo(Math.sqrt(raw));
      this.previous = '';
      this.operation = null;
      this.resultState = true;
    }

    backspace() {
      if (this.error) { this.reset(); return; }
      if (this.resultState) { this.lastExpr = ''; this.resultState = false; }
      if (this.current !== '') this.current = this.current.slice(0, -1);
    }

    clear() { this.reset(); }
  }

  const calc = new Calculator();
  calc.show();

  /* ---- iOS-style operator highlight ---- */
  function setActiveOperator(action) {
    document.querySelectorAll('.btn-operator').forEach(function (b) {
      b.classList.toggle('active', b.dataset.action === action);
    });
  }

  const OP_ACTIONS = ['divide', 'multiply', 'subtract', 'add'];

  /* ---- Button clicks (event delegation) ---- */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'digit') calc.typeDigit(btn.dataset.digit);
    else if (action === 'clear') calc.clear();
    else if (action === 'backspace') calc.backspace();
    else if (action === 'sqrt') calc.sqrt();
    else if (action === 'negate') calc.negate();
    else if (action === 'divide') calc.chooseOperation('÷');
    else if (action === 'multiply') calc.chooseOperation('×');
    else if (action === 'subtract') calc.chooseOperation('−');
    else if (action === 'add') calc.chooseOperation('+');
    else if (action === 'equal') calc.equal();
    else if (action === 'decimal') calc.decimal();
    setActiveOperator(OP_ACTIONS.indexOf(action) !== -1 ? action : null);
    calc.show();
  });

  /* ---- Keyboard support ---- */
  document.addEventListener('keydown', function (e) {
    switch (e.key) {
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        calc.typeDigit(e.key); break;
      case '.':        calc.decimal(); break;
      case '+':        calc.chooseOperation('+'); break;
      case '-': case '−': calc.chooseOperation('−'); break;
      case '*': case '×': calc.chooseOperation('×'); break;
      case '/': case '÷': calc.chooseOperation('÷'); break;
      case 'Enter':    calc.equal(); break;
      case 'Escape': case 'Delete': calc.clear(); break;
      case 'Backspace':calc.backspace(); break;
      default: return;
    }
    const KEY_TO_OP = {
      '+': 'add', '-': 'subtract', '−': 'subtract',
      '*': 'multiply', '×': 'multiply',
      '/': 'divide', '÷': 'divide'
    };
    setActiveOperator(KEY_TO_OP[e.key] || null);
    calc.show();
  });
})();
