// const swaggerUi = require("swagger-ui-express");
// const swaggerJsdoc = require("swagger-jsdoc");
// const swaggerAutogen = require('swagger-autogen')();

// const doc = {
//   info: {
//       varsion: '0.0.1',
//       title: '뇌출혈진단앱 API',
//       description: '한림대 뇌출혈 진단앱 API 명세',
//   },
//   host: 'localhost:3200', // by default: 'localhost:3000'
//   basePath: '/', // by default: '/'
//   schemes: [], // by default: ['http']
//   consumes: [], // by default: ['application/json']
//   produces: [], // by default: ['application/json']
//   securityDefinitions: {
//     apiKeyAuth : {
//         type: 'apiKey',
//         in: 'header',
//         name : 'token',
//         description : '유저token'
//     }
//   }, // by default: empty object
//   definitions: {}, // by default: empty object (Swagger 2.0)
//   components: {}, // by default: empty object (OpenAPI 3.x)
//   tags: [
//       {
//           "name": "user",
//           "description": "회원가입/로그인/로그아웃"
//       },
//       {
//         "name": "home",
//         "description": "홈화면/모아보기 등"
//       },
//       {
//           "name": "ptn",
//           "description": "환자"
//       },
//       {
//           "name": "crr",
//           "description": "보호자"
//       },
//       {
//           "name": "bsr",
//           "description": "혈당"
//       },
//       {
//           "name": "pre",
//           "description": "혈압"
//       },
//       {
//           "name": "trt",
//           "description": "진료"
//       },
//       {
//           "name": "day",
//           "description": "일상"
//       },
//       {
//           "name": "sym",
//           "description": "증상"
//       },
//       {
//           "name": "com",
//           "description": "공통코드"
//       }
//     ]
// };

// const outputFile = "./src/swagger/swagger-output.json";
// const endpointsFiles = [
//   './src/app.js',
//   './src/loaders/routes.js'
// ];

// swaggerAutogen(outputFile, endpointsFiles, doc);
// // const specs = swaggerJsdoc(options);

// // module.exports = {
// //   swaggerUi,
// //   specs,
// // };