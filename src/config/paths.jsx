let MAX_PAGE_WIDTH = 1366-35;
//let NODE_PORT = '5100';

// read from .env file 
let NODE_PORT = process.env.REACT_APP_PORT;

//let IP = (process.env.NODE_ENV === 'production') ? 'http://192.168.1.137' : 'http://192.168.1.137';
//let IP = (process.env.NODE_ENV === 'production') ? 'http://192.168.1.137' : 'http://192.168.1.137';
//let IP = (process.env.NODE_ENV === 'production') ? 'http://192.168.0.10' : 'http://http://192.168.0.10';

// read from .env file 
let IP = process.env.REACT_APP_HOST;

console.log('=======================================');
console.log('Running on IP (from .env file) ',IP+':'+NODE_PORT);
console.log('Check by running `ipconfig` in case of errors ');
console.log('=======================================');

let http_prefix = '';
let http_prefix_node = '';
let http_prefix_mojo = '';

http_prefix = `${IP}:${NODE_PORT}`;
http_prefix_node = (process.env.NODE_ENV === 'production') ? `${IP}` : `${IP}:${NODE_PORT}`;
http_prefix_mojo = (process.env.NODE_ENV === 'production') ? `${IP}` : `${IP}:${NODE_PORT}`;

function getBrowserWidth() {
  return Math.max(
/*
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth,
*/
    document.body.clientWidth
  );
}

/*
function getBrowserHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}
*/

//let page_margin = (window.screen.availWidth-30 > MAX_PAGE_WIDTH) ? (window.screen.availWidth-30 - MAX_PAGE_WIDTH)/2 : 0;
let browser_width = getBrowserWidth();
browser_width = (browser_width > MAX_PAGE_WIDTH) ? MAX_PAGE_WIDTH : browser_width;
let page_margin = (browser_width > MAX_PAGE_WIDTH) ? (browser_width - MAX_PAGE_WIDTH)/2 : 0;
const pageStyle = {
  marginLeft: page_margin,
  marginRight: page_margin,
  width: browser_width
}

let HEADER_HEIGHT=60;
let BREADCRUMB_HEIGHT=40;
let FOOTER_HEIGHT=180;

let MASTER_GRID_TITLE_HEIGHT=40;
let MASTER_GRID_ERROR_HEIGHT=30;
let MASTER_GRID_HEADER_HEIGHT=37;
let MASTER_GRID_PAGER_HEIGHT=57;
let MASTER_GRID_ROW_HEIGHT=34;
let MASTER_GRID_NUM_ROWS=12;

let DEMO=false;
let UID=1;

export {
    http_prefix,
    http_prefix_node,
    http_prefix_mojo,
    pageStyle,
    HEADER_HEIGHT,
    BREADCRUMB_HEIGHT,
    FOOTER_HEIGHT,
    DEMO,
    UID,
    MASTER_GRID_TITLE_HEIGHT,
    MASTER_GRID_ERROR_HEIGHT,
    MASTER_GRID_HEADER_HEIGHT,
    MASTER_GRID_PAGER_HEIGHT,
    MASTER_GRID_ROW_HEIGHT,
    MASTER_GRID_NUM_ROWS
};
