import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
</div>


export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Select Vouchers for Mailing: </strong> 
<br/>This allows you to select vouchers that need to be mailed to the hotel/agent<br/>
<br/>By default, it will select vouchers or which the 'Requested On' is blank<br/>
<br/>However, using the 'Selections' button, you could 'Clear All Selections', 
'Select All', or select from the default mode, which is 'Select UnRequested'<br/>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Mailing Confirmation Requests: </strong> 
  <br/>Click on Actions for Selected -&gt; Mail Service Requests<br/>
  <br/>This will give you info about the vouchers that have been selected to be emailed
  <br/>Click on 'Send Emails' to send out the mails, and set the 'Requested On' against
       that voucher.
  <br/>An email is sent out to each unique vendor with an e-mail body 
    specifying a list of vouchers and a corresponding PDF file. Each PDF file may
    contain multiple vouchers. A list of the vouchers can also be found in the 
    'Donwloads' folder. 
  <br/>The email is sent to the Gamil drafts folder, from which it can be checked and 
       sent. Sending will place it in the Send folder of Gmail and will also mail a 
       copy out to the hotel/agent.
  <br/> If the mail is not sent, check your internet connection, or gmail settings or
        check with errors which might be displayed at the backend noe window.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Remarks: </strong> 
  <br/>Edit to enter remarks. These are normally followup remarks 
  after a request has been mailed out, until it is confirmed<br/>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Confirmation: </strong> 
  <br/>After a confirmation has been received, right click and 
  'Set Confirmed On'. This can be undone by right clicking again 
  and selecting 'Undo Confirmation'<br/>
  <br/>The setting of 'Requested On', 'Confirmed On', 'Cancelled On' 
  can be handled using a right click <br/>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Mailing Cancellation Requests: </strong> 
  <br/>Click on Actions for Selected -&gt; Mail Cancellation Requests<br/>
  <br/>This will give you info about the vouchers that have been selected to be emailed
  <br/>Click on 'Send Emails' to send out the cancellation mails, and set 
       the 'Cancelled On' against that voucher.
  <br/>The email is sent to the Gamil drafts folder, from which it can be checked and 
       sent. Sending will place it in the Send folder of Gmail and will also mail a 
       copy out to the hotel/agent.
  <br/> If the mail is not sent, check your internet connection, or gmail settings or
        check with errors which might be displayed at the backend noe window.
  <br/> Cancelled vouchers are displayed with a red strike through
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Status Labels: </strong> 
  <br/>On the top left header, a status label provides into on 
  requests are pending for mailing, 
  requests are pending for confirmation after mailing,
  requests that are cancelled<br/>
</p><br></br>
</div>
