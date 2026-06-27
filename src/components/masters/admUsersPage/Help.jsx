import React from 'react';

export const formHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>Users: </strong> 
    Enter the user data
  </p><br></br>
</div>

export const mainFormHelp = 
<div style={{fontFamily: 'Lato', fontSize: 20, background: '#f5f5f0'}}>
  <p style={{display: 'inline-block'}}><strong>Users: </strong> 
    Enter the users along with the relevant data
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Active: </strong> 
    The Active toggle can be used to show active users or all users.
    Inactive users wll be shown in red.
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>User Permissions: </strong> 
    Select a user and then click on the button on the top panel, which 
    says 'modify permission'.<br/>
    Select a module and right click to set the permission <br/>
    If you want to copy the same permissions as another user, click
    on the button which says 'Copy Permissions' and select from 
    which user you want to copy the permissions from. The 
    permissions will then ber overwritten<br/>
  </p><br></br>
  <p style={{display: 'inline-block'}}><strong>Reset Password: </strong> 
    Select a user and then click on the button on the top panel, which 
    says 'Reset Password'.<br/>
    The password is set back to the user name <br/>
    This has to be exercised when a user had forgotten a password 
    and cannot login <br/>
    The user can then login and go to Admin / Change Password to 
    enter a new password, if desired<br/>
  </p><br></br>
</div>
