import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Adjusted Cost: </strong> 
  Entering this will override the expected cost. This is in case there 
  was some adjustment in the cost subsequent to the voucher generation. 
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Line Num in Quotations: </strong> 
  The 'Line Num in Quotations' is to enter the line number from the Quotations, 
  but used only for the Transport to link to the Quotations for obtaining 
  additional costing info about the car itinerary. This is to be modified
  only when you do not obtain the correct costing but in normal 
  circumstances, this would be automated<br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Cost Breakup: </strong> 
  During the editing of the vouchers, there is a tab for the COst Breakup.
  This will give the details of the calculations. The 'Show Details' toggle 
  will display the parameters used in the costing as well. <br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Manual Vouchers: </strong> 
  Click on the '+' icon to add a manual voucher <br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Edit Voucher Description: </strong> 
  At the bottom of the is an 'Edit Description' link. 
  Clicking on the link and this opens up a form. The form will change 
  depending on the Voucher Type.  <br></br>
</p><br></br>
</div>


export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>Voucher Listing: </strong> 
    The voucher listing for the selected tour is displayed. 
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Searching: </strong> 
    Enter the Tour Code and hit 'Enter' or click on the 'Search' icon  <br></br>
    By default the it will search for the tour code within the last 2 years
    but if you wish to broaden the search, then push the toggle to the right <br></br>
    The search can also be done based on Voucher Number or the Pax Name by 
    choosing them from the drop down <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Reports: </strong> 
    Half Page Voucher - This creates vouchers on 6 inch pages on pre-printed
    stationary. So on a 12 inch page with perforations, it would print 2 
    vouchers per page. This is in the PDF format. <br></br>
    Half Page Voucher - This creates 2 vouchers per page. This could be 
    printed on A4 size pages.<br></br>
    Vouchers with Logo - This creates 1 vouchers per page with an embedded 
    logo. This could be printed on A4 size pages but would be mainly used for 
    emailing rather than printing.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Editing Vouchers: </strong> 
    Click on the Edit Button, Make Changes and Save: <br></br>
    To modify the main description, please read the section following this section: <br></br>
    This screen can also be used for checking the vouchers sequentially by 
    clicking on the 'Previous Voucher' or 'Next Voucher' buttons<br></br>
    If you have modified the voucher, click on the 'Tick' button below to 
    save changes without the form closing<br></br>
    The 'Line Num in Quotations' is to enter the line number from the Quotations, 
    but used only for the Transport to link to the Quotations for obtaining 
    additional costing info about the car itinerary. This is to be modified
    only when you do not obtain the correct costing but in normal 
    circumstances, this would be automated<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Cost Breakup: </strong> 
    During the editing of the vouchers, there is a tab for the COst Breakup.
    This will give the details of the calculations. The 'Show Details' toggle 
    will display the parameters used in the costing as well. <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Line Items: </strong> 
    Here the items that constitute the invoice can be added, edited & deleted: <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Manual Vouchers: </strong> 
    Click on the '+' icon to add a manual voucher <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Edit Voucher Description: </strong> 
    Edit a voucher. At the bottom of the form will be an 'Edit Description' link. 
    Clicking on the link and this opens up a form. The form will change 
    depending on the Voucher Type. WHen you Save, the description in the 
    form will change accordingly, and so will the Cost Breakup <br></br>
  </p><br></br>
</div>
