## Create an object for each database field

1. **`key:`** **`integer`**
* Unique
* Next serial number

2. **`label:`** **`string`**
* Field label in Grid Column

3. **`longLabel:`** **`string`** **`(OPTIONAL)`**
* Form Label
* Only required when form label is different from the grid column label

4. **`field:`** **`string`**
* Field as in database, case sensitive
* Field list can be obtained by sp_help <tableName> on SQL Server

5. **`width:`** **`integer`**
* Width of the grid column

6. **`align:`** **`string`**
* Alignment ('left', 'right', 'center')

7. **`dataType:`** **`string`**
* 'number', 'string', 'boolean', 'date', 'emptyItem'
* 'emptyItem' is a speial entry when you need spaces between fields in a form
*  Sample {key: 201, label: "EmptyItem", field: 'EmptyItem',width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false}  


8. **`visible:`** **`boolean`**
* Whether the field is visible in the grid columns

9. **`visibleInForm:`** **`boolean`**
* Whether the field is visible in the form

10. **`isLookup:`** **`boolean`**
* Whether the field is a lookup (will have a dropdown)

11. **`groupNo:`** **`integer`**
* Used for grouping fields in the form 

12. **`default:`** **`any`** **`(OPTIONAL)`**
* Specify default value on adding new record 

13. **`required:`** **`boolean`** **`(OPTIONAL)`**
* Defaults to false
* Whether the field has to be entered in the form

14. **`colSpan:`** **`integer`** **`(OPTIONAL)`**
* The span this field extends to in the form
* Defaults to 1

15. **`editorType:`** **`string`** **`(OPTIONAL)`**
* If dataType = 'number', then editorType defaults to 'dxNumberBox'
* If dataType = 'date', then editorType defaults to 'dxDateBox'
* If datatype = 'boolean', then editorType defaults to 'dxCheckBox'
* Set editorType to override this, for example 'dxTextArea' for large fields

16. **`allowFilter:`** **`boolean`** **`(OPTIONAL)`**
* Whether the grid will allow filtering of the column
* False by default

17. **`allowSearch:`** **`boolean`** **`(OPTIONAL)`**
* Whether the searchPanel will allow a search on this column
* False by default

18. **`allowSort:`** **`boolean`** **`(OPTIONAL)`**
* Whether user can click on column header and sort by this column
* True by default

19. **`allowHeaderFiltering:`** **`boolean`** **`(OPTIONAL)`**
* Whether user can click on column header and filter by multiple values of the column (Ex. filter by 'Rajasthan' & 'Gujarat')
* False by default

20. **`dataFormat:`** **`string`** **`(OPTIONAL)`**
* Format for the grid column
* If not specified, tries to get format from editorOptions
* When specified, it will override the format in the editorOptions, if specified

21. **`booleanText:`** **`array`** **`(OPTIONAL)`**
* Array of true strings which replace true/false by yes/no in the grid boolean dropdowns
* Only for booleans

22. **`hint:`** **`string`** **`(OPTIONAL)`**
* Hint that would appear for the field

23. **`editorOptions:`** **`object`** **`(OPTIONAL)`**
* *'For strings -- editorOptions: {readOnly: true, maxLength:50, height:200}'* **use sp_help <table_name> in SQL Server**
* *'For numbers -- editorOptions: {format: '#,##0'}'*
* *'For dates -- editorOptions: {displayFormat: 'dd/MM/yyyy'}'*

24. **`showZeroAsBlanks:`** **`boolean`** **`(OPTIONAL)`**
* For the column show zeroes as blanks (has to be programmed also in the form)
* False by default

25. **`initialFilter:`** **`any`** **`(OPTIONAL)`**
* The initial filtering used when the form loads. Fr instance, in the ciites form, the initial filter is set to country 'India'.

26. **`overrideColumnVisibility:`** **`array`** **`(OPTIONAL)`** **` ==> SET this IN DataObj & NOT IN tableHeaderArray`**
* This should be created in the dataObj passed from the calling form, and not from the tableHeaderArray.
* This feature allows you to set toggles in the form, and switch the column visibility as desired. (Ex. in the 'cities' form, the switch for 'Active' & 'Display') 
