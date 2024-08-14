// web.js 는 실제 사용 안함 삭제해도 무방
// 테스트 API 호출 용으로 사용 중 

const express = require("express");
const router = express.Router();
const mysql = require("../loaders/mysql");
const requestIP = require('request-ip')
const upload = require("../loaders/multer");


router.post("/checkEmail", async (req, res) => {

  var param = {
    email : req.body.email
  }

  var email = await mysql.query("web", "selectEmail", param);

  if (email.length > 0) {
    return res.json({
      resultCode : 404,
      resultMsg : "Error",
      data :  "이메일이 이미 등록되어 있습니다"
    })
  }

  return res.json({
    resultCode : 200,
    resultMsg : 'OK',
  })

})

router.post('/signIn', async (req,res) => {

  var param = {
    email : req.body.email
  }

  var email = await mysql.query("web", "selectEmail", param);

  if (email.length < 1) {
    return res.json({
      resultCode : 404,
      resultMsg : "Error",
      data :  "계정이 존재하지 않습니다"
    })
  }

  return res.json({
    resultCode : 200,
    resultMsg : 'OK',
    data : '로그인 성공'
  })

})

router.post("/signUp", upload.single("image"),  async (req,res) => {

  var param = {
      email : req.body.email
    , name : req.body.name
    , city : req.body.city
    , gu : req.body.gu
    , dong : req.body.dong
    , birth : req.body.birth
    , phoneNumber : req.body.phoneNumber
    , nickName : req.body.nickName
    , platformName : req.body.platformName
    , socialAccessToken : req.body.socialAccessToken
    , image : typeof req.file == "undefined" ? null : req.file.path,
  }

  const rs = await mysql.query("web", "insertUser", param).catch((err) => {
    console.log(err)
    return { flag: -1, msg: err.sqlMessage };
    }).then((data) => data);


  if (typeof rs == "object" && rs.flag < 0) {

    return res.json({
      resultCode: 500,
      resultMsg: 'SERVER ERROR',
    });

  } else {

    return res.json({
      resultCode: 200,
      resultMsg: "회원가입 완료",
    });

  }

})
module.exports = router;
