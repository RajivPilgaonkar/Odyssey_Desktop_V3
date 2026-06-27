## Handling Dates

1. **`Be VERY CAREFUL in using this library`**
* All moments are mutable.
* This means that operations like add, subtract, or set change the original moment object.  
**Ex.**  
var a = moment('2016-01-01');  
var b = a.add(1, 'week');  
a.format();  
"2016-01-08T00:00:00-06:00"  


2. **`Javascript Date Object`**
* const d = new Date('11/24/2020');
* const d = new Date(year, month, day, hour, min, sec, ms);
* displays as `Wed Nov 24 2021 00:00:00 GMT+0530 (India Standard Time)`

3. **`Using the moment library`** **`1`**
* const d = moment('24/11/2020','DD/MM/YYYY').toDate();
* This converts a DD/MM/YYYY string into a JS date object
* Typeof d will be `object`
* d1 = d.toString() will convert this into a string
* Typeof d1 will be `string`

4. **`Using the moment library`** **`2`**
* const d = moment('11/24/2020','MM/DD/YYYY').toDate();
* This converts a MM/DD/YYYY string into a JS date object

5. **`Using the moment library`** **`3`**
* const d = moment(jsDate).format('DD/MM/YYYY');
* This converts a JS date object into a string of type DD/MM/YYYY

6. **`Using the moment library`** **`4`**
* const d = moment(jsDate).format('MM/DD/YYYY');
* This converts a JS date object into a string of type MM/DD/YYYY

7. **`Using the moment library`** **`5`**
* let xDate be the date obtained from a database query through dbGetRecord
* Since this data is obtained in JSON, and JSON does not have 
  a date structure, this is returned in the query as a string.
* This string is of format `2022-11-01T00:00:00.000Z`. The 'Z'   at the end adds 5:30 hours to the date, so you have to be careful. Even a moment convsersion will add it.   
* So manipulate the string by remove the 'Z' at the end, and 
  that will set the date back to the local time. 
* const d = moment(new Date(xDateWithoutTrailingZ)).format('MM/DD/YYYY');
* This converts the string --> into a JS date object --> into a string of type MM/DD/YYYY

8. **`Using the moment library for date comparisons`** **`6`**
* if moment(jsDate1) > moment(jsDate2)
* Converts both dates into a moment object and compares

9. **`Using the moment library for date comparisons`** **`7`**
* if moment(jsDate1).format('DD/MM/YYYY') > moment(jsDate2).format('DD/MM/YYYY')
* Converts both dates into strings of the same format and compares

10. **`Using time elapsed`**
* const d = new Date('11/24/2020');
* d.getTime() gets the number of milliseconds elapsed since Jan 1, 1970
* This number can also be accurately used to compare dates. 
* The 2 timestamps below will yield different results. The one with the 'Z' will assume it is the GMT time and will add 05:30 to the date. 
* new Date('2022-09-30T00:00:00').getTime(); 
* new Date('2022-09-30T00:00:00Z').getTime();    

11. **`ISO string`**
* const event = new Date('30 September 2020 14:48 UTC');
* console.log(event.toString());
* Output in India: Wed Sep 30 2020 20:18:00 GMT+0530 (India Standard Time)
* (note: your timezone may vary)

* console.log(event.toISOString());
* Output: 2020-09-30T14:48:00.000Z
* Now use string parsing to get date and time
