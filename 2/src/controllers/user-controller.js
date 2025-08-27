// controllers/user-controller.js
const UserService = require('../services/user-service');
const bcrypt = require('bcrypt');
const { validateEmail, validatePassword } = require('../utils/validation');

/**
 * 사용자 관리를 위한 컨트롤러 클래스
 * @class UserController
 */
class UserController {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * 새로운 사용자를 생성합니다
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @returns {Promise<void>}
   */
  async createUser(req, res) {
    try {
      const { name, email, password } = req.body;

      // 입력 검증 강화
      if (!name || !email || !password) {
        return res.status(400).json({
          error: '필수 필드가 누락되었습니다',
          details: {
            name: !name ? '이름이 필요합니다' : null,
            email: !email ? '이메일이 필요합니다' : null,
            password: !password ? '비밀번호가 필요합니다' : null
          }
        });
      }

      // 이메일 형식 검증
      if (!validateEmail(email)) {
        return res.status(400).json({
          error: '유효하지 않은 이메일 형식입니다'
        });
      }

      // 비밀번호 강도 검증
      if (!validatePassword(password)) {
        return res.status(400).json({
          error: '비밀번호는 최소 8자리, 대소문자, 숫자, 특수문자를 포함해야 합니다'
        });
      }

      // 이메일 중복 확인
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: '이미 존재하는 이메일입니다',
        });
      }

      // 비밀번호 해시화
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 사용자 생성
      const newUser = await this.userService.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      });

      res.status(201).json({
        success: true,
        message: '사용자가 성공적으로 생성되었습니다',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
        },
      });
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      res.status(500).json({
        error: '서버 내부 오류가 발생했습니다',
        message: '잠시 후 다시 시도해 주세요'
      });
    }
  }

  /**
   * 사용자 정보를 조회합니다
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @returns {Promise<void>}
   */
  async getUser(req, res) {
    try {
      const { id } = req.params;

      // ID 검증
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          error: '유효하지 않은 사용자 ID입니다'
        });
      }

      const user = await this.userService.findById(parseInt(id));
      if (!user) {
        return res.status(404).json({
          error: '사용자를 찾을 수 없습니다',
          message: `ID ${id}에 해당하는 사용자가 존재하지 않습니다`
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
      });
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      res.status(500).json({
        error: '서버 내부 오류가 발생했습니다',
        message: '잠시 후 다시 시도해 주세요'
      });
    }
  }

  /**
   * 모든 사용자 목록을 조회합니다 (페이지네이션 지원)
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @returns {Promise<void>}
   */
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // 페이지네이션 파라미터 검증
      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          error: '잘못된 페이지네이션 파라미터입니다',
          message: 'page는 1 이상, limit는 1-100 사이여야 합니다'
        });
      }

      const { users, total } = await this.userService.findAll(limit, offset);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          })),
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error);
      res.status(500).json({
        error: '서버 내부 오류가 발생했습니다',
        message: '잠시 후 다시 시도해 주세요'
      });
    }
  }

  /**
   * 사용자 정보를 업데이트합니다
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @returns {Promise<void>}
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      // ID 검증
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          error: '유효하지 않은 사용자 ID입니다'
        });
      }

      // 업데이트할 데이터가 있는지 확인
      if (!name && !email) {
        return res.status(400).json({
          error: '업데이트할 데이터가 없습니다',
          message: 'name 또는 email 중 하나는 제공되어야 합니다'
        });
      }

      // 사용자 존재 확인
      const existingUser = await this.userService.findById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({
          error: '사용자를 찾을 수 없습니다'
        });
      }

      const updateData = {};
      
      // 이름 업데이트 검증
      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(400).json({
            error: '이름은 비어있을 수 없습니다'
          });
        }
        updateData.name = name.trim();
      }

      // 이메일 업데이트 검증
      if (email !== undefined) {
        if (!validateEmail(email)) {
          return res.status(400).json({
            error: '유효하지 않은 이메일 형식입니다'
          });
        }

        // 이메일 중복 확인 (자신 제외)
        const emailExists = await this.userService.findByEmail(email);
        if (emailExists && emailExists.id !== parseInt(id)) {
          return res.status(409).json({
            error: '이미 사용 중인 이메일입니다'
          });
        }
        updateData.email = email.toLowerCase().trim();
      }

      const updatedUser = await this.userService.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: '사용자 정보가 성공적으로 업데이트되었습니다',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (error) {
      console.error('사용자 업데이트 오류:', error);
      res.status(500).json({
        error: '서버 내부 오류가 발생했습니다',
        message: '잠시 후 다시 시도해 주세요'
      });
    }
  }

  /**
   * 사용자를 삭제합니다
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @returns {Promise<void>}
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // ID 검증
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          error: '유효하지 않은 사용자 ID입니다'
        });
      }

      // 사용자 존재 확인
      const existingUser = await this.userService.findById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({
          error: '사용자를 찾을 수 없습니다'
        });
      }

      await this.userService.delete(parseInt(id));

      res.status(200).json({
        success: true,
        message: '사용자가 성공적으로 삭제되었습니다',
        deletedUser: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email
        }
      });
    } catch (error) {
      console.error('사용자 삭제 오류:', error);
      res.status(500).json({
        error: '서버 내부 오류가 발생했습니다',
        message: '잠시 후 다시 시도해 주세요'
      });
    }
  }
}

module.exports = UserController;
