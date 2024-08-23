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
                prj_sec_id : param.prj_id + 'S' + secUser[i],
                prj_id : param.prj_id,
                version_number : param.version_number,
                sec_id : secUser[i]
            };
            await mysql.proc('prj', 'insertPrjSecManager', data);
        }

        // project_develop_manager 테이블 insert
        for (var i = 0; i < devUser.length; i++) {

            const data = {
                prj_dev_id : param.prj_id + 'D' + devUser[i],
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
router.post('/addPrjVer', async(req, res) => {

    var param = {
        prj_id : req.body.prj_id,
        version_number : req.body.version_number
    }

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
})

/* ========== ============= ========== */
/* ========== 프로젝트 리스트 GET ========== */
/* ========== ============= ========== */
router.get('/prjList', async(req, res) => {

    var param = {
        prj_sec_user : req.query.prj_sec_user,
        prj_dev_user : req.query.prj_dev_user
    };

    const prjList = await mysql.query('prj', 'selectPrjList', param);

    const devUser = await mysql.query('prj', 'selectUserList', param);
    const secUser = await mysql.query('prj', 'selectUserList', param);

    const projectSteps = results1.map(step => ({
        ...step,
        user_names: []
    }));

    // 개발자 정보를 프로젝트 단계에 추가
    results2.forEach(dev => {
        const projectStep = projectSteps.find(step => step.prj_id === dev.prj_id);
        if (projectStep) {
            projectStep.user_names.push(dev.user_name);
        }
    });

    // 결과 출력
    console.log(projectSteps);

    // 결과를 가공하여 원하는 형식으로 반환
    // const formattedProjects = prjList.reduce((acc, project) => {
    //     const existingProject = acc.find(p => p.prjId === project.prjId);
        
    //     console.log(existingProject);
    //     if (existingProject) {
    //         // 이미 존재하는 프로젝트에 보안 담당자와 개발 담당자 추가
    //         if (!existingProject.prjSecUserName.includes(project.prjSecUserName)) {
    //             existingProject.prjSecUserName += `, ${project.prjSecUserName}`;
    //         }
    //         if (!existingProject.prjDevUserName.includes(project.prjDevUserName)) {
    //             existingProject.prjDevUserName += `, ${project.prjDevUserName}`;
    //         }
    //     } else {
    //         // 새로운 프로젝트 추가
    //         acc.push({
    //             prjId: project.prjId,
    //             prjName: project.prjName,
    //             prjDescription: project.prjDescription,
    //             prjSecUserName: project.prjSecUserName,
    //             prjSecUser: project.prjSecUserId,
    //             prjDevUserName: project.prjDevUserName,
    //             prjDevUser: project.prjDevUserId,
    //             prjStartVersion: project.prjStartVersion,
    //             rgstDtm: project.rgstDtm
    //         });
    //     }

    //     return acc;
    // }, []);

    return res.json({
        resultCode : 200,
        resultMsg : '프로젝트 조회 완료',
        data : formattedProjects
    })

})

/* ========== ============= ========== */
/* ========== 프로젝트 상세 조회 ========== */
/* ========== ============= ========== */
router.post('/detail', async(req, res) => {
    
    var param = {
        prj_id : req.body.prj_id,
        version_number : req.body.version_number
    }

    const value = await mysql.query('prj', 'selectPrjDetail', param);

    console.log(value);


})

/* ========== ============= ========== */
/* ========== 프로젝트 커멘트 POST ========== */
/* ========== ============= ========== */
router.post('/addComm', upload.array('files'), async(req, res) => {
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