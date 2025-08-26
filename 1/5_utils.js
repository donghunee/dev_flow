// utils.js
// 날짜 포맷팅 함수
function formatDate(date, format) {
  const d = new Date(date);

  if (format === 'YYYY-MM-DD') {
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  } else if (format === 'MM/DD/YYYY') {
    return d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();
  }

  return d.toString();
}

// 배열 중복 제거
function removeDuplicates(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < result.length; j++) {
      if (arr[i] === result[j]) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      result.push(arr[i]);
    }
  }
  return result;
}

// 객체 깊은 복사
function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepCopy(item));
  }

  const copiedObj = {};
  for (let key in obj) {
    copiedObj[key] = deepCopy(obj[key]);
  }

  return copiedObj;
}

// 이메일 검증
function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

// 문자열 escape
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// API 응답 처리 헬퍼
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 디바운스 함수
function debounce(func, delay) {
  let timeoutId;
  return function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, arguments), delay);
  };
}

module.exports = {
  formatDate,
  removeDuplicates,
  deepCopy,
  validateEmail,
  escapeHtml,
  apiCall,
  debounce,
};
