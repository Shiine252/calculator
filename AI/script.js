(() => {
  const result = document.querySelector('#result');
  const expression = document.querySelector('#expression');
  const keys = document.querySelectorAll('.key');
  let current = '0';
  let stored = null;
  let operator = null;
  let replaceCurrent = false;
  let justCalculated = false;

  const format = value => {
    if (!Number.isFinite(value)) return 'Error';
    const rounded = Number.parseFloat(value.toPrecision(11));
    return String(rounded);
  };
  const render = () => {
    result.textContent = current;
    document.querySelectorAll('.key-operator').forEach(key => {
      key.classList.toggle('is-active', key.dataset.operator === operator && !replaceCurrent);
    });
  };
  const clear = () => {
    current = '0'; stored = null; operator = null;
    replaceCurrent = false; justCalculated = false; expression.textContent = ''; render();
  };
  const digit = value => {
    if (current === 'Error' || replaceCurrent || justCalculated) {
      current = value; replaceCurrent = false; justCalculated = false;
      if (!operator) expression.textContent = '';
    } else if (current.replace('-', '').replace('.', '').length < 12) {
      current = current === '0' ? value : current === '-0' ? `-${value}` : current + value;
    }
    render();
  };
  const calculate = (a, op, b) => {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? NaN : a / b;
      default: return b;
    }
  };
  const chooseOperator = next => {
    if (current === 'Error') return;
    const value = Number(current);
    if (operator && !replaceCurrent) {
      current = format(calculate(stored, operator, value));
      stored = Number(current);
    } else stored = value;
    operator = next; replaceCurrent = true; justCalculated = false;
    expression.textContent = `${current} ${next}`; render();
  };
  const equals = () => {
    if (!operator || stored === null || current === 'Error') return;
    const right = Number(current), left = stored, op = operator;
    current = format(calculate(left, op, right));
    expression.textContent = `${format(left)} ${op} ${format(right)} =`;
    operator = null; stored = null; replaceCurrent = true; justCalculated = true; render();
  };
  const act = action => {
    switch (action) {
      case 'clear': clear(); break;
      case 'delete':
        if (current !== 'Error' && !replaceCurrent && !justCalculated) current = current.length > 1 ? current.slice(0, -1) : '0';
        render(); break;
      case 'decimal':
        if (current === 'Error' || replaceCurrent || justCalculated) { current = '0.'; replaceCurrent = false; justCalculated = false; }
        else if (!current.includes('.')) current += '.';
        render(); break;
      case 'sign':
        if (current !== 'Error' && Number(current) !== 0) current = current.startsWith('-') ? current.slice(1) : `-${current}`;
        render(); break;
      case 'percent':
        if (current !== 'Error') { current = format(Number(current) / 100); render(); }
        break;
      case 'equals': equals(); break;
    }
  };

  keys.forEach(key => key.addEventListener('click', () => {
    if (key.dataset.digit !== undefined) digit(key.dataset.digit);
    else if (key.dataset.operator) chooseOperator(key.dataset.operator);
    else act(key.dataset.action);
  }));

  document.addEventListener('keydown', event => {
    if (/^[0-9]$/.test(event.key)) digit(event.key);
    else if (event.key === '.') act('decimal');
    else if (event.key === 'Backspace') act('delete');
    else if (event.key === 'Escape' || event.key.toLowerCase() === 'c') clear();
    else if (event.key === 'Enter' || event.key === '=') equals();
    else if (event.key === '+') chooseOperator('+');
    else if (event.key === '-') chooseOperator('−');
    else if (event.key === '*') chooseOperator('×');
    else if (event.key === '/') { event.preventDefault(); chooseOperator('÷'); }
    else if (event.key === '%') act('percent');
    else return;
    if (event.key !== 'Backspace' && event.key !== 'Escape') event.preventDefault();
  });
  render();
})();
