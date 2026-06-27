## Troubleshooting

1. **`Master Form`**
* Cities 
* Search which combines columns (City & Alias)
* Default filter on form load ('India' in the Cities form)
* Overriding column display based on 'Active', 'Display' switches
* Column Header filtering based on multiple values ('Rajasthan' & 'Gujarat')
* CityAlias - calculated field for grid display only. In form the columns are separated as 'City' & 'Alias'

2. **`Master form with Parameters`**
* Car Costing Per Km
* Passing data between master & parameter panel

3. **`Master-Detail form`**
* Addressbook Categories / Sub-Categories / Services
* Re-ordering using drag & drop

4. **`Cascading DropDowns panel`**
* CategoryServices form (not visible in project)

5. **`Updating a field based on another field change`**
* Check in Addressbook. On change of cities_id, city is populated in the `getSelectedCity` function
* Obtain the form instance
* Call the updateData('field_name','value');



