import React from 'react';

export const formHelp = 
null;

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>Route Finder: </strong> 
    The route finder extracts the most convenient routes between two cities.     
    You have to enter the date and the staring time of travel and click on 
    the 'Get Route' button. The system will display mutiple options to go 
    from one city to another. <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Date & Time: </strong> 
   By default the date is the current date and the time is '09:00'. A 
   future date could also be entered. The same route may not be generated
   for each date as there will be trains which do not operate daily or 
   operate at different times on different days. The default time is '09:00'
   which means it will pick up routes which will only begin from that 
   time onwards. This behaviour can be changed by toggling on the 'lock'
   icon, which can lock or unlock the timing. When the time is locked,
   then it will pick up travel which starts beyond the stated time. The 
   unlocked mode is discussed in the sections below.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Train Preferred Routes: </strong> 
    In the Masters / Tours / Train Exceptions / Preferrred Routes, some 
    'Preferred Routes' can be entered. For example, in the train journey 
    from Khajuraho to Varanasi, for the sector Satna to Varanasi, the 
    preferred train number is 15232. This would mean that the route 
    finder would give preference to this train even though there could 
    be faster trains. <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Start Timing: </strong> 
    In normal circumstances, the route finder would look at ways to Get
    from one city to another starting at 09:00 AM. If you lock the timing
    (it should tun red when locked), it would fix the start time. So it 
    you changed the time to 10:00 AM and locked the time and clicked on 
    'Get Route', it would start all journeys after 10:00 AM.However, in 
    certain cases there would be exceptions to this. For example, if you
    travel from Delhi to Agra in the unlocked mode (color will be green)
    and you set the start time 09:00 AM, on clicking 'Get Route', you 
    will find that the start timing automatically chenges to 05:30. This 
    is beacuse the system tries to find any 'Preferred Route' trains in 
    this route, and takes the earliest time MINUS 30 minutes. So it 
    reacommends the Delhi to Agra Shatabdi at 06:00AM and the driving 
    option therefore also starts at 05:30.
    <br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Alternatives: </strong> 
    On the top panel bar, to the extreme right is the 'Show Alternatives'
    button. It is a toggle which is used to show and hide alternatives. 
    The screen would then divide into two halves. On the left you will
    see the main options. On clicking on any of the main options, you 
    will see the alternatives to that option on the panel on the right, 
    keeping the same travel modes during the option. The maximum number 
    of alternatives displayed would be 10.<br></br>
  </p><br></br>
</div>
