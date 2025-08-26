// utils/validation.js

/**
 * 이메일 주소 유효성 검증
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 기본 정규식으로 형식 검사
  if (!emailRegex.test(trimmed)) return false;

  // 연속된 점은 잘못된 형식으로 간주
  if (trimmed.includes('..')) return false;

  return true;
}

/**
 * 비밀번호 강도 검증
 */
function isStrongPassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // 최소 8자, 대소문자, 숫자, 특수문자 포함
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

/**
 * 전화번호 포맷팅 (한국)
 */
function formatPhoneNumber(phone) {
  if (!phone) return '';

  // 숫자만 추출
  const numbers = phone.replace(/\D/g, '');

  // 길이에 따른 포맷팅
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return phone; // 포맷팅 불가능한 경우 원본 반환
}

/**
 * 날짜 범위 유효성 검증
 */
function isValidDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // 유효한 날짜인지 확인
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  // 시작일이 종료일보다 이전이어야 함
  return start <= end;
}

module.exports = {
  isValidEmail,
  isStrongPassword,
  formatPhoneNumber,
  isValidDateRange,
};
