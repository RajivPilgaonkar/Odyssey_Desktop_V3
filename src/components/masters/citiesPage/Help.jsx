import React from 'react';

export const formHelp = 
  <div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
    <p style={{display: 'inline-block'}}><strong>Alias: </strong> 
      Some cities have aliases, for ex. 'Bombay' is an alias of 'Mumbai'.
      In reports, by default it would display the 'City' name. 
      However, if you tick 'Select Alias as Main Name', the system would
      display the 'Alias' instead of the 'City'.
    </p><br></br>
    <p style={{display: 'inline-block'}}><strong>Active: </strong> 
      In certain drop down selections for the cities, you might want
      to display only the 'Active' cities. In that case only the ones
      maked as 'Active' will be displayed for selection
    </p><br></br>
    <p style={{display: 'inline-block'}}><strong>Display: </strong> 
      A certain city may be active, but you may in certain situations, 
      decide not to display it. for example, on the website, you may 
      choose to display only certain cities, in which case it will not 
      display cities where 'Display' is not ticked
    </p><br></br>
    <p style={{display: 'inline-block'}}><strong>Night Halt: </strong> 
      If you provide accommodation for the night in this city, then
      tick 'Night Halt'. But if you tick 'Night Halt', then you must
      also enter the 'Recommended Nights', which defaults to 1
    </p><br></br>
  </div>

export const mainFormHelp = 
  <div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
    <p style={{display: 'inline-block'}}><strong>Finding a City: </strong> 
      If you search for a 'City' from the search box just under the
      'City' column, then it would search for just the 'City' name.
      Similarly, if you search for an 'Alias' from the search box 
      just under the 'Alias' column, then it would search for just
      the 'Alias' name.<br></br>
      But if you search for the 'City' or 'Alias' in the search box 
      on the top right, then it would search for the 'City' or 
      'Alias' in one go. So 'Mumbai' or 'Bombay' would take you to 
      the same city line. Similarly, 'Mysore' or 'Mysuru'.
    </p><br></br>
    <p style={{display: 'inline-block'}}><strong>Airline Code: </strong> 
      You could also search for a city by the 'Airline Code'. The 
      searches can be executed independently for a column, or for
      a combination of columns.
    </p><br></br>
    <p style={{display: 'inline-block'}}><strong>Combining Searches: </strong> 
      If, for example, you wanted to list all the cities in the 
      state of Rajasthan which have a night halt. Then first you
      would filter on the state of Rajasthan by using the 
      drop-down under the 'State' column. Next you would set the
      drop-down under the 'Night Halt' column to 'yes'
    </p><br></br>
    <p style={{display: 'inline-block'}}><strong>Clearing Filters: </strong> 
      To clear a filter which is a drop-down, (for example a 'State'
      or a 'Night Halt') set the entry to 'all'. To clear a filter 
      which is plain text (for example a 'City' or 'Alias' or 
      'Airline Code'), clear the text in the search box under the 
      respective column.
    </p><br></br>
    <p style={{display: 'inline-block'}}><strong>Business Cities: </strong> 
      If this is ON, then it will only show cities, which are in countries
      where you have ticked 'Operate Business'. 
      If this is OFF, then it would display all cities
    </p><br></br>
    <p style={{display: 'inline-block'}}><strong>Active Cities: </strong> 
      If this is ON, then it will only show cities marked as Active. 
      If this is OFF, then it would display all cities
    </p><br></br>
  </div>
