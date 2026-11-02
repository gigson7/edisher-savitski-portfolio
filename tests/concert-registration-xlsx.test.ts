import assert from "node:assert/strict";
import { test } from "node:test";
import ExcelJS from "exceljs";
import { registrationsXlsx } from "../lib/concert-registration-xlsx";
import { parseRegistration } from "../lib/concert-registration";

test("accepted registration names always reopen in Excel; XML-invalid scalars are rejected", async () => {
  const body = { firstName: "ნუცა 😀 & <Guest>", lastName: "O’Neill", email: "guest@example.com", consent: true, website: "" };
  for (const invalid of ["\uFFFE", "\uFFFF", "\uD800", "\uDC00"]) {
    assert.equal(parseRegistration({ ...body, firstName: "Guest" + invalid }), null);
    assert.equal(parseRegistration({ ...body, lastName: "Guest" + invalid }), null);
  }
  const accepted = parseRegistration(body);
  assert.ok(accepted);
  const book = new ExcelJS.Workbook();
  await book.xlsx.load((await registrationsXlsx([{ ...accepted, createdAt: new Date("2026-11-02T10:00:00Z") }])).buffer);
  assert.equal(book.getWorksheet("Registrations")!.getCell("A2").value, body.firstName);
});

test("Excel export preserves Unicode and typed dates; user values remain literal text without formulas or hyperlinks", async () => {
  const values = ["ნუცა", "=HYPERLINK(\"https://example.com\")", "+1+2", "-1+2", "@SUM(A1)", "  =1+2", "https://example.com"];
  const date = new Date("2026-11-02T10:00:00.000Z");
  const rows = values.map((firstName) => ({ firstName, lastName: "O’Neill, \"Guest\"", email: "+guest@example.com", createdAt: date }));
  const bytes = await registrationsXlsx(rows);
  assert.equal(String.fromCharCode(...bytes.subarray(0, 2)), "PK");
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(bytes.buffer);
  const sheet = book.getWorksheet("Registrations")!;
  assert.equal(book.worksheets.length, 1);
  assert.equal(sheet.rowCount, rows.length + 1);
  assert.deepEqual([1, 2, 3, 4].map((column) => sheet.getRow(1).getCell(column).value), ["First name", "Last name", "Email", "Registered at (UTC)"]);
  for (let index = 0; index < rows.length; index++) {
    const row = sheet.getRow(index + 2);
    assert.equal(row.getCell(1).value, rows[index].firstName);
    assert.equal(row.getCell(2).value, rows[index].lastName);
    assert.equal(row.getCell(3).value, rows[index].email);
    for (const column of [1, 2, 3]) {
      assert.equal(row.getCell(column).type, ExcelJS.ValueType.String);
      assert.equal(row.getCell(column).formula, undefined);
      assert.equal(row.getCell(column).hyperlink, undefined);
    }
    assert.equal((row.getCell(4).value as Date).toISOString(), date.toISOString());
  }
  assert.equal(sheet.views[0].state, "frozen");
  assert.ok(sheet.autoFilter);
});

test("empty Excel export remains a valid workbook with column headers", async () => {
  const book = new ExcelJS.Workbook();
  await book.xlsx.load((await registrationsXlsx([])).buffer);
  const sheet = book.getWorksheet("Registrations")!;
  assert.equal(sheet.rowCount, 1);
  assert.equal(sheet.getCell("A1").value, "First name");
  assert.ok(sheet.autoFilter);
});
