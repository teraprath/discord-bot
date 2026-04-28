import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'data/database.sqlite',
  logging: false,
});

export const User = sequelize.define('user', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  coins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['coins'] },
    { fields: ['level'] },
    { fields: ['xp'] },
  ],
});

export { sequelize };