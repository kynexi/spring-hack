const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "teodor",
  host: "localhost",
  port: 5432,
  database: "spring",
});

module.exports = pool;
