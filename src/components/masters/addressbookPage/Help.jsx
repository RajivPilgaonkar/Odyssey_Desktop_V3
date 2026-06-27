import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Contacts: </strong> 
  Click on the 'Contacts' button in the top panel. Click the '+' 
  button to add new contacts. You can search the addressbook based 
  on the contacts as well.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Sub-Categories: </strong> 
  Click on the 'Categories' button in the top panel . Click the 
  'Edit SubCategories' button to categorize the addressbook entry. 
  The sub-catgories list will be based on the categories entered. 
  Tick the categories related to the entry and click on 'Save'. 
  You can search the addressbook based on the sub-categories. <br/>
  This is based on Masters / General / Categories
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Services: </strong> 
  Click on the 'Categories' button in the top panel. Click the 
  'Services' button to specify services provided by this addressbook 
  entry. The services list will be based on the sub-categories 
  entered. Tick the services related to the entry and click on 'Save'. 
  You can search the addressbook based on the services. <br/>
  This is based on Masters / General / Categories
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Search Tags: </strong> 
  Click on the 'Search Tags' button on the top panel. Click the 
  'Search Tags' button to specify search tags for this addressbook 
  entry.  <br/>
  This is based on Masters / General / Search Tags
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Hotel Info: </strong> 
  Click on the 'Hotel Info' button on the panel. Enter the hotel 
  description, Check In, Check Out timings and a few other highlights 
  of the hotel.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Accounts: </strong> 
  In the 'Addn. Details' form, tick the 'Combined Vouchers' if you 
  want the vouchers for a tour clubbed together for that agent as 
  the agent creates a single bill for all the services provided for 
  that tour. When importing the data into Tally, the vouchers for 
  the tour are combined into a single entry.
</p><br></br>
</div>

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
<p style={{display: 'inline-block'}}><strong>Contacts: </strong> 
  The list of entries from the addressbook, for which a category 
  has been entered. By default, only 'active' entries are displayed
  If the 'Active' toggle is moved to the right, both 'Active' and 
  'Inactive' entries will be displayed, with the incative entries 
  displayed in red. This column can be used to filter 'Active' and 
  'Inactive' entries. <br/>
  Entries for which the Category is not mentioned, will be categorised 
  as 'Non-Coded'. Changing the 'Coded' switch will toggle between
  'Coded' and 'Uncoded' entries.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Searching for an entry: </strong> 
  You could also search for an addressbook entry by typing into the 
  'Name' column.
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Filtering: </strong> 
  For the City, State, Country and Category columns, the filtering 
  can be done by the dropdown selection under the column name. To 
  clear the filter, the entry can be reset to '(All)'<br/>
  The state column has an additional filter icon, which provides 
  filtering of multiple states. <br/>
  Additionally, filtering can be narrowed down by typing into the 
  search boxes under the columns 'Sub-Category', 'Services', 
  'Search Tags' and 'Contacts'. To clear the filter, clear the 
  text enteredin the search box. 
</p><br></br>
<p style={{display: 'inline-block'}}><strong>Adding an entry: </strong> 
  To add a new entry, click on the 'Add' button.
</p><br></br>
</div>
