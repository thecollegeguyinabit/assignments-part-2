import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

// define the schema of the course table
export const Course = sequelize.define('Course',{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  courseDuration: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  courseFees: {
    type: DataTypes.DECIMAL(100,2),
    allowNull: false,
    validate: {
      isDecimal: true,
      notEmpty: true,
      max: 100
    }
  }
}, {
  tableName: 'courses',
  timestamps: true
});