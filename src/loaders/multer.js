const multer = require("multer");
const path = require('path');
const fs = require('fs');

// 파일 업로드 위치 지정
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const prjId = req.body.prj_id; // prj_id를 요청 본문에서 읽기
    const versionNumber = req.body.version_number;
    const stepNumber = req.body.step_number

    // 기본 경로 설정
    let uploadPath;

    if (!prjId) {
      uploadPath = path.join(__dirname, '..', '..', 'file', 'default');
    } else {
      if(!versionNumber) {
        uploadPath = path.join(__dirname, '..', '..', 'file', prjId);
      } else {
        if(!stepNumber) {
          uploadPath = path.join(__dirname, '..', '..', 'file', prjId, versionNumber);
        } else {
          uploadPath = path.join(__dirname, '..', '..', 'file', prjId, versionNumber, stepNumber);
        }
      }
    }

    // 디렉토리가 없으면 생성
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 일단 임시로 중복저장 허용하기 위해 Date.now 사용
    cb(null, getDate() + '_' + file.originalname);
  },
});

/* 이미지 링크 DB 저장 시 DATE 값을 앞에 추가 후 저장 하고 있음 */
/* DATE값 추출 function */
function getDate() {

  var today = new Date();

  var year = today.getFullYear();
  var month = ('0' + (today.getMonth() + 1)).slice(-2);
  var day = ('0' + today.getDate()).slice(-2);

  var dateString = year + month + day;

  var hours = ('0' + today.getHours()).slice(-2); 
  var minutes = ('0' + today.getMinutes()).slice(-2);
  var seconds = ('0' + today.getSeconds()).slice(-2); 

  var timeString = hours + '.' + minutes  + '.' + seconds;

  var fullString = dateString +  '.' + timeString

  return  fullString
}

const upload = multer({ storage: storage });

module.exports = upload;
