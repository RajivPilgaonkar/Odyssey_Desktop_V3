import {saveAs} from "file-saver";
import {exportTallyXmlReport} from "./VoucherTallyXmlReport";

//**********************************************************/
export async function exportXmlReport(reportObj, mainData) {

  const content = {text: ''};

  const fileName = reportObj.reportName;
  
  if (reportObj.type === 6) {
    await exportTallyXmlReport(mainData, content)
  } 
    
  const fileType = 'text/plain';
  const fileExtension = '.xml';
  
  const blob = new Blob([content.text], { type: fileType });
  
  saveAs(blob, fileName + fileExtension);
    
}

