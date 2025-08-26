// utils/data-processor.js
class DataProcessor {
  constructor(options) {
    this.batchSize = options.batchSize || 100;
    this.timeout = options.timeout || 5000;
    this.retryCount = options.retryCount || 3;
    this.validationRules = options.validationRules || {};
  }

  async processData(data, processors) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('데이터 배열이 필요합니다');
    }

    const results = [];
    const batches = this.createBatches(data);

    for (const batch of batches) {
      try {
        const batchResult = await this.processBatch(batch, processors);
        results.push(...batchResult);
      } catch (error) {
        if (this.retryCount > 0) {
          this.retryCount--;
          continue;
        }
        throw error;
      }
    }

    return {
      totalProcessed: results.length,
      results: results,
      timestamp: new Date().toISOString(),
    };
  }

  createBatches(data) {
    const batches = [];
    for (let i = 0; i < data.length; i += this.batchSize) {
      batches.push(data.slice(i, i + this.batchSize));
    }
    return batches;
  }

  async processBatch(batch, processors) {
    const results = [];

    for (const item of batch) {
      if (!this.validateItem(item)) {
        continue;
      }

      let processedItem = item;
      for (const processor of processors) {
        processedItem = await processor(processedItem);
      }

      results.push(processedItem);
    }

    return results;
  }

  validateItem(item) {
    if (!item || typeof item !== 'object') {
      return false;
    }

    for (const [field, rule] of Object.entries(this.validationRules)) {
      if (!rule(item[field])) {
        return false;
      }
    }

    return true;
  }

  static createNumberValidator(min, max) {
    return function (value) {
      return typeof value === 'number' && value >= min && value <= max;
    };
  }

  static createStringValidator(minLength, maxLength) {
    return function (value) {
      return (
        typeof value === 'string' &&
        value.length >= minLength &&
        value.length <= maxLength
      );
    };
  }
}

function transformUserData(userData, options = {}) {
  const defaultOptions = {
    includeMetadata: true,
    dateFormat: 'ISO',
    excludeFields: [],
  };

  const config = { ...defaultOptions, ...options };
  const transformed = {};

  for (const [key, value] of Object.entries(userData)) {
    if (config.excludeFields.includes(key)) {
      continue;
    }

    if (key.includes('date') || key.includes('time')) {
      transformed[key] = formatDate(value, config.dateFormat);
    } else {
      transformed[key] = value;
    }
  }

  if (config.includeMetadata) {
    transformed.metadata = {
      transformedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  return transformed;
}

function formatDate(dateValue, format) {
  const date = new Date(dateValue);

  switch (format) {
    case 'ISO':
      return date.toISOString();
    case 'locale':
      return date.toLocaleDateString();
    case 'timestamp':
      return date.getTime();
    default:
      return date.toString();
  }
}

module.exports = { DataProcessor, transformUserData, formatDate };
