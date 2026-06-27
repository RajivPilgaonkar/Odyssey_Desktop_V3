## Debugging Code

1. **`City to City`** 
* Try to fit pax in Single Car
* If two cars have the same capacity, shoose the more economical one, else choose base on point (4)
* Based on Per Km, P2P, City Groups - select car based on `FomPax` & `ToPax` in the Car Costings

2. **`Car for Sighseeing`** 
* Find most economical option. Sometimes 2 small cars are more economical than a single big car.
* Based on Services Costings - select car based on `FomPax` & `ToPax` in the Services Transport Costing

3. **`Car for Transfers`** 
* Find most economical option. Sometimes 2 small cars are more economical than a single big car.
* Based on Transfer Costings - select car based on `FomPax` & `ToPax` in the Transfers Transport Costing

4. **`QuoModuleVehiclePreferences`** 
* This table provides suggestions for which is the preferred car depending on the number of pax.
* Check if the agent provides this car. If provided, select this car, otherwise use the login in the points above.

5. **`Redundant? Pax in Vehicles table`** 
* Based on the above points, the `pax` field in the `vehicles` table may be redundant 

6. **`Redundant? FromPax & ToPax in CarHireAgents table`** 
* Based on the above points, the `FromPax` & `ToPax` fields in the `carhireagents` table may be redundant 

