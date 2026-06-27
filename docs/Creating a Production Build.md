## Production Build

1. **In the `.env` file**
* Check the IP address & port

2. **In the `config/paths` folder**
* Check any variable changes for the production version

3. **In the React folder `npm run build`**
* This will create a build directory
* `serve -s build` (for this the serve package would have to be installed) 
* In the browser `http://localhost:3000` 
* Or you could copy the `build` folder into backend\dev and from that directory, in command prompt, execute `serve -s build`. You may have to run `npm install -g serve` to install
serve first
* Right click and `Inspect` and ensure that the IP and host are correct

4. **`axios`**
* Check which would work in dev & which in production
* `//axios.defaults.baseURL = 'http://localhost:5100'`;
* Check if axios header has to be passed with 'Content: application/json'

5. **`Backend`**
* install `cors` npm package and use it in the script for express server. Now the endpoints should execute in development and production mode
* Check from the nodejs/express server by console.log statements whether in production, api routes are being executed

6. **`http-proxy-middleware`**
* Check the code out for dev and production versions in React
* In React, a file `setupProxy.js` has to be created for this

7. **`Chrome Browser`**
* Check netwwork requests
* Network -> Headers, Payload, Preview, Reponse
* Network -> Check the db/getRecord requests
* If errors in db/getRecord, check the same in `Postman`
* Try `192.168.0.10:5100/db/getCities` from the browser (preferable try from another computer on the network)
* If `Postman` and `direct browser` queries work, and it does not run from react, then it very likely be a `CORS` issue. CORS issue will come up through a javascript script but postman and direct browser requests are not through scripts, so they might work.

