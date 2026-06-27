import React from 'react';

export const formHelp = 
null;

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>City: </strong> 
  List of cities from the addressbook, where the addressbook sub-category
  has been defined as 'Standard', 'Comfortable', 'Superior', 
  'Top of the Line'
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Standard: </strong> 
  The list of 'Standard' hotels in the selected city which are ranked,
  is displayed. There are 3 buttons on the header.<br/><br/>
  One is to change the ranking. This will be visible only when 
  there is more than one row of ranked hotels. When clicked, you
  will be able to drag & drop rows to reorder the list<br/><br/>
  The second is a toggle to either display all the ranked hotels 
  or all the hotels in the city. This will be visible only when 
  there are hotels in the category, which are not ranked. Unranked 
  hotels will be displayed in red<br/><br/>
  The third is a button which would be either an 'R' or 'U'. The 
  'R' is to rank an unranked hotel, whereas the 'U' would be to 
  unrank a ranked hotel<br/><br/>
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Comfortable / Superior / Top of the Line: </strong> 
  Same procedure as that of 'Standard' above.
</p><br></br>
</div>
