const express = require("express");
const router = express.Router();
const mysql = require("../loaders/mysql");
const upload = require("../loaders/multer");
const db = require('../config/db');

/* ========== ============= ========== */
/* ========== 프로젝트 생성 POST ========== */
/* ========== ============= ========== */
router.post('/ctPrj', upload.array('files'), async (req, res) => {

    var param = {
        prj_name : req.body.prj_name,
        prj_description : req.body.prj_description,
        prj_start_version : req.body.prj_start_version,
        rgst_user_id : req.body.rgst_user_id,
        prj_sec_user : req.body.prj_sec_user,
        prj_dev_user : req.body.prj_dev_user,
        prj_lnk : req.body.prj_lnk,
        step_file : typeof req.files == "undefined" ? null : req.files
    };

    const secUser = param.prj_sec_user.split(',');
    const devUser = param.prj_dev_user.split(',');

    param.prj_id = await mysql.value('prj', 'nextvalId', {id : 'prj_id'});
    param.version_id = await mysql.value('prj', 'nextvalId', {id : 'version_id'});
    param.step_id = await mysql.value('prj', 'nextvalId', {id : 'step_id'});
    param.prc_id = await mysql.value('prj', 'nextvalId', {id : 'prc_id'});
    param.version_number = param.prj_start_version;
    param.step_number = 0;
    param.step_status = 'W';
    param.step_lnk = param.prj_lnk;
    param.step_description = param.prj_description;

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
            const prc_file_id = await mysql.value('prj', 'nextvalId', {id : 'prc_file_id'});
            const data = {
                prc_file_id : prc_file_id,
                file_id : file_id,
                prj_id : param.prj_id,
                step_number : param.step_number,
                version_number : param.version_number,
                file_path : param.step_file[i].path,
            };

            await mysql.proc('prj', 'insertPrjFile', data);
            await mysql.proc('prj', 'insertPrcStepInfoFile', data);
        }

        // project 테이블에 insert
        await mysql.proc('prj', 'insertPrj', param);

        // project_version 테이블에 insert
        await mysql.proc('prj', 'insertPrjVersion', param);

        // project_step 테이블에 insert
        await mysql.proc('prj', 'insertPrjStepCreate', param);

        // process_step_info 테이블에 insert
        await mysql.proc('prj', 'insertPrcStepInfo', param);

        return res.json({
            resultCode : 200,
            resultMsg : "프로젝트 생성 완료"
        });
    } catch(error) {
        console.log(error)
        return res.json({
            resultCode : 500,
            resultMsg : 'SERVER ERROR'
        })
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
        rgst_user_id : req.body.rgst_user_id,
        prj_sec_user : req.body.prj_sec_user,
        prj_dev_user : req.body.prj_dev_user,
        prj_lnk :  req.body.prj_lnk,
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
    param.prc_id = await mysql.value('prj', 'nextvalId', {id : 'prc_id'});
    param.step_number = 0;
    param.step_status = 'W';
    param.step_lnk = param.prj_lnk;
    param.step_description = param.prj_description;

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
            const prc_file_id = await mysql.value('prj', 'nextvalId', {id : 'prc_file_id'});
            const data = {
                // prc_file_id : prc_file_id,
                file_id : file_id,
                prj_id : param.prj_id,
                step_number : param.step_number,
                version_number : param.version_number,
                file_path : param.step_file[i].path,
            };

            await mysql.proc('prj', 'insertPrjFile', data);
            await mysql.proc('prj', 'insertPrcStepInfoFile', data);
        }

        // project_version 테이블에 insert
        await mysql.proc('prj', 'insertPrjVersion', param);

        // project_step 테이블에 insert
        await mysql.proc('prj', 'insertPrjStepCreate', param);

        // process_step_info 테이블에 insert
        await mysql.proc('prj', 'insertPrcStepInfo', param);

        return res.json({
            resultCode : 200,
            resultMsg : "프로젝트 버전 생성 완료"
        });
    } catch(error) {
        console.log(error)
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
                prj_lnk : prj.prj_lnk,
                version_number: prj.version_number,
                rgst_user_id : prj.rgst_user_id,
                rgst_user_name : prj.user_name,
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
            prj_lnk : prj.prj_lnk,
            version_number: prj.version_number,
            rgst_user_id : prj.rgst_user_id,
            rgst_user_name : prj.user_name,
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

    let pageCount;
    const myProjectListAllCount = await mysql.query('prj', 'selectPrjListCount', param);
    pageCount = myProjectListAllCount.length;
    
    const totalPage = Math.ceil(pageCount / itmesPerPage);

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

    // 특정 문자열
    const specificString = process.env.SERVER_URL;
    const modifiedPaths = myProjectListFile.map(item => {

        if(db.host == process.env.DEV_DB_HOST) {
            // '/file' 이전의 부분을 제거
            const newPath = item.file_path.split('/develop')[1];
            // 특정 문자열과 합치기
            return { file_id : item.file_id, file_path: specificString + newPath };
        } else {
            return {
                file_id : item.file_id,
                file_path : item.file_path
            }
        }
        
    });
    
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
            prj_lnk : prj.prj_lnk,
            version_number: prj.version_number,
            rgst_user_id : prj.rgst_user_id,
            rgst_user_name : prj.user_name,
            step_number: prj.step_number,
            step_status: prj.step_status,
            rgst_dtm : prj.rgst_dtm,
            updt_dtm : prj.updt_dtm,
            dev_ids: devUser ? devUser.dev_ids : null, // 개발자 ID
            dev_user_name : devUser ? devUser.user_name : null,
            sec_ids: secUser ? secUser.sec_ids : null,  // 보안 사용자 ID
            sec_user_name : secUser ? secUser.user_name : null,
            files : modifiedPaths
        };
    });
    
    return res.json({
        resultCode : 200,
        resultMsg : '프로젝트 특정 버전 조회 성공',
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
            rgst_user_id : prj.rgst_user_id,
            rgst_user_name : prj.user_name,
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
        resultMsg : '특정 프로젝트 히스토리 조회 완료',
        totalPage : totalPage,
        data : combinedProjectList
    })

})

/* ========== ============= ========== */
/* ========== 프로젝트 특정 버전 수정 PUT ========== */
/* ========== ============= ========== */
router.put('/updtPrj', upload.array('files'), async(req, res) => {

    var param = {
        prj_id : req.body.prj_id,
        version_number : req.body.version_number,
        updt_user_id : req.body.updt_user_id,
        prj_name : req.body.prj_name,
        prj_description : req.body.prj_description,
        prj_lnk : req.body.prj_lnk,
        prj_sec_user : req.body.prj_sec_user,
        prj_dev_user : req.body.prj_dev_user,
        del_sec_user : req.body.del_sec_user,
        del_dev_user : req.body.del_dev_user,
        del_file_id : req.body.del_file_id,
        step_file : typeof req.files == "undefined" ? null : req.files
    }

    try {
        // 버전 변경 불가
        const projectList = await mysql.query('prj','selectPrjVersion', param);
        if (projectList.length < 1) {
            return res.json({
                resultCode : 400,
                resultMsg : '프로젝트 또는 버전이 존재하지 않습니다'
            })
        }
        
        await mysql.proc('prj', 'updatePrjVersion', param);

        if (param.prj_sec_user != undefined) {
            const secUser = param.prj_sec_user.split(',');
        
            // 기존 보안 담당자 조회
            // const secUserList = await mysql.query('prj', 'selectPrjSecManager', param);
            // const existingSecIds = secUserList.map(user => user.sec_id);
            // // 중복되지 않는 값만 뽑아내기
            // const uniqueSecUsers = secUser.filter(x => !existingSecIds.includes(Number(x)));
        
            // for (const currentSecId of uniqueSecUsers) {
            //     // secUser가 현재 목록에 포함되어 있지 않을 때만 insert 수행
            //     const data = {
            //         prj_sec_id: await mysql.value('prj', 'nextvalId', { id: 'prj_sec_id' }),
            //         prj_id: param.prj_id,
            //         version_number: param.version_number,
            //         sec_id: currentSecId
            //     };
            //     // INSERT 쿼리 실행
            //     await mysql.proc('prj', 'insertPrjSecManager', data);
            // }

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
            
        }

        if (param.prj_dev_user != undefined) {
            const devUser = param.prj_dev_user.split(',');

            // // 기존 개발 담당자 조회
            // const devUserList = await mysql.query('prj', 'selectPrjDevManager', param);
            // const existingSecIds = devUserList.map(user => user.dev_id);
            // // 중복되지 않는 값만 뽑아내기
            // const uniqueSecUsers = devUser.filter(x => !existingSecIds.includes(Number(x)));
            // // project_develop_manager 테이블 insert
            // for (const currentDevId of uniqueSecUsers) {
            //     // secUser가 현재 목록에 포함되어 있지 않을 때만 insert 수행
            //     const data = {
            //         prj_dev_id: await mysql.value('prj', 'nextvalId', { id: 'prj_dev_id' }),
            //         prj_id: param.prj_id,
            //         version_number: param.version_number,
            //         dev_id: currentDevId
            //     };
            //     // INSERT 쿼리 실행
            //     await mysql.proc('prj', 'insertPrjDevManager', data);
            // }

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
        }

        if (param.step_file.length > 0) {
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
        }

        if (param.del_sec_user != undefined) {
            const delSecUser = param.del_sec_user.split(',');
            for (var i = 0; i < delSecUser.length; i ++) {
                const data = {
                    prj_id : param.prj_id,
                    version_number : param.version_number,
                    del_sec_user : delSecUser[i]
                };
                await mysql.proc('prj', 'deletePrjSecManager', data);
            }
        }

        if (param.del_dev_user != undefined) {
            const delDecUser = param.del_dev_user.split(',');
            for (var i = 0; i < delDecUser.length; i ++) {
                const data = {
                    prj_id : param.prj_id,
                    version_number : param.version_number,
                    del_dev_user : delDecUser[i]
                };
                await mysql.proc('prj', 'deletePrjDevManager', data);
            }
        }

        if (param.del_file_id != undefined) {
            const delFileId = param.del_file_id.split(',');
            for (var i = 0; i < delFileId.length; i++) {
                const data = {
                    del_file_id : delFileId[i]
                };
                await mysql.proc('prj', 'deletePrjFile', data);
            }   
        }

        return res.json({
            resultCode : 200,
            resultMsg : '프로젝트 수정 완료'
        })

    } catch (error) {
        console.log(error)
        return res.json({
            resultCode : 500,
            resultMsg : error
        })
    }

})

router.get('/prcInfo', async(req,res) => {

    var param = {
        prj_id : req.query.prj_id,
        version_number : req.query.version_number,
        step_number : req.query.step_number
    }

    const prcInfoList = await mysql.query('prj' ,'selectPrcStepInfo', param)
    const prcInfoFileList = await mysql.query('prj', 'selectPrcStepInfoFile', param)
    const fileList = [];
    for (const i in prcInfoFileList) {
        fileList.push(prcInfoFileList[i].file_path)
    }
    prcInfoList[0].file = fileList
    
    return res.json({
        resultCode : 200,
        resultMsg : "메롱",
        data : prcInfoList
    })
})

router.post('/addLstc', upload.single('file'), async(req, res) => {

    var param = {
        prj_id : req.body.prj_id,
        version_number : req.body.version_number,
        step_number : 0,
        lstc_file_path : req.file.path
    }

    try {
        const prcInfoList = await mysql.query('prj' ,'selectPrcStepInfo', param)
        if (prcInfoList.length < 1) {
            return res.json({
                resultCode : 400,
                resultMsg : '프로젝트 버전 또는 버전이 없습니다.'
            })
        }
        await mysql.proc('prj','updateListCheckFile', param);
        return res.json({
            resultCode : 200,
            resultMsg : '리스트 체크파일 등록 완료'
        })
    } catch(error) {
        console.log(error)
        return res.json({
            resultCode : 500,
            resultMsg : 'SERVER ERROR'
        })
    }
   

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