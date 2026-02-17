import { Sequelize } from 'sequelize';

const database = process.env.DBNAME;
const username = process.env.DBUSERNAME;
const password = process.env.DBPASSWORD;

export const sequelize = new Sequelize(database,username ,password , {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

