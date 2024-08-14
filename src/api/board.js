const express = require("express");
const router = express.Router();
const mysql = require("../loaders/mysql");
const upload = require("../loaders/multer");

/* 이미지 타입별 리스트 뽑기  */
router.post("/prdList", async(req, res) => {

  var param = {
    prd_type : req.body.prd_type
  }

  var prdList = await mysql.query("board", "selectProductList", param);

  return res.json({
    resultCode : 200,
    resultMsg : 'OK',
    data : prdList
  })

})

/* 이미지 등록 API */
router.post("/upload", upload.single("file"), async(req,res) => {

  var param = {
    prd_name : req.body.prd_name,
    prd_type : req.body.prd_type,
    prd_title : req.body.prd_title,
    prd_sub_title : req.body.prd_sub_title,
    prd_price : req.body.prd_price,
    prd_content : req.body.prd_content,
    file: typeof req.file == "undefined" ? null : req.file.path,
  }

  const rs = await mysql.query("board", "insertProductList", param).catch((err) => {
    console.log(err)
    return { flag: -1, msg: err.sqlMessage }
    }).then((data) => data);
    

  if (typeof rs == "object" && rs.flag < 0) {

    return res.json({
      resultCode: 500,
      resultMsg: 'SERVER ERROR',
    });

  } else {

    return res.json({
      resultCode: 200,
      resultMsg: "이미지 등록 성공",
    });

  }

})

/* Like 상품 등록 */
router.post("/prdLike", upload.single('file'), async(req, res) => {

  var param = {
    ph_num : req.body.ph_num,
    prd_id : req.body.prd_id,
    prd_img : req.body.prd_img,
    prd_type : req.body.prd_type,
    prd_name : req.body.prd_name,
    prd_title : req.body.prd_title,
    prd_sub_title : req.body.prd_sub_title,
    prd_content : req.body.prd_content,
    prd_price : req.body.prd_price
  }


  var prdIdCt = await mysql.query("board", "selctprdLikeCt", param);

  if (prdIdCt[0].prdIdCt > 0) {

    const rs = await mysql.query("board", "updateLikeProductList", param).catch((err) => {
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
        resultMsg: "Like 상품 리스트 업데이트 완료",
      });
    }
    
  } else {
    const rs = await mysql.query("board", "insertLikeProductList", param).catch((err) => {
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
        resultMsg: "Like 상품 리스트 등록 완료",
      });
  
    }
  }

  

})

/* Hate 상품 등록 */
router.post("/prdHate", upload.single('file'), async(req, res) => {

  var param = {
    ph_num : req.body.ph_num,
    prd_id : req.body.prd_id,
    prd_img : req.body.prd_img,
    prd_type : req.body.prd_type,
    prd_name : req.body.prd_name,
    prd_title : req.body.prd_title,
    prd_sub_title : req.body.prd_sub_title,
    prd_content : req.body.prd_content,
    prd_price : req.body.prd_price
  }

  var prdIdCt = await mysql.query("board", "selctprdHateCt", param);

  if (prdIdCt[0].prdIdCt > 0) {
    return res.json({
      resultCode : 403,
      resultMsg : '해당 상품이 중복되었습니다'
    })
  }

  const rs = await mysql.query("board", "insertHateProductList", param).catch((err) => {
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
      resultMsg: "Hate 상품 리스트 등록 완료",
    });

  }

})

/* Buy 상품 등록 */
router.post("/prdBuy", upload.single('file'), async(req, res) => {

  var param = {
    ph_num : req.body.ph_num,
    prd_id : req.body.prd_id,
    prd_img : req.body.prd_img,
    prd_type : req.body.prd_type,
    prd_name : req.body.prd_name,
    prd_title : req.body.prd_title,
    prd_sub_title : req.body.prd_sub_title,
    prd_content : req.body.prd_content,
    prd_price : req.body.prd_price
  }

  var prdIdCt = await mysql.query("board", "selctprdBuyCt", param);

  if (prdIdCt[0].prdIdCt > 0) {

    const rs = await mysql.query("board", "updateBuyProductList", param).catch((err) => {
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
        resultMsg: "Buy 상품 리스트 업데이트 완료",
      });
    }

  } else {

    const rs = await mysql.query("board", "insertBuyProductList", param).catch((err) => {
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
        resultMsg: "Buy 상품 리스트 등록 완료",
      });
  
    }
  }

})

/* like 상품 목록 조회 */
router.post("/likeList", async(req,res) => {
  var param = {
    ph_num : req.body.ph_num
  }

  var likeList = await mysql.query("board", "selectLikePrdList", param);

  return res.json({
    resultCode : 200,
    resultMsg : "성공",
    data : likeList
  })

})

/* hate 상품 목록 조회 */
router.get("/hate", async(req, res) => {

  var param = {
    user_phone_num : req.body.user_phone_num
  }
})

/* Buy 상품 목록 조회 */
router.post("/buyList", async(req,res) => {

  var param = {
    ph_num : req.body.ph_num
  }

  var buyList = await mysql.query("board", "selectPrdBuyList", param);

  return res.json({
    resultCode : 200,
    resultMsg : "성공",
    data : buyList
  })

})

module.exports = router;
