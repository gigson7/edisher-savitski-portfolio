import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.DATABASE_URL || "";
  const results: Record<string, string> = { url: url.replace(/:[^:@]+@/, ":***@") };

  // Parse URL
  let host = "localhost", port = 3306, user = "", password = "", database = "";
  try {
    const parsed = new URL(url);
    host = parsed.hostname || "localhost";
    port = parseInt(parsed.port || "3306");
    user = decodeURIComponent(parsed.username);
    password = decodeURIComponent(parsed.password);
    database = parsed.pathname.slice(1);
    results.parsed = `host=${host} port=${port} user=${user} db=${database}`;
  } catch (e) {
    results.parseError = String(e);
  }

  // Test: mariadb single connection (no pool)
  try {
    const mariadb = require("mariadb");
    const conn = await mariadb.createConnection({ host, port, user, password, database, connectTimeout: 5000 });
    const rows = await conn.query("SELECT 1 as test");
    await conn.end();
    results.mariadb = "SUCCESS: " + JSON.stringify(rows);
  } catch (e: unknown) {
    const err = e as Error;
    results.mariadb = "FAILED: " + (err.message || String(e));
  }

  return NextResponse.json(results, { status: 200 });
}
