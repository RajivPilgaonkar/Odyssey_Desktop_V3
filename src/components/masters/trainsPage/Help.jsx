import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>Train No.: </strong> 
    If you enter the train number, and the train number exists, 
    then all the other details will be entered automatically which 
    can be modified.
  </p><br></br>
</div>

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>Trains: </strong> 
    A list of trains. You can search by 'Train No' or by 'Train Name'. 
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>List of Trains: </strong> 
    This will list based on a Train No, but will display also historic
    data for the same train number, ordered by the latest entry first.  
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Add Train: </strong> 
    Click on the '+' to add a train. If you enter a 'Train No', if 
    this train number exists, all the train details will be filled 
    out for you.
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Display Train Station: </strong> 
    Click on the button next to '+' whose hint is 'Display Train Stations'.
    Here you can add / modify Train Stations as well as the available
    classes. 
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Update Train Stations: </strong> 
    When you click on a station, you would see a button in the top panel, 
    whose hint is 'Update Train Stations'. This would be visible only
    for stations where a city is also entered. If you click this button,
    then this city will be attached to all the stations (for all the 
    routes).
  </p><br></br>
</div>
