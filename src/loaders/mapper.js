const mapper = require("mybatis-mapper");

mapper.createMapper([
  "./src/mapper/user.xml",
  "./src/mapper/common.xml",
  "./src/mapper/prj.xml"
]);

module.exports = mapper;
