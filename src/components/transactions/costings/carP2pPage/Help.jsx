import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Vehicle: </strong> 
  This is the listing of vehicles as entered in the Masters /
  Car / Car Hire, as entered for that Agent and Service City. 
  In the edit mode, all vehicles are displayed, whereas in the 
  add mode, only the active vehicles for the Agent/City are displayed.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Per Km (AC): </strong> 
  Rate per km. for an A/C car 
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Per Km (NAC): </strong> 
  Rate per km. for a non-A/C car <br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Tour Rep: </strong> 
  Additional cost per tour, if accompanied by a Tour Rep during the 
  trip .
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Guide: </strong> 
  Additional cost per tour, if accompanied by a Guide during the 
  trip .
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Commission: </strong> 
  The rate per km is reduced by the commision percentage. For ex.
  if the rate per km is Rs. 20, and the commission is 10%, then 
  the effective rate charged to you would be 20 - (10%*20) or
  Rs. 18.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Remarks: </strong> 
  Enter some relevant remarks for the costing. Maybe the 
  reference of the quotation, or a reference of the e-mail
  of some general notes related to the costing.
</p><br></br>
</div>


export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Agent: </strong> 
  A list of agents from the Addressbook, tagged as providing
  'P2P' services. 
</p><br></br>
<p style={{display: 'inline-block'}}><strong>From City: </strong> 
  The unique 'from' cities in which for the selected agent, a cost is entered.
  If the toggle is moved to the right, then all the cities are displayed. 
  This option can be used to enter a cost for the selected agent, in a 
  new city. <br/>
  The sector can be selected from the panel on the left too. 
</p><br></br>
<p style={{display: 'inline-block'}}><strong>To City: </strong> 
  The unique 'to' cities in which for the selected agent, a cost is entered.
  If the toggle is moved to the right, then all the cities are displayed. 
  This option can be used to enter a cost for the selected agent, in a 
  new city. <br/>
  The sector can be selected from the panel on the left too.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Wef: </strong> 
  By default, the drop-down lists 'with effect from' dates 
  for which there was a 'P2P' cost entered in the last 
  3 years. The toggle to the right of the drop-down box, if
  moved to the right, would show a list of all the 'wef'
  for which a cost was entered.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Adding a new cost: </strong> 
  Select the Agent, 'From City' and 'To City' that you want to 
  enter a cost for. If the cost is for a current 'Wef' (as listed 
  in the drop down), then you can set that as well. Click on the 
  'Add Row' to insert a new record. You can change the 'Wef'
  in the form, if required. If this 'Wef' entered is not in 
  the drop down list, then after saving the record, you would 
  have to refresh the wef. This can be done by toggling the 
  'Wef' switch back and forth once.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Copying Data: </strong> 
  The costs for all cars displayed, can be copied to another period 
  by clicking on the 'copy' icon on the 'Car (P2P) 'header. This 
  will copy the the costs for all listed cars to the new season.
</p><br></br>
</div>
