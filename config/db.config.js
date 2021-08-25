const Pool = require("pg").Pool;
const dbConPool = new Pool({
  user: "qpoqwmysnxsknk",
  host: "ec2-52-45-179-101.compute-1.amazonaws.com",
  database: "d25igl0l40inqj",
  password: "42201e4f245a611e6b68e8d22c1bc742df5e2f00251bf1a975591a84cab5d654",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = dbConPool;
