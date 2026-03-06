const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "trolley.proxy.rlwy.net",
  user: "root",
  password: "qnmDgbVagPmCyJcHmrtudVTOCzbbUxGV",
  database: "railway",
  port: 20944
});

module.exports = pool;
