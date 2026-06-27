## Troubleshooting

1. **`REDUX`**
* If you find some problems with the store data, clear the browsing cache in the browser
* Or open in igcognito and try it  

2. **`asynchronous`**
* Check if a certain code is designed to work asynchronously, but is executing synchronously

3. **`case sensitive fields in code`**
* When designing forms, make sure that the form field names are case sensitive and in line with the field names in the SQL table
* use sp_help table_name to obtain the exact field names.

4. **`Reference forms`**
* Use `cities` as a reference master form
* Use `carPerKm` as a reference panel master-detail form

5. **`Date shows 1 day less (in drop down selections -- wef)`**
* In Windows, set the timezone to `Kolkota`
* In the javascript code, change moment().format() to moment().utc().format()
