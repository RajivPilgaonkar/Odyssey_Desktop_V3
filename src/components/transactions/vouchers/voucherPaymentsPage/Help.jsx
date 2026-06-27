import React from 'react';

export const formHelp = null;

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Entering Bills/Payments correspoding to Vouchers: </strong> 
  Enter a Tour Code (at least 4 characters long) and click on "Search". 
  This will display all the vouchers for the tour. Select a voucher by
  clicking on it. The from the panel on the top, click on the "Bill Entry" to
  enter the Bill Details or on the "Payment Entry" to enter the payment details.
  <br/>
  Simultaneously, you must also go to Tally, and convert the 
  ‘optional voucher’ for that transaction and post it as a 
  Journal Voucher so that it enters the accounting system.  
  <br/>
  Similarly, if you want to keep track of payments made to 
  suppliers against a certain voucher, you can select the 
  vouchers, and from the top bar menu choose Payment Entry. 
  Enter the payment amount.    
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Exporting Vouchers to Tally: </strong> 
  Create a folder D:\TallyImports, if it does not already exist.
  <br/>
  Click on Reports / Export to Tally (Excel) and select a date range. 
  The recommended option is to do this on a weekly basis. This will 
  generate an excel report which will display all the vouchers that 
  would be exported by the BackOffice. This will include all the 
  vouchers whose 'departure dates' are within the date range selected.
  Only tours starting after July 1, 2023 are considered for this report.
  After this report is checked do the same for the XML report.
  <br/>
  Click on Reports / Export to Tally (XML) and select a date range
  as you did for Excel, where you checked the data. This data is 
  hard to read but accepted by Tally. So the data checking should
  be done in Excel, but the data exported as XML shoud be used 
  for importing into Tally. After the file has been exported, copy
  it from the 'Downloads' folder to the 'D:\TallyImports' folder that
  was earlier created.
</p><br></br>

<p style={{display: 'inline-block'}}><strong>Importing Vouchers into Tally: </strong> 
  Open the company in which you wish to import the data
  <br/>
  Gateway of Tally / Imports (from the top menu)
  <br/>
  Transactions
  <br/>
  Select the XML file that you exported from the BackOffice and 
  saved into the 'D:\TallyImports' in the earlier step.
  <br/>
  Tally will display the import progress
  <br/>
  To check the imported vouchers, Gateway of Tally / Display 
  More Reports / Exception Reports / Optional Reports
  <br/>
  This will go into the ‘Optional’ series created, and not to the 
  main accounts. To move that into the main accounts, the voucher 
  would have to be modified as in the main narration and then 
  the entry would be posted into the Journal Ledger.  
</p><br></br>

<p style={{display: 'inline-block'}}><strong>Troubleshooting: </strong> 
  If Tally gives an error during the import process.
  <br/>
  Check in all the Voucher Types created in ‘Preparing Tally’ are 
  created without spelling errors  
  <br/>
  Check in all the Ledgers created in ‘Preparing Tally’ are 
  created without spelling errors.
  <br/>
  Check the location of your Tally Prime (say D:\TallyPrime).
  Using Windows Explorer, navigate into D:\TallyPrime. Check for 
  a file 'Tally.imp'. Open the file in notepad. Go to the bottom 
  and check for an error message.
</p><br></br>

<p style={{display: 'inline-block'}}><strong>Outstanding Vouchers (every month end to adjust P/L): </strong> 
  Go to Transactions / Vouchers / Voucher Bills
  <br/>
  Reports / Outstanding Vouchers (Excel)
  Choose ‘As of’ Date
  <br/>
  Only vouchers which are Outstanding (Billed less than ExpectedCost) 
  will be displayed. Only tours where the departure date is less than 
  the ‘As Of’ date wil be selected. This is based on the departure 
  date of the tours and NOT the voucher date.
  <br/>
  The total in this report should be used to adjust the P/L 
  entries to offset vouchers have been sent out for which bills 
  have not been received.
  <br/>
</p><br></br>

<p style={{display: 'inline-block'}}><strong>Preparing Tally for the import (one time): </strong> 
a.	Open the company in Tally to which you want to import the data.
  <br/>
  Create a Voucher Type ‘Optional’ (for Vouchers)<br/>
  Type of Voucher : ‘Journal’<br/>
  Activate this Voucher Type: Yes<br/>
  Method of Voucher Numbering: Manual<br/>
  Prevent Duplicates: Yes<br/>
  Use Effective Dates for Vouchers: No<br/>
  Allow Zero Value Transactions: Yes<br/>
  Make this Voucher Type as Optional by Default: ‘Yes’<br/>
  Allow Narration in Voucher: ‘Yes’<br/>
  Provide Narrations for each Ledger in Voucher: ‘No’<br/>
  Track Additional Costs for Purchases: ‘No’<br/>
  <br/>
  Create the following Ledgers<br/>
  Hotels & Agents – Prov<br/>
  Sundry Debtors – Prov<br/>
  Sales Income<br/>
  IGST Output<br/>
  CGST Output<br/>
  SGST Output<br/>
  <br/>
</p><br></br>

</div>
