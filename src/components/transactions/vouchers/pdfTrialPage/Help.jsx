import React from 'react';

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Tours Between: </strong> 
  The tours between the selected dates are displayed on clicking
  the 'Refresh' button. The 'Up' and 'Down' buttons to the left 
  of the 'Refresh' button, move the period up a week or down a week.<br></br>
  On clicking the 'Refresh' button, if the voucher generation process 
  (including mailing vouchers) is completed, the line is coloured in green.
  If the vouchers are created but the mails have not yet been sent, the 
  line is coloured in black. And if the vouchers have not yet been 
  generated, the line is coloured in red.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Actions for Period: </strong> 
  <br/><strong>1. Generate Vouchers</strong> <br/>
  This will generate vouchers for the selected tour. These vouchers are
  based on the data in the quotations. <br/>
  <br/>
  <br/><strong>2. Delete Vouchers</strong><br/>
  This will delete all vouchers for the selected tour. <br/>
  The deletion is allowed only for the last created vouchers. Otherwise
  it would leave a hole in the numbering.
</p><br></br>
</div>
