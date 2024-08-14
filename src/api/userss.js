const express = require("express");
const router = express.Router();
const mysql = require("../loaders/mysql");
const cryptojs = require("crypto-js");
const request = require('request')

const encryptedKey = "YJH0217";

router.get("/", async (req, res, next) => {

  var userInfo = await mysql.query("user", "selectUser");

  return res.json({
    resultCode: 200,
    resultMsg: "성공",
    data: userInfo,
  });
});


router.put("/", async (req, res) => {
  var param = {
    user_id: req.body.user_id,
  };
  const rs = await mysql
    .query("user", "deleteUserInfo", param)
    .catch((err) => {
      return { flag: -1, msg: err.sqlMessage };
    })
    .then((data) => data);

  if (typeof rs == "object" && rs.flag < 0) {
    return res.json({
      resultCode: 400,
      resultMsg: "error",
    });
  } else {
    return res.json({
      resultCode: 200,
      resultMsg: "삭제 성공",
    });
  }
});

/* 비밀번호 암호화 */
function encryptPassword(password, encryptedKey) {
  var cipherText = cryptojs.AES.encrypt(password, encryptedKey).toString();
  return cipherText;
}

/* 비밀번호 복호화 */
function decryptPassword(password, encryptedKey) {
  var bytes = cryptojs.AES.decrypt(password, encryptedKey);
  var originalText = bytes.toString(cryptojs.enc.Utf8);

  return originalText;
}

/* 인증번호 전송 API */
router.post("/phAuth", async (req, res) => {

  const param = {
    phNum : req.body.phNum
  }

  var selectData = await mysql.query("user", "selectUserInfo", param);

  if (selectData.length > 0) {
    return res.json({
      resultCode : 500,
      resultMsg : "아이디가 존재합니다. 로그인 화면으로 이동합니다"
    })
  }

  var selectAuthInfo = await mysql.query("user", "selectAuthInfo", param);
  if (selectAuthInfo.length == 0) {
    // 최초 인증번호 전송
    smsAuth(param.phNum, "F")
  } else {
    // 최초가 아닐때 인증번호 전송
    smsAuth(param.phNum, "N")
  }

  return res.json({
    resultCode : 200,
    resultMsg : "인증번호 전송"
  })

})

function smsAuth(phNum, type) {
  
  const date = Date.now().toString();
  const serviceId = "ncp:sms:kr:312540319147:shwipe_sms"
  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`;
  const secretKey = "HMF5T6yaXA7N5oI2PEyOGiXTe2s3PnvIJVp13RhV"
  const accessKey = "QDFfJphClsFTdJ4726NY"
  const method = "POST"
  const space = " "
  const newLine = "\n"
  const url2 = `/sms/v2/services/${serviceId}/messages`
  const hmac = cryptojs.algo.HMAC.create(cryptojs.algo.SHA256, secretKey);
  hmac.update(method)
  hmac.update(space)
  hmac.update(url2)
  hmac.update(newLine)
  hmac.update(date)
  hmac.update(newLine)
  hmac.update(accessKey)
  const hash = hmac.finalize();
  const signature = hash.toString(cryptojs.enc.Base64)
  const authCode = authNumber()
  request({
    method : "POST",
    json : true,
    uri : url,
    headers : {
      "Contenc-type": "application/json; charset=utf-8",
      "x-ncp-iam-access-key": accessKey,
      "x-ncp-apigw-timestamp": date,
      "x-ncp-apigw-signature-v2": signature,
    },
    body : {
      "type" : "SMS",
      "content-Type" : "COMM",
      "countryCode" : "82",
      "from" : "01094572533", // 인증번호 발송자 번호 입력
      "subject" : "안녕하세요 Shwipe입니다. 인증번호 를 입력해 주세요",
      "content" : authCode,
      "messages":[
          {
              "to": `${phNum}`,
          }
      ],
    },
  }, (error, response, body) => {

    if(error) {
      return
    }
      if (body.statusCode == 202) {

        if (type == "F") {
          var param = {
            phNum : phNum.toString(),
            authCode : authCode.toString()
          }

          const rs = mysql.query("user", "insertAuthInfo", param).catch((err) => {
            return { flag: -1, msg: err.sqlMessage };
          }).then((data) => data);

        
          if (typeof rs == "object" && rs.flag < 0) {
            return res.json({
              resultCode: 400,
              resultMsg: "error",
            });
          }
          
        }

        if (type == "N") {
          var param = {
            phNum : phNum.toString(),
            authCode : authCode.toString()
          }

          const rs = mysql.query("user", "updateAuthInfo", param).catch((err) => {
            return { flag: -1, msg: err.sqlMessage };
          }).then((data) => data);

        
          if (typeof rs == "object" && rs.flag < 0) {
            return res.json({
              resultCode: 400,
              resultMsg: "error",
            });
          }
          
        }

        if (type == "L") {

          var param = {
            phNum : phNum.toString(),
            authCode : authCode.toString()
          }

          const rs = mysql.query("user", "updateAuthInfo", param).catch((err) => {
            return { flag: -1, msg: err.sqlMessage };
          }).then((data) => data);

          if (typeof rs == "object" && rs.flag < 0) {
            return res.json({
              resultCode: 400,
              resultMsg: "error",
            });
          } else {

            const rs = mysql.query("user", "updateLoginDtm", param).catch((err) => {
              return { flag: -1, msg: err.sqlMessage };
            }).then((data) => data);

          }
        }

      }

  })
}

/* 인증번호 확인 API */
router.post("/authCode", async(req,res) => {

  var param = {
    phNum : req.body.phNum,
    authCode : req.body.authCode
  }

  var selectData = await mysql.query("user", "selectAuthInfo", param);

  var dbAuthCode = selectData[0].auth_code

  if (param.authCode != dbAuthCode) {
    return res.json({
      resultCode : 500,
      resultMsg : "인증 코드가 다릅니다."
    })
  }

  const userInfo = await mysql.query("user", "selectUserInfo", param);
            
  if (typeof userInfo[0] != "undefined") {
    return res.json({
        resultCode : 200,
        resultMsg : "Login Success",
        data : userInfo
      })
  }

  return res.json({
    resultCode : 200,
    resultMsg : "휴대폰 인증에 성공하였습니다."
  })

})

/* 로그인 API */
router.post("/login", async (req, res) => {

  const param = {
    phNum : req.body.phNum
  }

  if (param.phNum == "" || param.phNum == undefined) {
    return res.json({
      resultMsg : "핸드폰 번호를 올바르게 입력해 주세요"
    })
  }

  var selectData = await mysql.query("user", "selectAuthInfo", param);

  if (selectData.length == 0) {
    return res.json({
      resultCode : 500,
      resultMsg : "아이디가 존재하지 않습니다. 회원가입을 진행해 주세요."
    })
  }

  smsAuth(param.phNum, "L")

  return res.json({
    resultCode : 200,
    resultMsg : "인증번호 전송"
  })

  
})

/* 회원가입 API */
router.post("/signUp", async (req, res) => {

  const param = {
    phNum : req.body.phNum,
    userEmail: req.body.userEmail,
    userNotice : req.body.userNotice,
    userName: req.body.userName,
    userBirthDay: req.body.userBirthDay,
    userGender: req.body.userGender,
    userTerms: req.body.userTerms,
  };


  const rs = mysql.query("user", "insertShwipeUser", param).catch((err) => {
    return { flag: -1, msg: err.sqlMessage };
  }).then((data) => data);

  if (typeof rs == "object" && rs.flag < 0) {
    return res.json({
      resultCode: 400,
      resultMsg: "error",
    });
  }

  return res.json({
    resultCode : 200,
    resultMsg : "회원가입에 성공하였습니다."
  })

});

/* 로그인 시간 확인 #현재는 하루 */
router.post("/session", async(req,res) => {

  const param = {
    phNum : req.body.phNum
  }

  var selectData = await mysql.query("user", "selectSessionCheck", param);

  if (selectData.length > 0) {
    return res.json({
      resultCode : 400,
      resultMsg : '로그인 유지 시간이 끝났습니다',
    })
  }

  return res.json({
    resultCode : 200,
    resultMsg : '정상'
  })

})

/* 인증번호 랜덤 생성 */
function authNumber() {
  var data = Math.floor((Math.random() * (10000 - 1) + 1) + 50000);
  const randomNum = Array(10).fill().map((item, index) => index + 1);
  return data
}


module.exports = router;
