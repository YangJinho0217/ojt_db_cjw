const express = require("express");
const router = express.Router();

/* router path */
const web = require("../api/web");
const userss = require("../api/userss");
const board = require("../api/board");
const user = require("../api/user");

router.use("/web", web);
router.use("/user", user);
router.use("/userss", userss);
router.use("/board", board);

module.exports = router;
