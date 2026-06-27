## Production Build

1. **In the `config/paths` folder**
* Check the IP address
* In the node backend, in the `index.js` file in models, in the dbconfig `options` property, set `trustServerCertificate: true` 
 
2. **From another computer on the network**
* In postman try the `GET` query, `http://192.168.0.10:5100/db/getCities` and check if you get rows
* Try this `http://192.168.0.10:5100/db/getCities` directly as a browser url, from another computer
* If you do get a response from the previous 2 methods, but not from the react app, then it is very likely a `CORS` issue. For solutions, check in the document `Creating a Production Build`.

3. **Ping and ensure that you can communicate with the server**
* `ping 192.168.0.10`

4. **Check the node version**
* `node -v` at the command prompt

5. **If you cannot connect to the database**
* Try updating to MS SQL Express SP2

6. **In SQL Server Configuration Manager**
* Protocols from SQL Server - TCP/IP Enabled
* Right Click TCP/IP Properties -> IP Addresses tab -> Right at the bottom IP(All) -> TCP Port: 1433

7. **Check .env file from the desktop/dev folder in the FRONT end**
* Create `.env` file
* REACT_APP_HOST=http://192.168.1.138 or http://localhost
* REACT_APP_PORT=5100
