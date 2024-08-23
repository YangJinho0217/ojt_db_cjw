const express = require("express");
const router = express.Router();

/* router path */
const user = require("../api/user");
const prj = require("../api/prj");

router.use("/das/user", user);
router.use("/das/prj", prj);

module.exports = router;
