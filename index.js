const http = require("http");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const server = http.createServer(async (req, res) => {
  const send = (code, data) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  try {
    if (req.method === "POST" && req.url === "/bananas") {
      const { rows } = await pool.query("INSERT INTO bananas DEFAULT VALUES RETURNING *");
      return send(201, rows[0]);
    }
    if (req.method === "GET" && req.url === "/bananas") {
      const { rows } = await pool.query("SELECT * FROM bananas ORDER BY id");
      return send(200, rows);
    }
    send(404, { error: "not found" });
  } catch (e) {
    send(500, { error: e.message });
  }
});

pool
  .query("CREATE TABLE IF NOT EXISTS bananas (id SERIAL PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT now())")
  .then(() => server.listen(8080, () => console.log("listening on 8080")));
