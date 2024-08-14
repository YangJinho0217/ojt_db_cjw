const express = require("express");
const cors = require('cors');
const port = 3200;

const router = require("./src/loaders/routes");
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger-output.json')
const app = express();

app.use(cors({
  origin: true,
  credentials: true, // 크로스 도메인 허용
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

// 개발서버 포트
app.set('port', process.env.PORT || port);

//swagger 모듈 호출하기
app.use("/ojt-cjw-swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile, {explorer : true}));

app.get("/", (req, res) => {
  res.send("BackEnd Server Page");
});

app.listen(port, () => {
  console.log("Server Start...." + port);
});