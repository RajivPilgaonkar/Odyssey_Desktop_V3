## Debugging Code

1. **`useState`** 
* Set if you want a render on changing this

```javascript
    import React, { useState } from 'react';

    const [renderToggle, setRenderToggle] = useState(false);  
    const [initDataFetched, setInitDataFetched] = useState(false);  

    // This is the preferred method of updating a state variable ...
    // ... as it would have a new value if a successive call is made
    setRenderToggle(renderToggle => {return !renderToggle});

    // You could update it this way as well, but ...
    // ... if you call this function successively, the value of x
    // ... will not change until the render takes place, ...
    // ... which is not guaranteed after the 1st call
    let x = setInitDataFetched(true);
    x = setInitDataFetched(true);

```

2. **`useEffect`** 
* If you want a certain piece of code to run when a state / variable is changed

```javascript
    import React, { useEffect } from 'react';
    
    // This will execute just once and not on every render
    // Ensure that 2nd argument is []
    // This is called once when the component mounts
    useEffect (() => {
        
      fetchInitialData();
      filterData();

      // This is called once when the component un-mounts (cleanup)
      // Perform any cleanup tasks here, such as clearing timers or subscriptions
      return () => {
      };
    }, []);


    // This will execute when errorMsg changes
    // Ensure that 2nd argument is [errorMsg]
    // After 5 sec, the error message is auto-closed
    useEffect (() => {
      if (compVar.errorMsg > '') {
        setTimeout(() => {
          compVar.errorMsg = '';
          forceRender();
        }, 5000)
      }

      // This is called once when the component un-mounts (cleanup)
      // Perform any cleanup tasks here, such as clearing timers or subscriptions
      return () => {
      };

    }, [errorMsg]);

```
