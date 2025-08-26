// src/utils/calculator.js
class Calculator {
  /**
   * 두 수를 더합니다
   */
  add(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('숫자만 입력 가능합니다');
    }
    return a + b;
  }

  /**
   * 두 수를 나눕니다
   */
  divide(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('숫자만 입력 가능합니다');
    }
    if (b === 0) {
      throw new Error('0으로 나눌 수 없습니다');
    }
    return a / b;
  }

  /**
   * 팩토리얼 계산 (재귀함수)
   */
  factorial(n) {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error('음이 아닌 정수만 입력 가능합니다');
    }
    if (n === 0 || n === 1) return 1;
    return n * this.factorial(n - 1);
  }

  /**
   * 비동기 계산 (API 호출 시뮬레이션)
   */
  async asyncCalculate(operation, a, b) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          switch (operation) {
            case 'add':
              resolve(this.add(a, b));
              break;
            case 'divide':
              resolve(this.divide(a, b));
              break;
            default:
              reject(new Error('지원하지 않는 연산입니다'));
          }
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }
}

module.exports = Calculator;
