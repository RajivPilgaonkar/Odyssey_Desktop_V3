## Install first time on a Development Machine

Let's say you want to install the project in *'E:\node_projects\odyssey\desktop\dev':*
1. Using a nodeJS command prompt, run as Administrator
2. Go to the directory *'E:\node_projects\odyssey\desktop\dev'*
4. run **`git clone https://github.com/RajivPilgaonkar/Odyssey_desktop.git .`**
5. run **`git checkout master`** (Change branch to master)
6. Copy the .env file which contains the following lines
   REACT_APP_HOST=http://192.168.1.138 (your ip)
   REACT_APP_PORT=5100 (port on which the backend runs)
7. run **`npm install`** (This will compile the program)
8. run **`npm run start`** (This will open the browser to //localhost:3000)
9. Or you can go to the browser and type in the URL **`//localhost:3000`**

## Copy (& overwrite) latest code on a Development Machine or to serve from another machine

1. run **`git checkout master`** (Change branch to master)
2. run **`npm install`** (This will compile the program)
3. To build **`npm run build`** 
4. To serve **`serve -s build`** 
5. Run locally **`npm run start`** (This will open the browser to //localhost:3000)
6. Or you can go to the browser and type in the URL **`//localhost:3000`**


## Troubleshooting

If the landing page does not open up on **`npm run start`**, try the following:
1. Check if the backend is open, else **`node app.js`** in the backend
2. If the backend is open, go to that node window and press the *down arrow* key. Sometimes the backend just gets stuck in Windows.
3. Otherwise, just open a new nodeJS command prompt window, go to the corresponding directory, and **`npm run start`**
4. Try deleting the node_modules folder and then **`npm install`** and then **`npm run start`**
5. Make sure the .env file which contains the following lines exists
   REACT_APP_HOST=http://192.168.1.138 (your ip)
   REACT_APP_PORT=5100 (port on which the backend runs)

## Debugging

1. In the chrome browser, *right click -> Inspect*
2. Add console.log statements in the source code
3. When the browser is refreshed, the output will be seen in the *DevTools -> Console*
