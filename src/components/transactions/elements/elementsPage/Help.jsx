import React from 'react';

export const formHelp = 
null;

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>Element Costs: </strong> 
    Element costs are special costs for an element (Accommodation, Services, 
    Transport, Tickets & Packages) as quoted to the Riksja Network. The Riksja
    Network comprises of 'Riksja Travel', 'Rickshaw Travel Ltd' and 
    'Erlebe Fernreisen GmbH'
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Wef: </strong> 
    These quotations are valid for a year beginning on Oct 1 of each year
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Element Type: </strong> 
    The Element Types could be Accommodation, Sightseeing, Transfers, Transport 
    ... Changing to a different Element Type in the drop down will display the 
    corresponding data<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Importing Elements: </strong> 
    Click on Actions for the Period and then Import Elements.<br></br>
    Select the currency (default Euro). The Exchange Rate is updated from Masters/
    Exchange Rates. Choose the wef. For Accommodation, Sightseeing, Transfers &
    Cars, the wef refers to the 'wef' in the costings from which you want to 
    compute the element costs. But for the 'Extra Day Car Hire' the 'wef' refers 
    to the previous element year costing from where you wish to copy the data, 
    which will typically be the previous year. <br></br>
    If you had already imported data for this wef, the current data will not be 
    updated, only new data will be added. Click on the button to import the 
    elements. To close the import session, click on the 'Back to Elements' button. 
    Each of these costing elements can be further edited.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>How are the costs computed?: </strong><br></br>
    <b>Accommodation - </b>This is the Accommodation Costing Report (with margin)<br></br>
    <b>Services - </b>This is the Services Costing Report (with margin)<br></br>
    <b>Car Per Km - </b>This is the Per Km Car Costing Report (with margin)
    But this report gives a general per km cost for the car. To obtain the 
    sectors and the kms between the sectors, the modules created in Presto - 
    Riksja are filtered. From these modules only the Per Km Drives are selected. 
    For each of these drives the cost is computed based on the costing sheet.<br></br>
    <b>Car Intercity (P2P) - </b>This is the Point to Point Costing Report (with margin)<br></br>
    <b>Car City Group - </b>This is the City Group Costing Report (with margin)<br></br>
    <b>Trains - </b>The list of trains and the sectors are chosen from 
    Elements - Trains to Import. <br></br>
    The costing is computed for these trains. The costs 
    for classes CC, 2A & 3A are picked up from here. The ECC & 1A have to be 
    entered manually<br></br>
    <b>Packages - </b>The Package Element costs at the moment can be entered manually<br></br>
    <b>Extra Day Car Hire - </b>This data is picked up from the previous year's 
    element costing<br></br>
    Each of the costing is the Supplier Invoice + Odyssey margin + Tour Operator GST.
    Each element costing is also broken down into a 1-10 pax cost, which is 
    the cost per pax, if there was 1 pax, or were more than one pax and upto 10 
    pax. This is visible when you edit the element costing.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Adding New Costs: </strong> 
    For some element types, you can manually add an element cost by clickig on the 
    '+' sign. This is available only for some elements though.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Editing a Cost: </strong> 
    For an element type, hightlight the row that you wish to edit and 
    click on the 'Edit' icon on the far right of the row.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Deleting a Single Element Cost: </strong> 
    For some element type, hightlight the row that you wish to delete and 
    click on the 'Delete' icon on the far right of the row. By default it will 
    not be visible, and you will have to use the horizontal 
    scrollbar below the data grid to make it visible<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Deleting Elements: </strong> 
    Click on Actions for the Period and then Delete Elements.<br></br>
    Choose the wef for which you want to delete the data. All the data for 
    the selected 'Element Type' and wef will be deleted. 
    Click on the button to delete the elements. To close the import session, 
    click on the 'x' button.<br></br>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Marking as Quoted: </strong> 
    For elements that were quoted to the Riksja Network, you can right click 
    on the row and flag it as quoted. To undo the change, you can right click 
    on a quoted row and flag it as unquoted. The quoted 
    elements will show in a different color. To display only
    quoted elements, toggle the switch on the top with the 
    caption 'Only Quoted'. <br></br>
  </p><br></br>
</div>
