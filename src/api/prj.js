const express = require("express");
const router = express.Router();
const mysql = require("../loaders/mysql");
const upload = require("../loaders/multer");

/* ========== ============= ========== */
/* ========== 프로젝트 생성 POST ========== */
/* ========== ============= ========== */
router.post('/ctPrj', upload.array('files'), async (req, res) => {

    var param = {
        prj_name : req.body.prj_name,
        prj_description : req.body.prj_description,
        prj_start_version : req.body.prj_start_version,
        prj_sec_user : req.body.prj_sec_user,
        prj_dev_user : req.body.prj_dev_user,
        step_url : typeof req.body.step_url == "undefined" ? null : req.body.step_url,
        step_file : typeof req.files == "undefined" ? null : req.files
    };

    const secUser = param.prj_sec_user.split(',');
    const devUser = param.prj_dev_user.split(',');

    param.prj_id = await mysql.value('prj', 'nextvalId', {id : 'prj_id'});
    param.version_id = await mysql.value('prj', 'nextvalId', {id : 'version_id'});
    param.step_id = await mysql.value('prj', 'nextvalId', {id : 'step_id'});
    param.version_number = param.prj_start_version;
    param.step_number = 1;
    param.step_status = 'W';

    try {
        // project_security_manager 테이블 insert
        for (var i = 0; i < secUser.length; i ++) {

            const data = {
                prj_sec_id : await mysql.value('prj', 'nextvalId', {id : 'prj_sec_id'}),
                prj_id : param.prj_id,
                version_number : param.version_number,
                sec_id : secUser[i]
            };
            await mysql.proc('prj', 'insertPrjSecManager', data);
        }

        // project_develop_manager 테이블 insert
        for (var i = 0; i < devUser.length; i++) {

            const data = {
                prj_dev_id : await mysql.value('prj', 'nextvalId', {id : 'prj_dev_id'}),
                prj_id : param.prj_id,
                version_number : param.version_number,
                dev_id : devUser[i]
            };

            await mysql.proc('prj', 'insertPrjDevManager', data);
        }

        for (var i = 0; i < param.step_file.length; i++) {

            const file_id = await mysql.value('prj', 'nextvalId', {id : 'file_id'});
            const data = {
                file_id : file_id,
                prj_id : param.prj_id,
                version_number : param.version_number,
                file_path : param.step_file[i].path
            };

            await mysql.proc('prj', 'insertPrjFile', data);
        }

        // project 테이블에 insert
        await mysql.proc('prj', 'insertPrj', param);

        // project_version 테이블에 insert
        await mysql.proc('prj', 'insertPrjVersion', param);

        // project_step 테이블에 insert
        await mysql.proc('prj', 'insertPrjStepCreate', param);
    } catch(error) {
        return res.json({
            resultCode : 500,
            resultMsg : 'SERVER ERROR'
        })
    } finally {
        return res.json({
            resultCode : 200,
            resultMsg : "프로젝트 생성 완료"
        });
    }
})

/* ========== ============= ========== */
/* ========== 프로젝트 버전 생성 POST ========== */
/* ========== ============= ========== */
router.post('/addPrjVer', upload.array('files'), async(req, res) => {

    var param = {
        prj_id : req.body.prj_id,
        prj_name : req.body.prj_name,
        prj_description : req.body.prj_description,
        version_number : req.body.version_number,
        prj_sec_user : req.body.prj_sec_user,
        prj_dev_user : req.body.prj_dev_user,
        step_url : typeof req.body.step_url == "undefined" ? null : req.body.step_url,
        step_file : typeof req.files == "undefined" ? null : req.files
    }

    const secUser = param.prj_sec_user.split(',');
    const devUser = param.prj_dev_user.split(',');

    const prj = await mysql.query('prj', 'selectPrj', param);
    const version = await mysql.query('prj', 'selectPrjVersion', param);

    if (prj.length < 1) {
        return res.json({
            resultCode : 400,
            resultMsg : '프로젝트가 존재하지 않습니다.'
        })
    }

    if (version.length > 0) {
        return res.json({
            resultCode : 400,
            resultMsg : '해당 버전이 존재합니다'
        })
    }

    param.version_id = await mysql.value('prj', 'nextvalId', {id : 'version_id'});
    param.step_id = await mysql.value('prj', 'nextvalId', {id : 'step_id'});
    param.step_number = 1;
    param.step_status = 'W';

    try {
        // project_security_manager 테이블 insert
        for (var i = 0; i < secUser.length; i ++) {

            const data = {
                prj_sec_id : await mysql.value('prj', 'nextvalId', {id : 'prj_sec_id'}),
                prj_id : param.prj_id,
                version_number : param.version_number,
                sec_id : secUser[i]
            };
            await mysql.proc('prj', 'insertPrjSecManager', data);
        }

        // project_develop_manager 테이블 insert
        for (var i = 0; i < devUser.length; i++) {

            const data = {
                prj_dev_id : await mysql.value('prj', 'nextvalId', {id : 'prj_dev_id'}),
                prj_id : param.prj_id,
                version_number : param.version_number,
                dev_id : devUser[i]
            };

            await mysql.proc('prj', 'insertPrjDevManager', data);
        }

        for (var i = 0; i < param.step_file.length; i++) {

            const file_id = await mysql.value('prj', 'nextvalId', {id : 'file_id'});
            const data = {
                file_id : file_id,
                prj_id : param.prj_id,
                version_number : param.version_number,
                file_path : param.step_file[i].path
            };

            await mysql.proc('prj', 'insertPrjFile', data);
        }

        // project_version 테이블에 insert
        await mysql.proc('prj', 'insertPrjVersion', param);

        // project_step 테이블에 insert
        await mysql.proc('prj', 'insertPrjStepCreate', param);
    } catch(error) {
        // return res.json({
        //     resultCode : 500,
        //     resultMsg : 'SERVER ERROR'
        // })
        console.log(error)
    } finally {
        return res.json({
            resultCode : 200,
            resultMsg : "프로젝트 버전 생성 완료"
        });
    }

})

/* ========== ============= ========== */
/* ========== 프로젝트 리스트 GET ========== */
/* ========== ============= ========== */
router.get('/prjList', async(req, res) => {

    var param = {
        page_no : req.query.page_no,
        user_id : req.query.user_id
    };

    const itmesPerPage = 10;
    const currentPage = (param.page_no - 1) * itmesPerPage;

    param.page_no = currentPage;

    const myProjectList = await mysql.query('prj', 'selectPrjAll', param);
    const myProjectListDevUser = await mysql.query('prj', 'selectPrjDevUser', param);
    const myProjectListSecUser = await mysql.query('prj', 'selectPrjSecUser', param);

    const combinedProjectList = myProjectList.map(prj => {
        const devUser = myProjectListDevUser.find(dev => dev.prj_id === prj.prj_id && dev.version_number === prj.version_number);
        const secUser = myProjectListSecUser.find(sec => sec.prj_id === prj.prj_id && sec.version_number === prj.version_number);
        
        const dev_ids = devUser ? devUser.dev_ids.split(',') : [];
        const sec_ids = secUser ? secUser.sec_ids.split(',') : [];
        
        const user_id = param.user_id; // user_id를 param에서 가져옴
    
        // user_id가 정의되지 않은 경우 전체 프로젝트 정보를 반환
        if (user_id === undefined || user_id === "undefined") {
            return {
                prj_id: prj.prj_id,
                prj_name: prj.prj_name,
                prj_description: prj.prj_description,
                version_number: prj.version_number,
                step_number: prj.step_number,
                step_status: prj.step_status,
                rgst_dtm : prj.rgst_dtm,
                updt_dtm : prj.updt_dtm,
                dev_ids: dev_ids.length > 0 ? devUser.dev_ids : undefined,
                dev_user_name: dev_ids.length > 0 ? devUser.user_name : undefined,
                sec_ids: sec_ids.length > 0 ? secUser.sec_ids : undefined,
                sec_user_name: sec_ids.length > 0 ? secUser.user_name : undefined
            };
        }
    
        // user_id가 정의된 경우
        const isUserIdMatch = (dev_ids.includes(user_id) || sec_ids.includes(user_id));
        const result = {
            prj_id: prj.prj_id,
            prj_name: prj.prj_name,
            prj_description: prj.prj_description,
            version_number: prj.version_number,
            step_number: prj.step_number,
            step_status: prj.step_status,
            rgst_dtm : prj.rgst_dtm,
            updt_dtm : prj.updt_dtm,
            dev_ids: dev_ids.length > 0 ? devUser.dev_ids : undefined,
            dev_user_name: dev_ids.length > 0 ? devUser.user_name : undefined,
            sec_ids: sec_ids.length > 0 ? secUser.sec_ids : undefined,
            sec_user_name: sec_ids.length > 0 ? secUser.user_name : undefined
        };
    
        // 조건에 맞는 경우에만 결과를 반환
        return isUserIdMatch ? result : null;
    
    }).filter(item => item !== null);

    const myProjectListTotalCount = await mysql.query('prj', 'selectPrjCount', param);
    const totalPage = Math.ceil(myProjectListTotalCount.length / itmesPerPage);

    return res.json({
        resultCode : 200,
        resultMsg : '프로젝트 조회 완료',
        totalPage : totalPage,
        data : combinedProjectList
    })

})

/* ========== ============= ========== */
/* ========== 프로젝트 상세 조회 ========== */
/* ========== ============= ========== */
router.get('/detail', async(req, res) => {
    
    var param = {
        prj_id : req.query.prj_id,
        version_number : req.query.version_number
    }

    const value = await mysql.query('prj', 'selectPrjVersionDetail', param);
    const myProjectListDevUser = await mysql.query('prj', 'selectPrjDevUser', param);
    const myProjectListSecUser = await mysql.query('prj', 'selectPrjSecUser', param);
    const myProjectListFile = await mysql.query('prj', 'selectPrjFile', param);

    // 결과를 저장할 배열
    const combinedProjectList = value.map(prj => {
        // 개발자 및 보안 사용자 정보를 찾기
        const devUser = myProjectListDevUser.find(dev => dev.prj_id === prj.prj_id && dev.version_number === prj.version_number);
        const secUser = myProjectListSecUser.find(sec => sec.prj_id === prj.prj_id && sec.version_number === prj.version_number);
        
        // // 결과 객체 생성
        return {
            prj_id: prj.prj_id,
            prj_name: prj.prj_name,
            prj_description: prj.prj_description,
            version_number: prj.version_number,
            step_number: prj.step_number,
            step_status: prj.step_status,
            rgst_dtm : prj.rgst_dtm,
            updt_dtm : prj.updt_dtm,
            dev_ids: devUser ? devUser.dev_ids : null, // 개발자 ID
            dev_user_name : devUser ? devUser.user_name : null,
            sec_ids: secUser ? secUser.sec_ids : null,  // 보안 사용자 ID
            sec_user_name : secUser ? secUser.user_name : null,
            files : myProjectListFile
        };
    });
    return res.json({
        resultCode : 200,
        resultMsg : '성공',
        data : combinedProjectList
    })
})

/* ========== ============= ========== */
/* ========== 특정 프로젝트 히스토리 GET ========== */
/* ========== ============= ========== */
router.get('/prjHst', async(req,res) => {
    
    var param = {
        page_no : req.query.page_no,
        prj_id : req.query.prj_id
    };

    const itmesPerPage = 10;
    const currentPage = (param.page_no - 1) * itmesPerPage;

    param.page_no = currentPage;

    const myProjectList = await mysql.query('prj', 'selectPrjHistory', param);
    const myProjectListDevUser = await mysql.query('prj', 'selectPrjDevUser', param);
    const myProjectListSecUser = await mysql.query('prj', 'selectPrjSecUser', param);

    // 결과를 저장할 배열
    const combinedProjectList = myProjectList.map(prj => {
        // 개발자 및 보안 사용자 정보를 찾기
        const devUser = myProjectListDevUser.find(dev => dev.prj_id === prj.prj_id && dev.version_number === prj.version_number);
        const secUser = myProjectListSecUser.find(sec => sec.prj_id === prj.prj_id && sec.version_number === prj.version_number);
        
        // // 결과 객체 생성
        return {
            prj_id: prj.prj_id,
            prj_name: prj.prj_name,
            prj_description: prj.prj_description,
            version_number: prj.version_number,
            step_number: prj.step_number,
            step_status: prj.step_status,
            rgst_dtm : prj.rgst_dtm,
            updt_dtm : prj.updt_dtm,
            dev_ids: devUser ? devUser.dev_ids : null, // 개발자 ID
            dev_user_name : devUser ? devUser.user_name : null,
            sec_ids: secUser ? secUser.sec_ids : null,  // 보안 사용자 ID
            sec_user_name : secUser ? secUser.user_name : null
        };
    });

    const myProjectListTotalCount = await mysql.query('prj', 'selectPrjHistoryCount', param);
    const totalPage = Math.ceil(myProjectListTotalCount.length / itmesPerPage);

    return res.json({
        resultCode : 200,
        resultMsg : '프로젝트 조회 완료',
        totalPage : totalPage,
        data : combinedProjectList
    })

})

/* ========== ============= ========== */
/* ========== 프로젝트 수정 PUT ========== */
/* ========== ============= ========== */
router.put('/updtPrj', upload.array('files'), async(req, res) => {

    var param = {
        prj_id : req.body.prj_id,
        version_number : req.body.version_number,
        prj_name : req.body.prj_name,
        prj_description : req.body.prj_description,
        prj_sec_user : req.body.prj_sec_user,
        prj_dev_user : req.body.prj_dev_user,
        step_url : typeof req.body.step_url == "undefined" ? null : req.body.step_url,
        step_file : typeof req.files == "undefined" ? null : req.files
    }

    // console.log(param);

})

/* ========== ============= ========== */
/* ========== 보안 담당자의 프로젝트 승인 PUT ========== */
/* ========== ============= ========== */
router.put('/aprPrj',upload.single('file'), async(req, res) => {

    var param = {
        prj_id : req.body.prj_id,
        version_number : req.body.version_number,
        step_number : req.body.step_number,
        step_status : req.body.step_status,
        // step_req_list : typeof req.body.step_req_list == "undefined" ? null : req.body.step_req_list,
        step_result_comment : typeof req.body.step_result_comment == "undefined" ? null : req.body.step_result_comment,
        step_result_file : typeof req.file == "undefined" ? null : req.file.path,
        step_result_url : typeof req.body.step_result_url == "undefined" ? null : req.body.step_result_url
    }

    // 프로젝트 STEP 리스트 출력
    const prjStepList = await mysql.query('prj', 'selectPrjStep', param);

    param.step_id = prjStepList[0].stepId

    if(prjStepList.length < 1) {
        return res.json({
            resultCode : 400,
            resultMsg : "프로젝트 또는 해당 버전이 존재하지 않습니다."
        })
    }

    await mysql.proc('prj', 'insertPrjStep', param);

    param.history_id = await mysql.value('prj', 'nextvalId', {id : 'history_id'}); 
    param.step_url = prjStepList[0].stepUrl
    param.step_file = prjStepList[0].stepFile
    param.step_comment = prjStepList[0].stepComment

    await mysql.proc('prj', 'insertPrjHistory', param)

    return res.json({
        resultCode : 200,
        resultMsg : "프로젝트 상태 변경 완료",
        // data : prjStepList
    })

    // history 인서트
    // step_url, step_file, step_comment 받아와야함 ㅇㅇ

})


module.exports = router;