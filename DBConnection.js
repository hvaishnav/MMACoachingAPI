const { Client } = require("pg");

const client = new Client({
  user: "qpoqwmysnxsknk",
  host: "ec2-52-45-179-101.compute-1.amazonaws.com",
  database: "d25igl0l40inqj",
  password: "42201e4f245a611e6b68e8d22c1bc742df5e2f00251bf1a975591a84cab5d654",
  port: 5432,
});

client.connect();

client.on("connect", () => {
  console.log("DB Connected !!");
});

client.query(query, (err, res) => {
  if (err) {
    console.error(err);
    return;
  }
  for (let row of res.rows) {
    console.log(row);
  }

  client.on("end", () => {
    console.log("DB Disconnected !!");
  });
});
