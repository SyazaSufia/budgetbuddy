const request = require('supertest');
const express = require('express');
const adminController = require('../adminController');

// Mock the database
jest.mock('../../db', () => ({
  query: jest.fn(),
}));

const db = require('../../db');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 1, role: 'admin' };
  next();
};

// Setup routes
app.get('/admin/users', mockAuth, adminController.getAllUsers);
app.delete('/admin/users/:id', mockAuth, adminController.deleteUser);

describe('Admin Controller Tests', () => {
  beforeEach(() => {
    db.query.mockClear();
  });

  describe('getAllUsers', () => {
    test('should return all users successfully', async () => {
      // Arrange
      const mockUsers = [
        { userID: 1, userName: 'John Doe', userEmail: 'john@example.com' },
        { userID: 2, userName: 'Jane Smith', userEmail: 'jane@example.com' }
      ];
      db.query.mockResolvedValue(mockUsers);

      // Act
      const response = await request(app).get('/admin/users');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUsers);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM user');
    });

    test('should handle database error', async () => {
      // Arrange
      db.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app).get('/admin/users');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      // Arrange
      const userId = '1';
      db.query
        .mockResolvedValueOnce([{ userID: 1 }]) // User exists check
        .mockResolvedValueOnce() // START TRANSACTION
        .mockResolvedValueOnce() // SET FOREIGN_KEY_CHECKS = 0
        .mockResolvedValueOnce({ affectedRows: 2 }) // Delete income records
        .mockResolvedValueOnce() // SET FOREIGN_KEY_CHECKS = 1
        .mockResolvedValueOnce({ affectedRows: 1 }) // Delete expenses
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete budgets
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete categories
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete income (second pass)
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete community_posts
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete community_comments
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete post_likes
        .mockResolvedValueOnce({ affectedRows: 1 }) // Delete user
        .mockResolvedValueOnce(); // COMMIT

      // Act
      const response = await request(app).delete(`/admin/users/${userId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User and all related data deleted successfully');
    });

    test('should return 404 if user not found', async () => {
      // Arrange
      const userId = '999';
      db.query.mockResolvedValueOnce([]); // User doesn't exist

      // Act
      const response = await request(app).delete(`/admin/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    test('should handle database transaction error', async () => {
      // Arrange
      const userId = '1';
      db.query
        .mockResolvedValueOnce([{ userID: 1 }]) // User exists
        .mockResolvedValueOnce() // START TRANSACTION
        .mockRejectedValueOnce(new Error('Transaction failed')); // Error in transaction

      // Act
      const response = await request(app).delete(`/admin/users/${userId}`);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to delete user');
    });

    test('should handle failed user deletion', async () => {
      // Arrange
      const userId = '1';
      db.query
        .mockResolvedValueOnce([{ userID: 1 }]) // User exists
        .mockResolvedValueOnce() // START TRANSACTION
        .mockResolvedValueOnce() // SET FOREIGN_KEY_CHECKS = 0
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete income records
        .mockResolvedValueOnce() // SET FOREIGN_KEY_CHECKS = 1
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete expenses
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete budgets
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete categories
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete income (second pass)
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete community_posts
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete community_comments
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete post_likes
        .mockResolvedValueOnce({ affectedRows: 0 }) // Delete user (failed)
        .mockResolvedValueOnce(); // ROLLBACK

      // Act
      const response = await request(app).delete(`/admin/users/${userId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to delete user');
    });
  });
});