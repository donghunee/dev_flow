// controllers/user-controller.js
const UserService = require('../services/user-service');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async createUser(req, res) {
    try {
      const { name, email, password } = req.body;

      // 입력 검증
      if (!name || !email || !password) {
        return res.status(400).json({
          error: '필수 필드가 누락되었습니다',
        });
      }

      // 이메일 중복 확인
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: '이미 존재하는 이메일입니다',
        });
      }

      // 사용자 생성
      const newUser = await this.userService.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      res.status(500).json({
        error: '서버 내부 오류가 발생했습니다',
      });
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;

      const user = await this.userService.findById(id);
      if (!user) {
        return res.status(404).json({
          error: '사용자를 찾을 수 없습니다',
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      res.status(500).json({
        error: '서버 내부 오류가 발생했습니다',
      });
    }
  }
}

module.exports = UserController;
