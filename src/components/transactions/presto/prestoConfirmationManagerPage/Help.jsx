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
  <p style={{display: 'inline-block'}}><strong>Module Quotations: </strong> 
    Module Quotations are quotations derived from Presto but with the data 
    rearranged in a different form. For the Riksja Network agents, the 
    data is grouped based on the Riksja Modules, whereas for the others, 
    the data will be as it is in Presto. This data is further used in 
    creating an invoice.
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Date Range: </strong> 
    The tours for a month can be seen at a time, and this data is 
    further classified as 'Live' or 'Trial'. This classification is 
    made in Presto. So in Presto if you classify a tour as 'Live', 
    then in Module Quotations you would also see it as 'Live' and 
    the similar logic would hold for Trial. By selecting the 
    'Live' or 'Trial' from the drop-down, the data would be filtered
    accordingly. Data can further be filtered to display to display 
    only the tours created by the logged in user with the aid of 
    the 'Created By Me' toggle.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Searching: </strong> 
    Click on the 'Search' icon. Enter the Tour Code and hit 'Enter' or 
    click on the 'Search' icon  <br></br>
    By default the it will search for the tour code within the last 2 years
    but if you wish to broaden the search, then push the toggle to the right <br></br>
    The search can also be done based on the Pax Name by 
    choosing the option from the drop down <br></br>
    If the found tour is 'Live', it will automatically set the filter
    to the 'Live' option and similarly if the found tour is classified as 
    'Trial', it will automatically set the filter to the 'Trial' option 
    <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Data Colour Coding: </strong> 
    The tour listing could either be coloured black, green or red  <br></br>
    Green would mean that the tour has already been invoiced and 
    this module quotation cannot be further modified. <br></br>
    Red would mean that the tour has been cancelled and cannot 
    be further modified. <br></br>
    Black would mean that the tour has not been invoiced. This module
    quotaion can be modified <br></br>
    <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Creating Module Quotations: </strong> 
    Module Quotations should not be manually entered but should be created 
    from Presto. If the Presto Quotation is classified as 'Live', the 
    Module Quotation would also automatically be classified as 'Live' 
    and the same goes for the 'Trial'. <br></br>
    However, if a Module Quotation needs to be created manually for some 
    reason, then click on the '+' would create a new Quotation. <br></br>
    Module Quotations created can be modified by clicking on the 'Edit'
    iocn for the corresponding tour. <br></br>
    <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Module Quotation Cancellation: </strong> 
    A module quotation can be cancelled by clicking on the 'X' icon. Cancellation 
    is not the same as deleting a quotation. An invoice is created for cancelled 
    tours as well as depending on the interval between the cancellation and the 
    tour departure date, a cancellation percentage is levied, so the 
    cancellation date is very important in such instances.  <br></br>
    Cancellations can be made for tours whch have not been invoiced as 
    yet<br></br>
    <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Reports: </strong> 
    Module Quotation (Excel) - This creates the quotation in excel. If
    this report is generated after a tour cancellation, then extra columns
    would show up in the report to reflect the cancellation fee. <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Editing Module Quotations: </strong> 
    Click on the Edit Button, Make Changes and Save: <br></br>
    To check the line items associated with this quotation, scroll down
    below the 'Save' button and the line items will be visible.<br></br>
    <br></br>
    As an alternative to scolling, click on the icon on the top panel, 
    and that would hide the form and make only the line items visible. This 
    button is a toggle to hide or show the top form.<br></br>
    <br></br>
    The line items are organized or grouped based on the classification of 
    each line based in Presto. This is applicable only where the Principal 
    Agent is part of the 'Riksja Network'. Each group along with its line 
    items would be classified in a different colour for easy identification.
    There would be 3 types of line items. A grouped line item, an 
    orphaned line item or a group title line item.<br></br>
    <br></br>
    Non-classified items (or orphans) would appear normally at the top or 
    bottom of the item listing. These can be classified by right clicking 
    the item and selecting the desired group. Non-classified items can also 
    be moved to the top of the list or bottom of the list by clicking on the 
    'up' or 'down' arrow. <br></br>
    <br></br>
    New items can be added to the list by clicking on the '+' icon. <br></br>
    <br></br>
    Items can be reordered by clicking on the reorder icon. Then they can be 
    dragged higher or lower in the list. But a reorder is restricted only 
    within the group. To move to a separate group, right click and link 
    to the desired group. <br></br>
    <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Inserting new line items from Elements: </strong> 
    Click on the 'Import icon'. To select a group title, select from the 
    'Modules' drop down and then click on the 'Import' button below. To select line items, 
    select the corresponding element type from the drop down, and then click on the 'Import' 
    button below. On closing this form, all the imports will appear as orphaned or 
    non-classified items. To classify or group, right click and link to desired
    group.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Working Backwards from 'Tax After Amt': </strong> 
    Enter the 'Amt After Tax'. Click on the link at the bottom which reads
    'Work Backwards from Amt after Tax'. This will set the rate Rate such that the
    (Qty*Rate) * (1 + (Gst%)/100) would equal to the 'Amt After Tax'.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Deleting an entire Module Quotation: </strong> 
    To delete an entire Module Quotation, edit the quotation by clicking n the 
    'Edit' icon. Then on the top panel in the right corner, click on the 'Delete' 
    icon. Only quotations which have not been invoiced, can be deleted. Remember that 
    deletion is not the same as cancellation as there is an amount invoiced as 
    cancellation fee. If a quotation is deleted, an invoice will not be raised.<br></br>
  </p><br></br>
</div>
