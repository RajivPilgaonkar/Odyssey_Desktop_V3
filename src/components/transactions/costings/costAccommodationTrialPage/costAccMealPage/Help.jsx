import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Vehicle: </strong> 
  This is the listing of vehicles as entered in the Masters /
  Car / Car Hire, as entered for that Agent and Service City
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Per Km (AC): </strong> 
  Rate per km. for an A/C car 
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Per Km (NAC): </strong> 
  Rate per km. for a non-A/C car <br></br>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Min Kms: </strong> 
  Minimum kms that would be charged for the day. Suppose the 
  minimum kms is 80, and the kms travelled that day is 60, then
  the "rate per km" would be multiplied by 80.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Night Halt: </strong> 
  This will be the charge levied for every night that the car 
  spends in the state, whether empty or with pax
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Toll tax: </strong> 
  This will be the charge for every entry into the state
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Escort: </strong> 
  This will be the charge per day, if an escort need to 
  accompany the pax
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
  By default, the drop-down lists agents for whom there was 
  a 'Per Km' cost entered. There is a toggle to the right 
  of the drop-down box, which when moved to the right, 
  would change the drop-down listing to display all the agents.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Service City: </strong> 
  By default, the drop-down lists service cities for which there 
  was a 'Per Km' cost entered. There is a toggle to the right 
  of the drop-down box, which when moved to the right, 
  would change the drop-down listing to display all the 
  service cities.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Wef: </strong> 
  By default, the drop-down lists 'with effect from' dates 
  for which there was a 'Per Km' cost entered in the last 
  3 years. The toggle to the right of the drop-down box, if
  moved to the right, would show a list of all the 'wef'
  for which a cost was entered.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Adding a new cost: </strong> 
  Select the agent and service city that you want to enter a 
  cost for. If the cost is for a current 'Wef' (as listed in the 
  frop down), then you can set that as well. Click on the 
  'Add Row' to insert a new record. You can change the 'Wef'
  in the form, if required. If this 'Wef' entered is not in 
  the drop down list, then after saving the record, you would 
  have to refresh the wef. This can be done by toggling the 
  'Wef' switch back and forth once.
</p><br></br>
</div>
