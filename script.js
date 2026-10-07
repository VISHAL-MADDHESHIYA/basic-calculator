class Calculator {
  constructor(previousOperandElement, currentOperandElement, historyListElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.historyListElement = historyListElement;
    this.history = [];
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.isError = false;
  }

  delete() {
    if (this.isError) return this.clear();
    if (this.currentOperand === '0') return;
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
    if (this.currentOperand === '') this.currentOperand = '0';
  }

  appendNumber(number) {
    if (this.isError) this.clear();
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
  }

  chooseOperation(operation) {
    if (this.isError) return;
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
  }

  percentage() {
    if (this.isError) return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;
    this.currentOperand = (current / 100).toString();
  }

  toggleSign() {
    if (this.isError || this.currentOperand === '0') return;
    const current = parseFloat(this.currentOperand);
    this.currentOperand = (-1 * current).toString();
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    
    if (isNaN(prev) || isNaN(current)) return;

    if (this.operation === '÷' && current === 0) {
      this.isError = true;
      this.currentOperand = 'Cannot divide by 0';
      this.previousOperand = '';
      this.operation = undefined;
      return;
    }

    switch (this.operation) {
      case '+': computation = prev + current; break;
      case '-': computation = prev - current; break;
      case '×': computation = prev * current; break;
      case '÷': computation = prev / current; break;
      default: return;
    }

    this.addToHistory(`${prev} ${this.operation} ${current}`, computation);
    this.currentOperand = computation.toString();
    this.operation = undefined;
    this.previousOperand = '';
  }

  addToHistory(expression, result) {
    this.history.unshift({ expression, result });
    if (this.history.length > 15) this.history.pop();
    this.renderHistory();
  }

  renderHistory() {
    this.historyListElement.innerHTML = '';
    if (this.history.length === 0) {
      this.historyListElement.innerHTML = '<li style="text-align:center; color:var(--display-muted); font-size:0.9rem;">No history yet</li>';
      return;
    }
    this.history.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.expression} =</span> <strong>${item.result}</strong>`;
      this.historyListElement.appendChild(li);
    });
  }

  clearHistory() {
    this.history = [];
    this.renderHistory();
  }

  getDisplayNumber(number) {
    if (isNaN(number) || number === 'Cannot divide by 0') return number;
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;
    
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }
    
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
    if (this.operation != null) {
      this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandElement.innerText = '';
    }
  }
}

// DOM Elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-action="equals"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const previousOperandElement = document.querySelector('.previous-operand');
const currentOperandElement = document.querySelector('.current-operand');
const historyListElement = document.getElementById('historyList');
const themeToggle = document.getElementById('themeToggle');
const clearHistoryBtn = document.getElementById('clearHistory');
const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');
const closeHistoryBtn = document.getElementById('closeHistory');

// Initialize Calculator
const calculator = new Calculator(previousOperandElement, currentOperandElement, historyListElement);

// Event Listeners
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.dataset.number);
    calculator.updateDisplay();
  });
});

operationButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.chooseOperation(button.dataset.operator);
    calculator.updateDisplay();
  });
});

equalsButton.addEventListener('click', () => {
  calculator.compute();
  calculator.updateDisplay();
});

clearButton.addEventListener('click', () => {
  calculator.clear();
  calculator.updateDisplay();
});

deleteButton.addEventListener('click', () => {
  calculator.delete();
  calculator.updateDisplay();
});

document.querySelector('[data-action="percentage"]').addEventListener('click', () => { calculator.percentage(); calculator.updateDisplay(); });
document.querySelector('[data-action="toggle-sign"]').addEventListener('click', () => { calculator.toggleSign(); calculator.updateDisplay(); });

// History Toggle (Open)
historyToggle.addEventListener('click', () => {
  historyPanel.classList.add('active');
});

// History Toggle (Close)
closeHistoryBtn.addEventListener('click', () => {
  historyPanel.classList.remove('active');
});

// Clear History
clearHistoryBtn.addEventListener('click', () => calculator.clearHistory());

// Theme Toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  themeToggle.innerText = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
});

// Keyboard Support
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9' || e.key === '.') {
    calculator.appendNumber(e.key);
    calculator.updateDisplay();
  }
  if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
    const operatorMap = { '*': '×', '/': '÷', '+': '+', '-': '-' };
    calculator.chooseOperation(operatorMap[e.key]);
    calculator.updateDisplay();
  }
  if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculator.compute();
    calculator.updateDisplay();
  }
  if (e.key === 'Backspace') {
    calculator.delete();
    calculator.updateDisplay();
  }
  if (e.key === 'Escape') {
    calculator.clear();
    calculator.updateDisplay();
  }
});