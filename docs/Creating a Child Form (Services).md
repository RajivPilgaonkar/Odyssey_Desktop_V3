## Child Component in Parent Form

1. **constructor**
>- `state` should store state variables
>- `var` should call other variables
2. **componentDidMount()**
>- `fetchInitialData` which should call `filterData`
>- `fetchInitialData` should also include all the static data fetch calls
3. **componentDidUpdate**
>- This is fired AFTER every render. Compare props & prevProps to determine when to fire. This should call `filterData` when the props change.
4. **filterData** Call all the dynamic data fetch calls here
5. **renderContent** This will render the content
>- Use `state` & `var` from the contructor to manipulate when the render should take place

## Editing a Record
1. In `formData`, save an object of the record clicked on. This will have all the fields organized in the form of an object properties.
2. Then the popup form should popup.
3. Edit the data, and Save. This should update the database record as well as the `mainData` array.

## Saving a Record (Update)
1. The data from the object `formData`, has to be updated in the database.
2. Check if any field marked as `required`, is kept null or blank
3. Check for duplicates
4. Set data which is null, to the default values 
5. Convert from boolean to bit
6. Update with `beforeSave` values such as `ModifiedBy`, `ModifiedOn`
7. Delete any non-db fields (`Helper` fields in joins which should not be edited)
8. Update database record by calling the Route
9. Update the `mainData` array from which the `formData` object was extracted

## Adding a New Record
1. Create a blank object with all the fields from the table
2. Update the object with the default values 
3. Then the popup form should popup.
4. Edit the data, and Save
5. After saving, close the form. This should add a record to the database as well as to the `mainData` array.

## Handling Drop Down data
1. Take the example of a drop down `currency`
2. In the contructor, under var, define `currencyLookup = []` 
3. Define a function `getSelectedCurrency`
``` javascript
  getSelectedCurrency = async(e) => {
    this.var.formData.currencies_id = e[0].currencies_id;
  }

```
4. Define the function `clearCurrencyLookup` 
``` javascript
  clearCurrencyLookup = async() => {
    this.var.formData.currencies_id = null;
  }
```
5. Here you will define other lookups as well. **The order of the lookups is very important. It should match the order in which the fields are defined**
``` javascript
  displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']};
```
6.
``` javascript
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
``` 
7. 
``` javascript
    const initialCurrencyLookupValues = getLookupValues (
      clearCurrencyLookupValues, this.props.currencyLookup, 
      ['currencies_id','currencycode'], this.var.formData.currencies_id);
```
8. In formObj (**The order is very important**)
``` javascript
      clearLookup: [this.clearCurrencyLookup , this.clearResidentLookup, this.clearUserLookup],

      initialLookupValues: [initialCurrencyLookupValues, initialResidentLookupValues, initialUserLookupValues],

      clearLookupValues: [clearCurrencyLookupValues, clearResidentLookupValues, clearUserLookupValues],
```
8. 