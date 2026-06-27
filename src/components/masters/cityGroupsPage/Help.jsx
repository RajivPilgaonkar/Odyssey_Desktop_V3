import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>City Groups: </strong> 
    By Default only 'Active' Agents will be displayed<br/>
    The Agents are picked up from the Addressbook where the Service 'City Groups' is tagged<br/>
    By default, this picks up only active Addressbook entries<br/>
    If the 'Active' Agents toggle is turned off, all Agents 
    with 'City Groups', whether active on inactive will be displayed<br/>
  </p><br/>
  <p style={{display: 'inline-block'}}><strong>List of Cities: </strong>
    As you modify / delete the list of cities or nights, you will 
    see the corresponding effect in the City Group label 
    automatically<br/>
    Only cities which are part of the distances table, will be displayed
    in the drop down.<br/>
  </p><br/>
</div>

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>City Groups: </strong> 
     Enter a City Group
  </p><br/>
  <p style={{display: 'inline-block'}}><strong>Active / Inactive City Groups: </strong>
    Enter a Default Agent for the City Group<br/> 
    By Default only 'Active' Groups will be displayed<br/>
    If the 'Active' toggle is turned off, all City Groups will be 
    displayed, that is active and inactive<br/>
    To mark a City Group as 'Inactive', edit it and in the form untick 'Active' and Save<br/>
  </p><br/>
  <p style={{display: 'inline-block'}}><strong>List of Cities: </strong> 
    When you edit a City Group, you will see the city group details
    on the left, and the list of cities on the right<br/>
    As you modify / delete the list of cities or nights, you will 
    see the corresponding effect in the City Group label 
    automatically.<br/>
    Only cities which are part of the distances table, will be displayed
    in the drop down.<br/>
  </p><br/>
  <p style={{display: 'inline-block'}}><strong>City Groups: </strong> 
    When a city group is edited, by default only 'Active' Agents will be displayed<br/>
    The Agents are picked up from the Addressbook where the Service 'City Groups' is tagged<br/>
    By default, this picks up only active Addressbook entries<br/>
    If the 'Active' Agents toggle is turned off, all Agents 
    with 'City Groups', whether active on inactive will be displayed<br/>
  </p><br/>
</div>
