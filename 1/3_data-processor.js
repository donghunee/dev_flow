// 비동기 처리 코드

// data-processor.js
const fs = require('fs');
const path = require('path');

class DataProcessor {
  constructor() {
    this.processedFiles = [];
    this.errors = [];
  }

  // 여러 파일을 순차적으로 처리
  async processFiles(filePaths) {
    for (let filePath of filePaths) {
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const result = await this.processData(data);
        this.processedFiles.push({ path: filePath, result });
      } catch (error) {
        this.errors.push({ path: filePath, error: error.message });
      }
    }

    return {
      processed: this.processedFiles,
      errors: this.errors,
    };
  }

  async processData(data) {
    // JSON 파싱
    const jsonData = JSON.parse(data);

    // 외부 API 호출
    const enrichedData = await this.enrichWithExternalData(jsonData);

    // 데이터 변환
    const transformed = this.transformData(enrichedData);

    // 데이터베이스 저장
    await this.saveToDatabase(transformed);

    return transformed;
  }

  async enrichWithExternalData(data) {
    const promises = data.items.map((item) =>
      fetch(`https://api.example.com/items/${item.id}`)
        .then((response) => response.json())
        .then((externalData) => ({ ...item, ...externalData }))
    );

    const enrichedItems = await Promise.all(promises);
    return { ...data, items: enrichedItems };
  }

  transformData(data) {
    return {
      id: data.id,
      name: data.name.toUpperCase(),
      items: data.items.map((item) => ({
        id: item.id,
        name: item.name.trim(),
        price: parseFloat(item.price),
        category: item.category || 'uncategorized',
      })),
      processedAt: new Date(),
    };
  }

  async saveToDatabase(data) {
    // 데이터베이스 저장 로직 (가상)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve({ id: Math.random(), ...data });
        } else {
          reject(new Error('Database save failed'));
        }
      }, 100);
    });
  }
}

// 사용 예시
async function main() {
  const processor = new DataProcessor();
  const files = ['data1.json', 'data2.json', 'data3.json'];

  console.log('파일 처리 시작...');
  const result = await processor.processFiles(files);
  console.log('처리 완료:', result);
}

main().catch(console.error);
