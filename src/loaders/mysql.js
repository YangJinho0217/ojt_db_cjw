const mapper = require("./mapper");
const dbconfig = require("../config/db");
const mysql = require("mysql2/promise");
const pool = mysql.createPool(dbconfig);

const query = {
  query : async (nameSpace, selectId, param) => {
    const con = await pool.getConnection(async conn => conn)
    const sql = mapper.getStatement(nameSpace, selectId, param, {language: 'sql', indent: '  '})
    console.log('----------------------------------------')
    console.log(sql)
    console.log('----------------------------------------')
    const [rows, fields] = await con.query(sql).catch(async (err) => {
        con.connection.release()
        throw err
    })

    con.connection.release()
    return rows
  },
  select : async (nameSpace, selectId, param) => {
      const con = await pool.getConnection(async conn => conn)
      const sql = mapper.getStatement(nameSpace, selectId, param, {language: 'sql', indent: '  '})
      console.log('----------------------------------------')
      console.log(sql)
      console.log('----------------------------------------')
      const [rows, fields] = await con.query(sql).catch(async (err) => {
          con.connection.release()
          throw err
      })

      con.connection.release()
      return typeof rows[0] == 'undefined' ? {} : rows[0]
  },
  proc : async (nameSpace, selectId, param) => {
      const con = await pool.getConnection(async conn => conn)
      const sql = mapper.getStatement(nameSpace, selectId, param, {language: 'sql', indent: '  '})
      console.log('----------------------------------------')
      console.log(sql)
      console.log('----------------------------------------')
      var result = await con.query(sql).catch(async (err) => {
          con.connection.release()
          throw err
      })

      con.connection.release()
      return result[0].affectedRows
  },
  value : async (nameSpace, selectId, param) => {
      const con = await pool.getConnection(async conn => conn)
      const sql = mapper.getStatement(nameSpace, selectId, param, {language: 'sql', indent: '  '})
      console.log('----------------------------------------')
      console.log(sql)
      console.log('----------------------------------------')
      const [rows, fields] = await con.query(sql).catch(async (err) => {
          con.connection.release()
          throw err
      })

      con.connection.release()
      return rows[0][fields[0].name]
  },

};

module.exports = query;
