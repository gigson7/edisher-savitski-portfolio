import type { RegistrationInput } from "@/lib/concert-registration";

export async function registrationsXlsx(rows: Array<RegistrationInput & { createdAt: Date }>): Promise<Uint8Array<ArrayBuffer>> {
  // Load the pure-JavaScript writer only for an authenticated Excel download.
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Edisher Savitski";
  workbook.title = "YASI 2026 concert registrations";
  const sheet = workbook.addWorksheet("Registrations", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "First name", key: "firstName", width: 25 },
    { header: "Last name", key: "lastName", width: 25 },
    { header: "Email", key: "email", width: 42 },
    { header: "Registered at (UTC)", key: "createdAt", width: 25, style: { numFmt: "yyyy-mm-dd hh:mm" } },
  ];
  for (const row of rows) {
    // Explicit string values never become formulas or hyperlinks, even when they
    // begin with =,+,-,@. Preserve the exact names/email Yamaha needs.
    sheet.addRow({ firstName: row.firstName, lastName: row.lastName, email: row.email, createdAt: row.createdAt });
  }
  sheet.autoFilter = { from: "A1", to: `D${sheet.rowCount}` };
  sheet.getRow(1).height = 26;
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF715C2B" } };
    cell.alignment = { vertical: "middle" };
  });
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    row.alignment = { vertical: "top", wrapText: true };
    if (index % 2 === 0) row.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFAF8F4" } };
    });
  });
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}
