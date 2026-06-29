import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

class ExportService {
  static exportToExcel(data, filename, options = {}) {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const { columns = null, sheetName = 'Sheet1', autoWidth = true } = options;
    let exportData = data;


    if (columns && columns.length > 0) {
      exportData = data.map(row => {
        const newRow = {};
        columns.forEach(col => {
          if (typeof col.accessor === 'function') {
            newRow[col.header] = col.accessor(row);
          } else if (col.accessor) {
            newRow[col.header] = ExportService.getValueByPath(row, col.accessor);
          } else {
            newRow[col.header] = row[col.key] || '';
          }
        });
        return newRow;
      });
    }


    const ws = XLSX.utils.json_to_sheet(exportData);
    

    if (autoWidth && exportData.length > 0) {
      const colWidths = ExportService.calculateColumnWidths(exportData);
      ws['!cols'] = colWidths;
    }


    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${filename}_${ExportService.getCurrentDate()}.xlsx`);
  }

  static exportToCSV(data, filename, options = {}) {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const { columns = null } = options;
    let exportData = data;

    if (columns && columns.length > 0) {
      exportData = data.map(row => {
        const newRow = {};
        columns.forEach(col => {
          if (typeof col.accessor === 'function') {
            newRow[col.header] = col.accessor(row);
          } else if (col.accessor) {
            newRow[col.header] = ExportService.getValueByPath(row, col.accessor);
          } else {
            newRow[col.header] = row[col.key] || '';
          }
        });
        return newRow;
      });
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${ExportService.getCurrentDate()}.csv`);
  }

  static getValueByPath(obj, path) {
    if (!path) return '';
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  }

  static calculateColumnWidths(data) {
    if (!data || data.length === 0) return [];
    const columns = Object.keys(data[0]);
    return columns.map(col => {
      const maxLength = Math.max(
        col.length,
        ...data.map(row => String(row[col] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
  }

  static getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}

export default ExportService;