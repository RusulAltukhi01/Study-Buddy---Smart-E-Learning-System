import { useState } from 'react';
import { toast } from 'sonner';
import ExportService from '../services/exportService';


const useExport = (data, options = {}) => {
  const [exporting, setExporting] = useState(false);
  const { columns, filename = 'export' } = options;

  const exportToExcel = async (customData = null, customFilename = null) => {
    const exportData = customData || data;
    const exportFilename = customFilename || filename;

    if (!exportData || exportData.length === 0) {
      toast.error('No data to export');
      return false;
    }

    setExporting(true);
    try {
        console.log("Calling ExportService.exportToExcel");
      ExportService.exportToExcel(exportData, exportFilename, { columns });
      toast.success(`Exported ${exportData.length} items successfully!`);
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
      return false;
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async (customData = null, customFilename = null) => {
    const exportData = customData || data;
    const exportFilename = customFilename || filename;

    if (!exportData || exportData.length === 0) {
      toast.error('No data to export');
      return false;
    }

    ExportService.exportToCSV(exportData, exportFilename, { columns });
    toast.success('Export successful!');
    return true;
  };

  return {
    exporting,
    exportToExcel,
    exportToCSV
  };
};

export default useExport;