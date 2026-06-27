import React from 'react';

export const formHelp = 
null;


export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Broad Steps to Generate Invoices: </strong> 
<br/>1. Set Exchange Rate (Options -&gt; Invoice Exch Rate Master)<br/>
2. Mark tours for which invoices should not be created (Select record & Right click)<br/>
3. Correct Errors. Hover over record to see the error. (Select record & Right click to auto-correct)<br/>
4. For any cancellations, go to the module and check the cancellation percentages <br/>
5. Generate Invoices (Based on Module Data) <br/>
6. If required, Update Exch Rates for each invoice without regenerating the invoice<br/>
7. Scan the invoice list & check if Invoice Amount is different from Module Amount<br/>
8. Check Reports<br/>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Tours Between: </strong> 
  The tours between the selected dates are displayed on clicking
  the 'Refresh' button. The 'Up' and 'Down' buttons to the left 
  of the 'Refresh' button, move the period up a month or down a month.
  You are allowed to navigate downwards only upto the last couple of 
  months and upwards to the next month.<br></br>
  On clicking the 'Refresh' button, if there are any date mismatches 
  between Presto and the &lt;Modules/Masters/Tours/Bookings&gt;, then the 
  record is shown in red. Right click to correct the dates automatically
  so that it matches the Presto date. <br></br>
  If you want to ignore a tour for invoicing, then right click and select
  'Disallow a Tour for invoicing'. The tour line will be struck through
  indicating that an invoice will not be created for this tour. By right 
  clicking on this record again, you would get the option of allowing the 
  invoicing.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Invoice Date: </strong> 
  The invoice date that will appear on the invoices which are generated
  for the tours. The invoice date is restricted in between the 'From' &
  'To' dates.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Actions for Period: </strong> 
  <br/><strong>1. Generate Invoices</strong> <br/>
  This will generate invoices for the displayed tours. These invoices are
  based on the data in the modules. For Riksja tours the costs will be picked
  from the elements. For non-Riksja tours the costs will be picked from the 
  Modules. Invoices are not created for modules where line item details 
  have not been entered.<br/>
  To generate just a single invoice, right click and generate a single invoice
  <br/>
  <br/><strong>2. Delete Invoices</strong><br/>
  This will delete all invoices for the displayed tours. <br/>
  To delete just a single invoice, right click and delete the invoice
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Invoice Exch Rate: </strong> 
  To set the invoice exchange rate for each currency, go to the 'Options' menu
  on the top left and select 'Invoice Exch Rate Master'. This will display only
  currencies which are part of the current period selected. <br/>
  If you want to update the exchange rate in the invoices after generating the 
  invoices, click on the button to the right of the title 'Generate Invoices 
  for Tours'. This will update the generated invoices with the rates from the 
  'Invoice Exch Rate Master'.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Invoice Payment Beneficiary: </strong> 
  At the bottom of each excel invoice (Client, Office & Department), the beneficiary
  details are mentioned, that is the account details for the client to make the 
  payment. Theses details are entered per currency. <br/>
  To edit these details, go to the 'Options' menu on the top left and select 
  'Invoice Pymt Beneficiaries', select the currency and edit the details.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Exporting Invoices to Tally: </strong> 
  Create a folder D:\TallyImports, if it does not already exist.
  <br/>
  Select a date range for the invoices (typically a month). 
  <br/>
  Click on Reports / Export to Tally (Excel). 
  This will generate an excel report which will display all the 
  invoices that would be exported by the BackOffice. This will 
  include all the invoices whose 'invoice dates' are within the 
  date range selected.
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

<p style={{display: 'inline-block'}}><strong>Importing Invoices into Tally: </strong> 
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
  This will go into the 'OptionalSales' series created, and not to the 
  main accounts. To move that into the main accounts, the invoice 
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

</div>
