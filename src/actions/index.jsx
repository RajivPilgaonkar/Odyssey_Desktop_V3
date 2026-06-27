import axios from 'axios';
import { DB_GET_USER_ID, DB_SET_USER_ID, FETCH_COMPANY_DATA,
         SET_WEBPAGE, GET_WEBPAGE, DB_GET_CURRENCIES,
         GET_DASHBOARDMENUOPTIONS, SET_DASHBOARDMENUOPTIONS,
         DB_GET_COUNTRIES, GET_INITVALUES,
         SET_INITVALUES_PACKAGES, SET_INITVALUES_CITIES,
         SET_PARAM_VALUES, SET_INVOICE_VALUES, SET_VOUCHER_VALUES,
         SET_ELEMENT_VALUES, SET_ROUTEFINDER_VALUES, SET_MODULE_VALUES,
         SET_PRESTO_VALUES, SET_CONFIRMATION_VALUES} 
         from './types';
import {http_prefix} from '../config/paths';

// Without this the app may not work in production mode
//axios.defaults.baseURL = (process.env.NODE_ENV === 'production') ? 'http://localhost:5100' : 'http://localhost:5100';
axios.defaults.baseURL = http_prefix;
         
// Get user id
export const dbGetUserId = (username,pwd) => async dispatch => {

  await axios.get('/db/getUserId/' + username + '/' + pwd)
  .then((res) => {
console.log('actions....',username,pwd,res.data);    
    dispatch({ type: DB_GET_USER_ID, payload: res.data });
  })
  .catch((err) => {
    console.log(err.response.data);
  })

};

// Get master data
export const dbGetCurrencies = () => async dispatch => {

  await axios.get('/db/getCurrencies')
  .then((res) => {
    dispatch({ type: DB_GET_CURRENCIES, payload: res.data });
  })
  .catch((err) => {
    console.log(err.response.data);
  })

};

// Get master data
export const dbGetCountries = () => async dispatch => {

  await axios.get('/db/getCountries')
  .then((res) => {
    dispatch({ type: DB_GET_COUNTRIES, payload: res.data });
  })
  .catch((err) => {
    console.log(err.response.data);
  })

};

// Execute Stored Procedure
export const dbExecuteSp = async (data) => {

  // for some reason, this does not return the data with async/await
  // ... so a promise based function has been used
/*  
  return new Promise(function (resolve, reject) {
    axios.post('/db/executeSP',data).then(
        (response) => {
            var result = response.data;
            console.log('resolved', result);            
            resolve(result);
        },
            (error) => {
              console.log('rejected', error);            
              alert(error);
              reject(error);
          }
    );
  });
*/

  try {
    const res = await axios.post('/db/executeSP',data);
    return res.data;
  } catch (err) {
    console.log("Error executing SP**:" + data.sql);  
    throw new Error('There was a problem in executing this stored procedure');
    //return {error: "Error in executing this stored procedure " + data.sql};
  }


};


// Get Records
export const dbDoesExist = async (data) => {

  // for some reason, this does not return the data with async/await
  // ... so a promise based function has been used
  return new Promise(function (resolve, reject) {
    axios.post('/db/doesExist',data).then(
        (response) => {
            var result = response.data;
            resolve(result.x_count);
        },
            (error) => {
            reject(error);
        }
    );
  });

};


// Get Records
export const dbGetRecord = async (data) => {

  // for some reason, this does not return the data with async/await
  // ... so a promise based function has been used

/*
  return new Promise(function (resolve, reject) {
    axios.post('/db/getRecord2',data).then(
        (response) => {
            var result = response.data;
            resolve(result);
        },
            (error) => {
            reject(error);
        }
    );
  });
*/

  /*=== *** for production version, try using the axios baseURL as described above ===*/
  try {
    const res = await axios.post('/db/getRecord',data);
    return res.data;
  } catch (err) {
    printErrorMessage (err, data);
    throw new Error('There was a problem in getting the record');
  }

};

// Get Records Raw Query
export const dbGetRecordRaw = async (data) => {

  /*=== *** for production version, try using the axios baseURL as described above ===*/
  try {
    const res = await axios.post('/db/getRecordRaw',data);
    return res.data;
  } catch (err) {
    printErrorMessage (err, data);
    throw new Error('There was a problem in getting the record');
  }

};


// Post Record
export const dbUpdateRecord = async (data) => {

  // for some reason, this does not return the data with async/await
  // ... so a promise based function has been used
  return new Promise(function (resolve, reject) {
    axios.post('/db/updateRecord',data).then(
        (response) => {
            var result = response.data;
            resolve(result.success);
        },
            (error) => {
            reject(error);
        }
    );
  });

};




// Insert record
export const dbInsertRecord = async (data) => {

  // for some reason, this does not return the data with async/await
  // ... so a promise based function has been used
  return new Promise(function (resolve, reject) {
    axios.post('/db/insertRecord',data).then(
        (response) => {
            var result = response.data;
            resolve(result.success);
        },
            (error) => {
            reject(error);
        }
    );
  });

};

// Delete record
export const dbDeleteRecord = async (data) => {

  // for some reason, this does not return the data with async/await
  // ... so a promise based function has been used
  return new Promise(function (resolve, reject) {
    axios.post('/db/deleteRecord',data).then(
        (response) => {
            var result = response.data;
            resolve(result.success);
        },
            (error) => {
            reject(error);
        }
    );
  });

};


// Get master data
export const dbGetNextId = async (tableName, fieldName) => {

  // for some reason, this does not return the data with async/await
  // ... so a promise based function has been used
  return new Promise(function (resolve, reject) {
    axios.get("/db/getNextId/"+ tableName + "/" + fieldName).then(
        (response) => {
            var result = response.data;
            resolve(result.maxId);
        },
            (error) => {
            reject(error);
        }
    );
  });

};

export const authVerifyToken = async (data) => {

  /*=== *** for production version, try using the axios baseURL as described above ===*/

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + data.accessToken
  }

  try {
    const res = await axios.post('/auth/verifyToken',{}, {headers: headers});
    return res.data;
  } catch (err) {
    printErrorMessage (err, data);
    throw new Error('There was a problem in getting the record');
  }

};

export const generateToken = async (data) => {

  /*=== *** for production version, try using the axios baseURL as described above ===*/

  try {
    const res = await axios.post('/auth/generateToken',data);
    return res.data;
  } catch (err) {
    printErrorMessage (err, data);
    throw new Error('There was a problem in generating a token');
  }

};


// VoucherReports
export const dbVoucherReports = async (dataObj) => {

  let res;

  /*=== *** for production version, try using the axios baseURL as described above ===*/
  try {
    if (dataObj.data.reportType === 5 || dataObj.data.reportType === 6) {
      res = await axios.post('/reports/vouchers/voucherServices', dataObj, {responseType: 'blob'});
    } else {
      res = await axios.post('/reports/vouchers', dataObj, {responseType: 'blob'});
    }

    if (res.data.success === undefined) {
    
      // res could contain a pdf or a simple object ... pdf will be application/pdf
      if (res.data.type !== 'application/json') {
        // This downloads the file into the Downloads folder        
        downloadPdf (res.data, dataObj.data.fileName, dataObj.data.openReport);
      }
      return {error: null, pdfBlob: res.data};
    } else {
      return {error: 'Error creating / getting Pdf file', pdfBlob: null};
    }
  } catch (err) {
    console.log("Error getting record:", err);
    return {error: 'Error creating / getting Pdf file', pdfBlob: null};
  }

};

// Presto Reports
export const dbVoucherNewReports = async (dataObj) => {

  /*=== *** for production version, try using the axios baseURL as described above ===*/
  try {
    const res = await axios.post(dataObj.data.reportEndPoint, dataObj, {responseType: 'blob'});

    if (res.data.success === undefined) {
    
      // res could contain a pdf or a simple object ... pdf will be application/pdf
      if (res.data.type !== 'application/json') {
        // This downloads the file into the Downloads folder
        downloadPdf (res.data, dataObj.data.fileName, dataObj.data.openReport);      
        return {error: null, pdfBlob: res.data};
    
      } 
      return {error: null, pdfBlob: res.data};
    } else {
      return {error: 'Error creating / getting Pdf file', pdfBlob: null};
    }
  } catch (err) {
    console.log("Error getting record:", err);
    return {error: 'Error creating / getting Pdf file', pdfBlob: null};
  }

};



// Presto Reports
export const dbPrestoReports = async (dataObj) => {

  /*=== *** for production version, try using the axios baseURL as described above ===*/
  try {
    const res = await axios.post(dataObj.data.reportEndPoint, dataObj, {responseType: 'blob'});

    if (res.data.success === undefined) {

      // res could contain a pdf or a simple object ... pdf will be application/pdf
      if (res.data.type !== 'application/json') {
        // This downloads the file into the Downloads folder
        downloadPdf (res.data, dataObj.data.fileName, dataObj.data.openReport);
        return {error: null, pdfBlob: res.data};
      } else {
        return {error: 'Error creating / getting Pdf file', pdfBlob: null};
      }
    } else {
      return {error: 'Error creating / getting Pdf file', pdfBlob: null};
    }
  } catch (err) {
    console.log("Error getting record:", err);
    return {error: 'Error creating / getting Pdf file', pdfBlob: null};
  }

};


// Presto Reports DocX
export const dbPrestoDocxReports = async (dataObj) => {

  /*=== *** for production version, try using the axios baseURL as described above ===*/
  try {
    const res = await axios.post(dataObj.data.reportEndPoint, dataObj, {responseType: 'blob'});

    if (res.data.success === undefined) {
      
      // res could contain a pdf or a simple object ... pdf will be application/pdf
      if (res.data.type !== 'application/json') {
        // This downloads the file into the Downloads folder
        downloadPdf (res.data, dataObj.data.fileName, dataObj.data.openReport);
      } else {
        downloadDocx (res.data, dataObj.data.fileName, dataObj.data.openReport);
      }
      return {error: null, pdfBlob: res.data};
    } else {
      return {error: 'Error creating / getting Pdf file', pdfBlob: null};
    }
  } catch (err) {
    console.log("Error getting record:", err);
    return {error: 'Error creating / getting Pdf file', pdfBlob: null};
  }

};


// VoucherReports
export const sendMail = async (data) => {

  // for some reason, this does not return the data with async/await
  // ... so a promise based function has been used
  return new Promise(function (resolve, reject) {
    axios.post('/mail/sendMail',data).then(
        (response) => {
            var result = response.data;
            resolve({success: result.success});
        },
            (error) => {
            reject(error);
        }
    );
  });

};


// downloadDocx
export const downloadDocx = (docxData, fileName, openReport) => {

  var url = window.URL.createObjectURL(docxData);
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  a.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 100);

  if (openReport) {
      //This code opens the file
      window.open(URL.createObjectURL(docxData));
  }

}


// downloadPdf
export const downloadPdf = (pdfData, fileName, openReport) => {

  var url = window.URL.createObjectURL(pdfData);
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  a.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);

  if (openReport) {
      //This code opens the file
      window.open(URL.createObjectURL(pdfData));
  }

}

// Set WebPage
export const setWebPage = (webPages_id) => dispatch => {
  return dispatch({ type: SET_WEBPAGE, payload: webPages_id });
};

// Get WebPage
export const getWebPage = () => dispatch => {
  dispatch({ type: GET_WEBPAGE });
};

// Get Init Values
export const getInitValues = () => dispatch => {
  dispatch({ type: GET_INITVALUES });
};

// Set Init Values for Packages
export const setInitValuesPackages = (packages_id) => dispatch => {
  dispatch({ type: SET_INITVALUES_PACKAGES, payload: packages_id });
};

// Set Init Values for Cities
export const setInitValuesCities = (cities_id) => dispatch => {
  dispatch({ type: SET_INITVALUES_CITIES, payload: cities_id });
};

// Set Dashboard Menu Options
export const setDashboardMenuOptions = (menu_id,subMenu_id) => dispatch => {
  dispatch({ type: SET_DASHBOARDMENUOPTIONS, payload: {mainMenu: menu_id, subMenu: subMenu_id} });
};

// Get Dashboard Menu Options
export const getDashboardMenuOptions = () => dispatch => {
  dispatch({ type: GET_DASHBOARDMENUOPTIONS });
};

// Get default Company Data
export const fetchCompanyData = () => dispatch => {
  const data = {address: '286, Boa Viagem Road, Calangute, Goa 40300',
                email: 'res@odyssey.co.in',
                phone: '(91) 832-2277720'};

  dispatch({ type: FETCH_COMPANY_DATA, payload: data });
};


// Set Parameters used in form headers for filtering
export const setParamValues = (paramsObj) => (dispatch) => {
  dispatch({ type: SET_PARAM_VALUES, payload: paramsObj });
};

// Set Parameters used in form headers for filtering in invoices
export const setInvoiceParamValues = (invoiceParamsObj) => (dispatch) => {
  dispatch({ type: SET_INVOICE_VALUES, payload: invoiceParamsObj });
};

// Set Parameters used in form headers for filtering in vouchers
export const setVoucherParamValues = (voucherParamsObj) => (dispatch) => {
  dispatch({ type: SET_VOUCHER_VALUES, payload: voucherParamsObj });
};

// Set Parameters used in form headers for filtering in vouchers
export const setElementParamValues = (elementParamsObj) => (dispatch) => {
  dispatch({ type: SET_ELEMENT_VALUES, payload: elementParamsObj });
};

// Set Parameters used in form headers for filtering in the route finder
export const setRouteFinderParamValues = (routeFinderParamsObj) => (dispatch) => {
  dispatch({ type: SET_ROUTEFINDER_VALUES, payload: routeFinderParamsObj });
};

// Set Parameters used in form headers for filtering in vouchers
export const setModuleParamValues = (moduleParamsObj) => (dispatch) => {
  dispatch({ type: SET_MODULE_VALUES, payload: moduleParamsObj });
};

// Set Parameters used in form headers for filtering in vouchers
export const setPrestoParamValues = (prestoParamsObj) => (dispatch) => {
  dispatch({ type: SET_PRESTO_VALUES, payload: prestoParamsObj });
};

// Set Parameters used in form headers for filtering in Confirmations
export const setConfirmationParamValues = (confirmationParamsObj) => (dispatch) => {
  dispatch({ type: SET_CONFIRMATION_VALUES, payload: confirmationParamsObj });
};

// Set User_id
export const setUserValues = (userObj) => (dispatch) => {
  dispatch({ type: DB_SET_USER_ID, payload: userObj });
};

// Error Message
const printErrorMessage = (err, data) => {
  console.log('================================');
  console.log('data',data);
  if (err.message !== undefined || err.message !== null) {
    console.log('err',err.message);
  } else {
    console.log("Error getting record:", err);
  }
  console.log('================================');

}