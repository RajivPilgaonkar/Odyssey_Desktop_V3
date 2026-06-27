import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
//import { loadState, saveState } from './components/common/LocalStorage';
//import throttle from 'lodash/throttle';
/*import logger from 'redux-logger';*/
import {persistStore, persistReducer, PERSIST} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';

import App from './components/App';
//import reducers from './reducers';

import rootReducer from './reducers';

// always place logger at the end, ... the last middleware
//const store = createStore(reducers, persistedState, applyMiddleware(reduxThunk/*, logger*/));

// save to local store every 100 seconds.
// If you don't do this, everytime you refresh a page, the redux store will be blank

/*
store.subscribe(throttle(() => {
  saveState(store.getState());
},1000000));

ReactDOM.render (
  <Provider store={store}><App /></Provider>,
  document.querySelector('#root')
);
*/

const persistConfig = {
  key: 'persist-key',
  storage
}

const persistedReducer = persistReducer(persistConfig, 
  rootReducer);

const store = configureStore(
  {reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {ignoredActions: [PERSIST]},
      }),
  }
);

//let store = createStore(persistedReducer);
let persistor = persistStore(store);


const root = ReactDOM.createRoot(document.querySelector('#root'));

root.render (
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
