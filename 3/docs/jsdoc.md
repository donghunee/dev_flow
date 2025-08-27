## JSDoc이란?

- JavaScript 코드에 대한 API 문서를 자동 생성하는 도구
- 주석으로 작성하지만 실제 문서로 변환 가능
- VS Code 자동완성 및 타입 힌트 제공

기본 JSDoc 태그들

```js
/**
 * 함수 설명
 * @param {타입} 매개변수명 - 매개변수 설명
 * @returns {타입} 반환값 설명
 * @throws {에러타입} 에러 설명
 * @example
 * // 사용 예시 코드
 * @since 버전정보
 * @author 작성자
 */
```

---

## Swagger란?

- RESTful API 문서를 자동으로 생성하고 시각화하는 도구
- OpenAPI 명세를 기반으로 API 설계, 문서화, 테스트를 지원
- 개발자와 사용자 간 API 소통을 위한 표준화된 인터페이스 제공

기본 Swagger 어노테이션들

```yaml
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 사용자 목록 조회
 *     description: 등록된 모든 사용자 정보를 가져옵니다
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
```

주요 Swagger 태그들

```yaml
# 스키마 정의
components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
          description: 사용자 ID
        name:
          type: string
          description: 사용자 이름
        email:
          type: string
          format: email
          description: 이메일 주소

# 보안 설정
securityDefinitions:
  Bearer:
    type: apiKey
    name: Authorization
    in: header
```

link : https://editor.swagger.io/
