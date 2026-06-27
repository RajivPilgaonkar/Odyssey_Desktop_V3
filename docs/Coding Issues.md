## Debugging Code

1. **`For DropDowns`** 
* Unique
* Next serial number

```javascript
  getSelectedVehicle = async(e) => {

    // *** Do not use the spread operator
    // this.var.formData = {...this.var.formData, ...}
    this.var.formData.Vehicles_id = e[0].vehicles_id;
      
  }
```
