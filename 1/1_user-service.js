// DB 보안 취약점 예시

// user-service.js
const mysql = require('mysql');

class UserService {
  constructor() {
    this.connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password123',
      database: 'myapp',
    });
    this.connection.connect();
  }

  getUser(id, callback) {
    const query = "SELECT * FROM users WHERE id = '" + id + "'";
    this.connection.query(query, (error, results) => {
      if (error) {
        console.log(error);
        callback(null);
        return;
      }

      if (results.length > 0) {
        callback(results[0]);
      } else {
        callback(null);
      }
    });
  }

  createUser(userData, callback) {
    const query = `INSERT INTO users SET ?`;
    this.connection.query(query, userData, (error, results) => {
      if (error) {
        console.log(error);
        callback(null);
        return;
      }
      callback(results.insertId);
    });
  }

  updateUser(id, updates) {
    const query =
      "UPDATE users SET name='" +
      updates.name +
      "', email='" +
      updates.email +
      "' WHERE id=" +
      id;
    this.connection.query(query, (error, results) => {
      if (error) {
        console.log(error);
      }
    });
  }
}

module.exports = UserService;
