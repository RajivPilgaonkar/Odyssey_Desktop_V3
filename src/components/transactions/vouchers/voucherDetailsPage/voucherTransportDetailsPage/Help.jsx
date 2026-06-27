import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Invoice No: </strong> 
  The invoice number is the next number regardless of the division <br></br>
  So 'Tours' & 'Summertime' will share the same invoice series for GST purposes <br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Customer: </strong> 
  Choose the customer from the drop down [Category: Principal Agents] <br></br>
  If the customer does not appear in the drop down, click on the 
  'Additional' tab and enter the customer details <br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Invoice Amount: </strong> 
  The total invoice amount after tax. This is in the specified currency. <br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Place Of Supply: </strong> 
  This is very important from the GST point of view: <br></br>
  'Goa' intra-state C-GST & S-GST applicable <br></br>
  Any other state - I-GST applicable <br></br>
  For GST purposes, the invoice should pertain to only a single 'Place Of Supply' <br></br>
  But for Tour Invoices, there could be multiple places of supply (each in a different state),
  where IGST is applicable and besides there could be services in Goa (CGST/SGST) <br></br>
  So the Tour Invoice showns an IGST only, but when printing the department invoice, 
  it is split into several invoices (one for every state with IGST), and if services 
  are rendered in Goa, the invoice will specify CGST & SGST. <br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>IGST, CGST, SGST: </strong> 
  Specify the percentage and the amount will be auto-computed: <br></br>
  This amount is in Ts. after multiplying by the exchange rate: <br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Line Items: </strong> 
  Here the items that constitute the invoice can be added, edited & deleted: <br></br>
</p><br></br>
</div>


export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Invoice Listing: </strong> 
<br/>Invoice Listing for selected Division & Invoice Type<br/>
<br/>Invoices can be added, edited or deleted<br/>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Tour Invoices: </strong> 
  Although all tour invoices are displayed with an IGST, the services 
  may be been partially rendered in Goa. So when 'Department Invoices'
  are printed, they will be split state-wise with I-GST for non-Goa 
  invoices, and C-GST & S-GST for Goa invoices.<br/>  
</p><br></br>
</div>
