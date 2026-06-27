import React from 'react';
import { convertDMY_MDY, dateDiff, dateFormat  } from "../../../common/CommonTransactionFunctions";

import './RouteFinder.css'

  //**********************************************************/
  export const additionalData = async (compVar) => {

    compVar.mainData.map(rec => {
      rec.Timing = dateFormat (rec.Departure, null, 'HH:mm') + '/' + dateFormat (rec.Arrival, null, 'HH:mm');
      return rec;
    });

    const startDate = convertDMY_MDY (compVar.wef);

    compVar.mainData.map(rec => {   
      rec.Days = dateDiff(rec.Arrival, startDate, 'days');
      return rec;
    });

  }

  //**********************************************************/
  export const setGroupDuration = async(compVar) => {

    // get unique option numbers 
    compVar.uniqueOptionsData = [...new Set(compVar.mainData.map(item => item.OptionNo))]; 

    // set duration in days, hrs, min for each option
    compVar.uniqueOptionsData.forEach(rec => {
      const optionData = compVar.mainData.filter(item => item.OptionNo === rec);
      const departure = optionData[0].Departure;
      const arrival = optionData[optionData.length-1].Arrival;
      const durationMin = dateDiff (arrival, departure, 'minutes');
      const durationHrs = Math.floor(durationMin/60);
      const durationDays = Math.floor(durationHrs/24);

      const hours = durationHrs - (durationDays*24);
      const minutes = durationMin - (durationDays*24*60) - (durationHrs*60);

      let groupDuration = '';
      if (durationDays > 0) {
        groupDuration += (durationDays === 1) ? '1 day ' : durationDays.toString() + ' days ';
      }
      if (hours > 0) {
        groupDuration += (hours === 1) ? '1 hr ' : hours.toString() + ' hrs ';
      }
      if (minutes > 0) {
        groupDuration += (minutes === 1) ? '1 min ' : minutes.toString() + ' min ';
      }

      compVar.mainData.map(item => {
        if (item.OptionNo === rec) {
          item.GroupDuration = groupDuration.trim();
        }
        return item;
      })

    });

    compVar.optionsData = [];
    for (const rec of compVar.uniqueOptionsData) {
      const data = compVar.mainData.filter(elem => elem.OptionNo === rec);
      compVar.optionsData.push({optionNo: rec, data: data});
    }
       
  }


  //**********************************************************/
  export const getOptionsJsx = (e, compVar, type, index) => {

    const backgroundColor = (e.data[0].OptionNo === compVar.selectedOptionNo) ? '#d6f5d6' : '#f5f5f0';

    const width = (compVar.displayAlternatives) ? 600 : 800;

    const fontSize1 = (type === 1) ? 18: 14;
    const fontSize2 = (type === 1) ? 16: 12;

    const optionStr = (type === 1) ? "Option " + e.optionNo.toString() : "Alternative " + (index+1).toString();

    return (

      <div className="main-options-container">

        <div className="main-options-container-box" style={{width: width, backgroundColor: backgroundColor}}>

          <div className="main-options-grouptext-container">
            <div style={{fontSize: fontSize1, paddingLeft: 10, fontWeight: 700}}>
              {optionStr}
            </div>
            <div style={{fontSize: fontSize2, paddingLeft: 10}}>
              ({e.data[0].GroupDuration})
            </div>
          </div>

          { e.data.map((rec) => {

            let timing = rec.Timing;

            let color = 'black';
            if (rec.Days > 0) {
              timing += ' (+' + rec.Days.toString() + ')';
              color ='blue';
            }

            return (
              <div key={rec.Options_id} style={{display: 'flex', flexDirection: 'row', width: '100%', height: '100%', fontSize: fontSize2, color: color}}>
                <div style={{display: 'flex', flex: 2, paddingLeft: 10}}>
                  {rec.FromCity} to {rec.ToCity}
                </div>
                <div style={{display: 'flex', flex: 1}}>
                  {rec.ModeStr}
                </div>
                <div style={{display: 'flex', flex: 2}}>
                  {rec.ModeNo}
                </div>
                <div style={{display: 'flex', flex: 1}}>
                  {timing}
                </div>
              </div>
            )
           
          })}  
    
        </div>
      </div>

    );

  }
