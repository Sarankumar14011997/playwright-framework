// utils/excelUtils.js
import ExcelJS from 'exceljs';
import path from 'path';

export async function readExcel(filePath, sheetName = null) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = sheetName ? workbook.getWorksheet(sheetName) : workbook.worksheets[0];
  if (!worksheet) throw new Error(`Worksheet not found: ${sheetName || 'first sheet'}`);

  // Read header row (assume first row is header)
  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers.push(String(cell.text).trim());
  });

  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const rowObj = {};
    headers.forEach((h, i) => {
      const cell = row.getCell(i + 1);
      // use .text to handle dates/numbers nicely
      rowObj[h] = cell.text ? String(cell.text).trim() : '';
    });
    rows.push(rowObj);
  });

  return rows;
}

// helper to get absolute path from project root
export function excelPathFromProject(...segments) {
  return path.resolve(process.cwd(), ...segments);
}
