const express = require("express");
const router = express.Router();
const mysql = require("../loaders/mysql");
const crypto = require("crypto");
const calc = require('../module/calc')


/* ========== ============= ========== */
/* ========== 유저 리스트 GET ========== */
/* ========== ============= ========== */
router.get('/', async (req, res) => {

    var param = {
        page_no : req.query.page_no
    }

    // 전체 데이터 개수
    const count = await mysql.select("user", "selctCountUserInfoList");

    // === 페이징 처리 내부 함수 === //
    const itemPerPage = 10;
    const currentPage = (param.page_no - 1) * itemPerPage;
    // 페이지당 처리 개수 10개로 고정
    param.itemPerPage = 10;
    // 페이지번호
    param.currentPage = currentPage;

    const userList = await mysql.query("user", "selectUserInfoList", param);

    const totalPageCount = Math.ceil(count.totalCount / itemPerPage);
    return res.json({
        resultCode : 200,
        resultCode : '유저 리스트 출력 완료',
        totalPageCount : totalPageCount,
        data : userList
    })

})

/* ========== ============= ========== */
/* ========== 유저 로그인 POST ========== */
/* ========== ============= ========== */
router.post('/signIn', async (req, res) => {

    var param = {
        login_id : req.body.login_id,
        login_pw : req.body.login_pw
    };

    const user = await mysql.query("user", "selectUserInfo", param);

    /* 아이디 존재 체크 */
    if (user.length < 1) {
        return res.json({
            resultCode : 401,
            resultMsg : '아이디가 존재하지 않습니다'
        })
    };

    /* 첫번째 로그인 체크 */
    if (user[0].isfirst == 1) {
        return res.json({
            resultCode : 200,
            resultMsg : '첫 로그인입니다. 비밀번호를 변경해주세요'
        })
    }

    /* 비밀번호 체크 */
    const userDBPassword = user[0].loginPw;
    const decryptPassword = await calc.decryptPassword(userDBPassword);

    if (param.login_pw != decryptPassword) {
        return res.json({
            resultCode : 401,
            resultMsg : '비밀번호가 일치하지 않습니다',
        })
    };

    return res.json({
        resultCode : 200,
        resultMsg : '로그인 성공',
        data : user[0]
    });
})

/* ========== ============= ========== */
/* ========== 유저 회원가입 POST ========== */
/* ========== ============= ========== */
router.post('/signUp', async (req, res) => {
    
    var param = {
        login_id  : req.body.login_id,
        user_name : req.body.user_name,
        user_level : req.body.user_level,
        isfirst : 1,
        user_status : 'W'
    };

    /* 회원가입 이메일 중복확인 */
    var user = await mysql.query("user", "selectUserInfo", param);

    if (user.length > 0) {
        return res.json({
            resultCode : 401,
            resultMsg : '아이디가 존재합니다.'
        })
    };

    if (param.user_level == 1) {
        return res.json({
            resultCode : 401,
            resultMsg : '시스템 관리자는 추가할 수 없습니다.'
        })
    }

    /* 이메일 전송  */
    await calc.emailSend(param.login_id).then((response) => {

        if (response.resultCode == 200) {
            param.login_pw = response.data
            /* 파라미터 유저 아이디 추가 */
            param.user_id = mysql.value('user', 'nextvalAppUserId', {id : 'user_id'});
        } else {
            return res.json({
                resultCode : response.resultCode,
                resultMsg : response.resultMsg
            })
        }

    })

    /* 회원가입 insert */
    await mysql.proc("user", "insertUserInfo", param);
    
    return res.json({
        resultCode : 200,
        resultMsg : '회원가입 성공'
    })

})

/* ========== ============= ========== */
/* ========== 유저 비밀번호 변경 POST ========== */
/* ========== ============= ========== */
router.put('/modify', async(req,res) => {

    var param = {
        login_id : req.body.login_id,
        isfirst : 0,
        current_password : req.body.current_password,
        new_password : req.body.new_password,
    }

    const user = await mysql.query("user", "selectUserInfo", param);

    /* 아이디 존재 체크 */
    if (user.length < 1) {
        return res.json({
            resultCode : 401,
            resultMsg : '아이디가 존재하지 않습니다'
        })
    };

    /* 비밀번호 체크 */
    const userDBPassword = user[0].loginPw;
    if (param.current_password != userDBPassword) {
        return res.json({
            resultCode : 401,
            resultMsg : '비밀번호가 일치하지 않습니다',
        })
    };

    const encryptNewPassword = await calc.encryptPassword(param.new_password);
    param.new_password = encryptNewPassword;

    await mysql.proc("user", "updateModify", param)

    return res.json({
        resultCode : 200,
        resultMsg : '비밀번호 변경 성공'

    })
})

module.exports = router;