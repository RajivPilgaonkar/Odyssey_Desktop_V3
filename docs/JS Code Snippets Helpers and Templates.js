/*=== Errors in Main Form ===*/
/*=== Delay Error closing by 5 seconds ===*/
this.setState({mainFormErrorMessage: 'Cannot delete a Group with linked items'}, async () => {
  await waitFor(5000);
  this.setState({mainFormErrorMessage:''});
});    

/*=== And then in Render ===*/
{ this.state.mainFormErrorMessage > '' &&        
  <div style={popupTitleContainerStyle}>
    {this.state.mainFormErrorMessage}
  </div>  
}

//=======================================================================================================================

// escape any single quotes in the text strings
tourLeader = tourLeader.replace(/'/g, "''").substring(0,49);

//=======================================================================================================================

/*=========================*/
/*=== Date Manipulation ===*/
/*=========================*/

/*=== For any date retrieved for the database ===*/
rec.ETA.replace('T', ' ').replace('Z', ''),


//=======================================================================================================================

/*=========================*/
/*=== Arrays of Objects ===*/
/*=========================*/

/*=== Max Value of a property ===*/
const maxMainOrderNo = Math.max(...this.var.mainData.map(rec => rec.MainOrderNo));

/*=== Change a property in an array of objects ===*/
arrayData = arrayData.map(rec => ({...rec, City: rec.City + " (" + rec.DefaultDays.toString() + ")"}));

/*=== In one array but not in the other, based on a comparison of a property QuoCities_id ===*/
const addedCities = newData.filter(({ QuoCities_id: id1 }) => !this.var.mainData.some(({ QuoCities_id: id2 }) => id2 === id1));

//=======================================================================================================================
	
		/*=== forEach has a problem with async operations inside, use foe of loops instead ===*/

		/*=== data is the array of objects. entries() is a standard method of data ===*/
    for (const [index, record] of data.entries()) {




//=======================================================================================================================

/*==========================*/
/*=== List in DevExtreme ===*/
/*==========================*/
scrolling to an active list item -- refer to PrestoReorderCities.js
