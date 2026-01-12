import ExcelJS from "exceljs";

/**
 * Reads Excel data into a JSON array
 * Example output:
 * [
 *  { email: 'user1', password: '123', state: 'AL', profession: 'Real Estate', producer: '...', firmName: '...' }
 * ]
 */
export async function readExcelData(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const data = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header row
    const [email, password, state, profession, producer, firmName] = row.values.slice(1); // ignore empty cell index 0
    data.push({ email, password, state, profession, producer, firmName });
  });


const rowsEnv = process.env.ROWS; // set with: ROWS="2" or ROWS="2,3" or ROWS="2-4"
let rowsToRun;
if (!rowsEnv) {
  rowsToRun = rows; // default: all rows
} else if (rowsEnv.includes('-')) {
  const [startStr, endStr] = rowsEnv.split('-').map(s => s.trim());
  const start = Number(startStr);
  const end = Number(endStr);
  rowsToRun = rows.slice(start, end); // slice end is exclusive
} else {
  const indices = rowsEnv.split(',').map(s => Number(s.trim()));
  rowsToRun = indices.map(i => rows[i]).filter(Boolean);
}










  return data;
}
