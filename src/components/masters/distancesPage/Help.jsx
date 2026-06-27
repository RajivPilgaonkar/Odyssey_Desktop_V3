import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>Distances: </strong> 
    Enter the distance and duration between 2 cities
  </p><br></br>
</div>

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>Distances: </strong> 
    Enter the distance and duration between 2 cities
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>From City: </strong><br/>
    Select the 'From City' from the drop down first. This will list all
    the 'To Cities' for which you have entered the data. TO add a new city,
    click the '+' (or add) button.
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Editing a 'To City': </strong><br/>
    This will open a form where the 'To City', distance and duration can 
    be entered. Additionally, the list of cities you pass through, and 
    the list of states you cross can be entered. 'To City' is editable 
    in only the 'Add' mode and not the 'Edit' mode as it can create
    problems in generating the reverse.
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Marked as Edited: </strong><br/>
    Once the distance, duration, city list or state list are modified, 
    the distance record is marked as 'Edited' and displayed in red. 
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Add/Edit Reverse: </strong><br/>
    Any record in distance that is modified or added is displayed in red. 
    If for example, Delhi-Agra drive has been modified, the Agra-Delhi
    drive must also be modified. Once any record is displayed in red 
    (and it is possible you have multiple cities modified for that 
    'From City'), the 'Reverse' button in the top panel, will also turn
    red. If clicked, the reverse records will be added or modified 
    automatically for all the edited records. This is applicable for 
    any modifications made in the the distances data or the city list 
    or state list. In the reverse entries, the city list order and 
    the state list order would be reversed.
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Update data for the Route Finder: </strong><br/>
    Whenever any distance data is modified, the corresponding changes 
    must reflect in the route finder. There is another button on the 
    top panel, which will turn red anytime a modification is made to 
    the data. Clicking this button will transfer the changes to the 
    Route Finder. Since this could be a time consuming process, 
    it is preferable that you do it after you have performed all 
    the edits for a given 'From City'.
  </p><br></br>
</div>
