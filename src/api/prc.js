const express = require("express");
const router = express.Router();
const mysql = require("../loaders/mysql");
const upload = require("../loaders/multer");
const db = require('../config/db');

router.get('/prcInfo', async(req,res) => {

    var param = {
        prj_id : req.query.prj_id,
        version_number : req.query.version_number,
        step_number : req.query.step_number
    }

    const prcInfoList = await mysql.select('prc' ,'selectPrcStepInfo', param);
    const prcInfoFileList = await mysql.query('prc', 'selectPrcStepInfoFile', param);
    const prcCommentList = await mysql.query('prc', 'selectPrcComment', param);

    const specificString = process.env.SERVER_URL;
    const fileList = [];
    const commentList = [];
    

    if (Object.keys(prcInfoList).length !== 0) {
        if (prcInfoList.lstc_file_path != null) {
            if(db.host == process.env.DEV_DB_HOST) {
                // '/file' 이전의 부분을 제거
                const newPath = prcInfoList.lstc_file_path.split('/develop')[1];
                // 특정 문자열과 합치기
                const data = specificString + newPath;
                prcInfoList.lstc_file_path = data
            }
        }
    }
    

    if (param.step_number == 0) {

        if (prcInfoFileList.length > 0) {

            for (const i in prcInfoFileList) {
                fileList.push(prcInfoFileList[i])
            }

            const modifiedPaths = fileList.map(item => {
                if(db.host == process.env.DEV_DB_HOST) {
                    // '/file' 이전의 부분을 제거
                    const newPath = item.file_path.split('/develop')[1];
                    // 특정 문자열과 합치기
                    return {file_path: specificString + newPath };
                } else {
                    return {
                        file_path : item.file_path
                    }
                }
            });
            prcInfoList.file = modifiedPaths
        }

    }
    
    if (prcCommentList.length > 0) {
        for (const i in prcCommentList) {
            const data = {
                comm_id : prcCommentList[i].comm_id,
                rgst_user_id : prcCommentList[i].rgst_user_id,
                user_name : prcCommentList[i].user_name,
                comment_description : prcCommentList[i].comment_description,
                user_role : prcCommentList[i].user_role,
                rgst_dtm : prcCommentList[i].rgst_dtm
            }
            
            commentList.push(data);
        }
        const prcCommentFileList = await mysql.query('prc', 'selectPrcCommentFile', param)

        // 특정 문자열
        const specificString = process.env.SERVER_URL;
        const modifiedPaths = prcCommentFileList.map(item => {
            if(db.host == process.env.DEV_DB_HOST) {
                // '/file' 이전의 부분을 제거
                const newPath = item.file_path.split('/develop')[1];
                // 특정 문자열과 합치기
                return { comm_file_id : item.comm_file_id, comm_id : item.comm_id, file_path: specificString + newPath };
            } else {
                return {
                    comm_file_id : item.comm_file_id,
                    comm_id : item.comm_id,
                    file_path : item.file_path
                }
            }
        });

        const combined = commentList.map(comment => {
            // 해당 comment의 comm_id에 맞는 파일들을 찾음
            const relatedFiles = modifiedPaths.filter(file => file.comm_id === comment.comm_id);
            // comment와 관련된 파일들을 결합
            return {
                ...comment,
                files: relatedFiles.length > 0 ? relatedFiles : [] // 파일이 없을 경우 빈 배열
            };
        });

        prcInfoList.commentList = combined;


    }

    return res.json({
        resultCode : 200,
        resultMsg : "프로세스 조회 성공",
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
        const prcInfoList = await mysql.query('prc' ,'selectPrcStepInfo', param)
        if (prcInfoList.length < 1) {
            return res.json({
                resultCode : 400,
                resultMsg : '프로젝트 또는 프로젝트 버전이 존재하지 않습니다'
            })
        }
        await mysql.proc('prc','updateListCheckFile', param);
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

router.post('/addCmt', upload.array('files'), async(req, res) => {

    var param = {
        prj_id : req.body.prj_id,
        version_number : req.body.version_number,
        rgst_user_id : req.body.rgst_user_id,
        step_number : req.body.step_number,
        comment_description : req.body.comment_description,
        file : typeof req.files == "undefined" ? null : req.files
    }

    try {
        const prjlist = await mysql.query('prj', 'selectPrjVersion', param);

        if (prjlist.length < 1) {
            return res.json({
                resultCode : 400,
                resultMsg : '프로젝트 또는 프로젝트 버전이 존재하지 않습니다'
            })
        }

        param.comm_id = await mysql.value('prc', 'nextvalId', {id : 'comm_id'});
        await mysql.proc('prc', 'insertPrcComment', param);

        for (const i in param.file) {

            const comm_file_id = await mysql.value('prc', 'nextvalId', {id : 'comm_file_id'});
            const data = {
                comm_file_id : comm_file_id,
                comm_id : param.comm_id,
                file_path : param.file[i].path,
            };

            await mysql.proc('prc', 'insertPrcCommentFile', data);
        }

        return res.json({
            resultCode : 200,
            resultMsg : '코멘트 등록 성공'
        })

    } catch(error) {
        console.log(error)
        return res.json({
            resultCode : 500,
            resultMsg : 'SERVER ERROR'
        })
    }
})

router.put('/updtCmt', upload.array('files'), async(req, res) => {

    var param = {
        comm_id : req.body.comm_id,
        comment_description : req.body.comment_description,
        del_file_id : req.body.del_file_id,
        file : typeof req.files == "undefined" ? null : req.files
    }

    try {

        // 코멘트 리스트 확인
        const commentList = await mysql.query('prc', 'selectPrcCommentList', param);

        if(commentList.length < 1) {
            return res.json({
                resultCode : 400,
                resultMsg : '코멘트가 존재하지 않습니다.'
            })
        }

        // 코멘트 내용 수정
        await mysql.proc('prc', 'updatePrcComment', param);

        // 기존 파일 삭제
        if (param.del_file_id != undefined) {
            const delFileId = param.del_file_id.split(',');
            for (var i = 0; i < delFileId.length; i++) {
                const data = {
                    del_file_id : delFileId[i]
                };
                await mysql.proc('prc', 'deletePrcCommentFiles', data);
            }   
        }

        // 파일 새로 등록
        for (const i in param.file) {

            const comm_file_id = await mysql.value('prc', 'nextvalId', {id : 'comm_file_id'});
            const data = {
                comm_file_id : comm_file_id,
                comm_id : param.comm_id,
                file_path : param.file[i].path,
            };

            await mysql.proc('prc', 'insertPrcCommentFile', data);
        }

        return res.json({
            resultCode : 200,
            resultMsg : '코멘트 수정 성공'
        })

    } catch(error) {
        console.log(error)
        return res.json({
            resultCode : 500,
            resultMsg : 'SEVER ERROR'
        })
    }
    
})

router.delete('/delCmt', async(req, res) => {
    
    var param = {
        comm_id : req.body.comm_id
    }

    const commentList = await mysql.query('prc', 'selectPrcCommentList', param);
    
    if(commentList.length < 1) {
        return res.json({
            resultCode : 400,
            resultMsg : '코멘트가 존재하지 않습니다 코멘트 번호를 다시 입력해 주세요'
        })
    }

    await mysql.proc('prc', 'deletePrcComment', param)
    await mysql.proc('prc', 'deletePrcCommentFile', param)
    
    return res.json({
        resultCode : 200,
        resultMsg : "OK"
    })

})

router.post('/lstnRgst', upload.array('files'), async(req,res) => {

    var param = {
        prj_id : req.body.prj_id,
        version_number : req.body.version_number,
        step_number : req.body.step_number,
        step_lnk : req.body.step_lnk,
        step_description : req.body.step_description,
        file : typeof req.files == "undefined" ? null : req.files
    }

    try {
        
        const prjStepList = await mysql.query('prj', 'selectPrjStepInfo', param);

        if (prjStepList.length < 1) {
            return res.json({
                resultCode : 400,
                 resultMsg : '프로젝트 아이디 또는 버전이 잘못되었습니다'
            })
        }

        await mysql.proc('prc', 'updatePrcStepInfo', param);

        // 파일 새로 등록
        for (const i in param.file) {

            const prc_file_id = await mysql.value('prc', 'nextvalId', {id : 'prc_file_id'});
            const data = {
                prc_file_id : prc_file_id,
                prj_id : param.prj_id,
                version_number : param.version_number,
                step_number : param.step_number,
                file_path : param.file[i].path,
            };

            await mysql.proc('prj', 'insertPrcStepInfoFile', data);
        }

        return res.json({
            resultCode : 200,
            resultMsg : '프로젝트 최종 정보 등록 성공'
        })

    } catch(error) {
        console.log(error)
        return res.json({
            resultCode : 500,
            resultMsg : 'SERVER ERROR'
        })
    } 

})

module.exports = router;