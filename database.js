import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'data/database.sqlite'
});

export const User = sequelize.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true
  },
  coins: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});