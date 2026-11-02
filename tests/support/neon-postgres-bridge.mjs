// LOCAL TEST ONLY. Exercises the production Neon HTTP adapter against disposable PG.
// Never import this helper from application code or run it with production credentials.
import http from "node:http";
import { appendFileSync } from "node:fs";
import pg from "pg";

const database = new URL(process.env.CONCERT_TEST_DATABASE_URL ?? "");
if (database.hostname !== "127.0.0.1" || database.pathname !== "/concert_test") throw new Error("A disposable loopback concert_test database is required.");
// Exercise all queries in a non-UTC session to catch accidental naive timestamp casts.
const pool = new pg.Pool({ connectionString: database.href, max: 8, statement_timeout: 5000, options: "-c TimeZone=Asia/Tbilisi" });
const types = { getTypeParser: () => (value) => value };

const server = http.createServer(async (request, response) => {
  let text = "";
  for await (const chunk of request) text += chunk;
  response.setHeader("Content-Type", "application/json");
  if (request.url !== "/sql") {
    // Local capture sink for production-mode telemetry tests.
    appendFileSync("/tmp/edisher-concert-local-telemetry.log", text + "\n");
    response.end("{}"); return;
  }
  try {
    const { query, params } = JSON.parse(text);
    const result = await pool.query({ text: query, values: params, rowMode: "array", types });
    response.end(JSON.stringify({ fields: result.fields, rows: result.rows, rowCount: result.rowCount, command: result.command }));
  } catch (error) {
    response.statusCode = 400;
    response.end(JSON.stringify({ message: error.message, code: error.code }));
  }
});
server.listen(55437, "127.0.0.1", () => console.log("Local-only Neon protocol bridge: http://127.0.0.1:55437"));
