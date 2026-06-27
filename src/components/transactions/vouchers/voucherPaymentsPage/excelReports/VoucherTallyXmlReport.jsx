import moment from 'moment';

//**********************************************************/
export async function exportTallyXmlReport(mainData, content) {

  const tallyHeader = await getTallyHeader();
  const tallyFooter = await getTallyFooter();
  let voucherHeader = await getVoucherHeader();
  let voucherFooter = await getVoucherFooter();

  let voucherBody1 = await getVoucherBody1();
  let voucherBody2 = await getVoucherBody2();

  const textConstruct = {
    voucherHeader: voucherHeader,
    voucherBody1: voucherBody1,
    voucherBody2: voucherBody2,
    voucherFooter: voucherFooter
  }

  let text = '';

  text += '\n';

  for (var rec of mainData){

    textConstruct.voucherHeader = voucherHeader;
    textConstruct.voucherBody1 = voucherBody1;
    textConstruct.voucherBody2 = voucherBody2;
    textConstruct.voucherFooter = voucherFooter;

    updateXmlText(textConstruct, rec);

    text += textConstruct.voucherHeader + 
            textConstruct.voucherBody1 + 
            textConstruct.voucherBody2 + 
            textConstruct.voucherFooter + 
            '\n';
  }

  content.text = tallyHeader + text + tallyFooter;
  
}

//**********************************************************/
async function updateXmlText(textConstruct, rec) {

  //const dateStr = '20240401';
  const dateStr = moment(rec.VoucherDate).format('YYYYMMDD');
  let narration = rec.Narration;
  const voucherNo = rec.VoucherNo.toString();
  const yearRef = (rec.YearRef !== null) ?  rec.YearRef.toString().slice(2) : '';
  const tourCode = (rec.TourCode !== null) ? rec.TourCode : '';
  let partyLedger1 = rec.Account1;
  let partyLedger2 = rec.Account2;
  const amount = rec.Amount.toString();

  // Date
  let voucherHeader = textConstruct.voucherHeader;
  let searchRegExp = /<DATE><\/DATE>/g;
  let replaceWith = '<DATE>' + dateStr + '</DATE>';
  voucherHeader = voucherHeader.replace(searchRegExp, replaceWith);

  //searchRegExp = /<REFERENCEDATE><\/REFERENCEDATE>/g;
  //replaceWith = '<REFERENCEDATE>' + dateStr + '</REFERENCEDATE>';
  //voucherHeader = voucherHeader.replace(searchRegExp, replaceWith);

  // Narration
  narration = narration.replace(/&/g,'&amp;')
  searchRegExp = /<NARRATION><\/NARRATION>/g;
  replaceWith = '<NARRATION>' + narration + '</NARRATION>';
  voucherHeader = voucherHeader.replace(searchRegExp, replaceWith);

  // Party Ledger
  partyLedger1 = partyLedger1.replace(/&/g,'&amp;')
  searchRegExp = /<PARTYLEDGERNAME><\/PARTYLEDGERNAME>/g;
  replaceWith = '<PARTYLEDGERNAME>' + partyLedger1 + '</PARTYLEDGERNAME>';
  voucherHeader = voucherHeader.replace(searchRegExp, replaceWith);

  // VoucherNo
  searchRegExp = /<VOUCHERNUMBER><\/VOUCHERNUMBER>/g;
  replaceWith = '<VOUCHERNUMBER>' + voucherNo + '/' + yearRef + '/' + tourCode + '</VOUCHERNUMBER>';
  voucherHeader = voucherHeader.replace(searchRegExp, replaceWith);

  //*** Voucher Body ***//
  let voucherBody1 = textConstruct.voucherBody1;
  let voucherBody2 = textConstruct.voucherBody2;

  //*** Voucher Body 1 ***//

  // Ledger
  partyLedger2 = partyLedger2.replace(/&/g,'&amp;')
  searchRegExp = /<LEDGERNAME><\/LEDGERNAME>/g;
  replaceWith = '<LEDGERNAME>' + partyLedger2 + '</LEDGERNAME>';
  voucherBody1 = voucherBody1.replace(searchRegExp, replaceWith);

  // Amount
  searchRegExp = /<AMOUNT><\/AMOUNT>/g;
  replaceWith = '<AMOUNT>-' + amount + '</AMOUNT>';
  voucherBody1 = voucherBody1.replace(searchRegExp, replaceWith);
  

  //*** Voucher Body 2 ***//

  // Ledger
  searchRegExp = /<LEDGERNAME><\/LEDGERNAME>/g;
  replaceWith = '<LEDGERNAME>' + partyLedger1 + '</LEDGERNAME>';
  voucherBody2 = voucherBody2.replace(searchRegExp, replaceWith);

  // Amount
  searchRegExp = /<AMOUNT><\/AMOUNT>/g;
  replaceWith = '<AMOUNT>' + amount + '</AMOUNT>';
  voucherBody2 = voucherBody2.replace(searchRegExp, replaceWith);

  textConstruct.voucherHeader = voucherHeader;
  textConstruct.voucherBody1 = voucherBody1;
  textConstruct.voucherBody2 = voucherBody2;
  
}

//**********************************************************/
async function getTallyHeader() {

  const tallyHeader = `
  <ENVELOPE>
    <HEADER>
      <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
      <IMPORTDATA>
        <REQUESTDESC>
          <REPORTNAME>All Masters</REPORTNAME>
          <STATICVARIABLES>
            <SVCURRENTCOMPANY></SVCURRENTCOMPANY>
          </STATICVARIABLES>
        </REQUESTDESC>
        <REQUESTDATA>
  `;

  return tallyHeader;

  }

//**********************************************************/
async function getTallyFooter() {

  const tallyFooter = `
        </REQUESTDATA>
      </IMPORTDATA>
    </BODY>
  </ENVELOPE>
  `;

  return tallyFooter;

  }


//**********************************************************/
async function getVoucherHeader() {

  const voucherHeader = `
          <TALLYMESSAGE xmlns:UDF="TallyUDF">
            <VOUCHER>
              <OLDAUDITENTRYIDS.LIST TYPE="Number">
              <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
              </OLDAUDITENTRYIDS.LIST>
              <DATE></DATE>
              <GUID></GUID>
              <NARRATION></NARRATION>
              <VOUCHERTYPENAME>Optional</VOUCHERTYPENAME>
              <VOUCHERNUMBER></VOUCHERNUMBER>
              <PARTYLEDGERNAME></PARTYLEDGERNAME>
              <CSTFORMISSUETYPE/>
              <CSTFORMRECVTYPE/>
              <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
              <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
              <VCHGSTCLASS/>
              <DIFFACTUALQTY>No</DIFFACTUALQTY>
              <AUDITED>No</AUDITED>
              <FORJOBCOSTING>No</FORJOBCOSTING>
              <ISOPTIONAL>Yes</ISOPTIONAL>
              <EFFECTIVEDATE></EFFECTIVEDATE>
              <ISFORJOBWORKIN>No</ISFORJOBWORKIN>
              <ALLOWCONSUMPTION>No</ALLOWCONSUMPTION>
              <USEFORINTEREST>No</USEFORINTEREST>
              <USEFORGAINLOSS>No</USEFORGAINLOSS>
              <USEFORGODOWNTRANSFER>No</USEFORGODOWNTRANSFER>
              <USEFORCOMPOUND>No</USEFORCOMPOUND>
              <EXCISEOPENING>No</EXCISEOPENING>
              <USEFORFINALPRODUCTION>No</USEFORFINALPRODUCTION>
              <ISCANCELLED>No</ISCANCELLED>
              <HASCASHFLOW>Yes</HASCASHFLOW>
              <ISPOSTDATED>No</ISPOSTDATED>
              <USETRACKINGNUMBER>No</USETRACKINGNUMBER>
              <ISINVOICE>No</ISINVOICE>
              <MFGJOURNAL>No</MFGJOURNAL>
              <HASDISCOUNTS>No</HASDISCOUNTS>
              <ASPAYSLIP>No</ASPAYSLIP>
              <ISCOSTCENTRE>No</ISCOSTCENTRE>
              <ISSTXNONREALIZEDVCH>No</ISSTXNONREALIZEDVCH>
              <ISEXCISEMANUFACTURERON>No</ISEXCISEMANUFACTURERON>
              <ISBLANKCHEQUE>No</ISBLANKCHEQUE>
              <ISDELETED>No</ISDELETED>
              <ASORIGINAL>No</ASORIGINAL>
              <VCHISFROMSYNC>No</VCHISFROMSYNC>
              <MASTERID> 1</MASTERID>
              <VOUCHERKEY>193342247796744</VOUCHERKEY>
              <OLDAUDITENTRIES.LIST>      </OLDAUDITENTRIES.LIST>
              <ACCOUNTAUDITENTRIES.LIST>      </ACCOUNTAUDITENTRIES.LIST>
              <AUDITENTRIES.LIST>      </AUDITENTRIES.LIST>
              <INVOICEDELNOTES.LIST>      </INVOICEDELNOTES.LIST>
              <INVOICEORDERLIST.LIST>      </INVOICEORDERLIST.LIST>
              <INVOICEINDENTLIST.LIST>      </INVOICEINDENTLIST.LIST>
              <ATTENDANCEENTRIES.LIST>      </ATTENDANCEENTRIES.LIST>
              <ORIGINVOICEDETAILS.LIST>      </ORIGINVOICEDETAILS.LIST>
              <INVOICEEXPORTLIST.LIST>      </INVOICEEXPORTLIST.LIST>
  `;

  return voucherHeader;

  }

//**********************************************************/
async function getVoucherFooter() {

  const voucherFooter = `
            </VOUCHER>
          </TALLYMESSAGE>
  `;

  return voucherFooter;

  }

//**********************************************************/
async function getVoucherBody1() {

  const voucherBody1 = `
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <LEDGERNAME></LEDGERNAME>
       <GSTCLASS/>
       <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
       <LEDGERFROMITEM>No</LEDGERFROMITEM>
       <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
       <ISPARTYLEDGER>No</ISPARTYLEDGER>
       <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
       <AMOUNT></AMOUNT>
       <BANKALLOCATIONS.LIST>       </BANKALLOCATIONS.LIST>
       <BILLALLOCATIONS.LIST>       </BILLALLOCATIONS.LIST>
       <INTERESTCOLLECTION.LIST>       </INTERESTCOLLECTION.LIST>
       <OLDAUDITENTRIES.LIST>       </OLDAUDITENTRIES.LIST>
       <ACCOUNTAUDITENTRIES.LIST>       </ACCOUNTAUDITENTRIES.LIST>
       <AUDITENTRIES.LIST>       </AUDITENTRIES.LIST>
       <TAXBILLALLOCATIONS.LIST>       </TAXBILLALLOCATIONS.LIST>
       <TAXOBJECTALLOCATIONS.LIST>       </TAXOBJECTALLOCATIONS.LIST>
       <TDSEXPENSEALLOCATIONS.LIST>       </TDSEXPENSEALLOCATIONS.LIST>
       <VATSTATUTORYDETAILS.LIST>       </VATSTATUTORYDETAILS.LIST>
       <COSTTRACKALLOCATIONS.LIST>       </COSTTRACKALLOCATIONS.LIST>
      </ALLLEDGERENTRIES.LIST>
  `;

  return voucherBody1;

  }

//**********************************************************/
async function getVoucherBody2() {

  const voucherBody2 = `
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <LEDGERNAME></LEDGERNAME>
       <GSTCLASS/>
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <LEDGERFROMITEM>No</LEDGERFROMITEM>
       <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
       <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
       <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
       <AMOUNT></AMOUNT>
       <BANKALLOCATIONS.LIST>       </BANKALLOCATIONS.LIST>
       <BILLALLOCATIONS.LIST>       </BILLALLOCATIONS.LIST>
       <INTERESTCOLLECTION.LIST>       </INTERESTCOLLECTION.LIST>
       <OLDAUDITENTRIES.LIST>       </OLDAUDITENTRIES.LIST>
       <ACCOUNTAUDITENTRIES.LIST>       </ACCOUNTAUDITENTRIES.LIST>
       <AUDITENTRIES.LIST>       </AUDITENTRIES.LIST>
       <TAXBILLALLOCATIONS.LIST>       </TAXBILLALLOCATIONS.LIST>
       <TAXOBJECTALLOCATIONS.LIST>       </TAXOBJECTALLOCATIONS.LIST>
       <TDSEXPENSEALLOCATIONS.LIST>       </TDSEXPENSEALLOCATIONS.LIST>
       <VATSTATUTORYDETAILS.LIST>       </VATSTATUTORYDETAILS.LIST>
       <COSTTRACKALLOCATIONS.LIST>       </COSTTRACKALLOCATIONS.LIST>
      </ALLLEDGERENTRIES.LIST>
      <ATTDRECORDS.LIST>      </ATTDRECORDS.LIST>
  `;

  return voucherBody2;

  }
