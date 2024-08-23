require('dotenv').config()

//커넥션 생성
// 운영기
// module.exports = {
//   port: process.env.PROD_DB_PORT,
//   host: process.env.PROD_DB_HOST,
//   database: process.env.PROD_DB_DATABASE,
//   user: process.env.PROD_DB_USER,
//   password: process.env.PROD_DB_PASSWORD,
// };

// 개발기
module.exports = {
  port: process.env.DB_PORT,
  host : process.env.DB_HOST,
  database : process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  dateStrings: "date",
}


