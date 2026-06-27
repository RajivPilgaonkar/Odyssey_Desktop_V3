import {saveAs} from "file-saver";
import {exportTallyXmlReport} from "./VoucherTallyXmlReport";

//**********************************************************/
export async function exportXmlReport(reportObj, mainData) {

  const content = {text: ''};

  let fileName = reportObj.reportName;

  let dateRange = '_' + reportObj.fromDate + '_' + reportObj.toDate;
  dateRange = dateRange.replace(/\//g, "-");
  fileName += dateRange;
  
  if (reportObj.type === 6) {
    await exportTallyXmlReport(mainData, content)
  } 
    
  const fileType = 'text/plain';
  const fileExtension = '.xml';
  
  const blob = new Blob([content.text], { type: fileType });
  
  saveAs(blob, fileName + fileExtension);
    
}

