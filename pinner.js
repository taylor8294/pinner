const puppeteer = require('puppeteer');
const fs = require('fs');
const colog = require('colog');
const readline = require('readline');
var term = require( 'terminal-kit' ).terminal

const config = require('./config')
const cookies = require('./cookies.json')
const pinHost = 'https://www.pinterest.co.uk'

/*
 * Utils
 */
function linesToArray(fileName, type) {
  return new Promise(function(resolve, reject){
    fs.readFile(fileName, type, (err, data) => {
        if(err) reject(err)
        else {
          data = data.toString().split("\n").map(line => line.trim())
          if(data[data.length-1] == '') data.splice(-1,1)
          resolve(data);
        }
    });
  });
}
function linesToArraySync(fileName, type) {
  let arr = fs.readFileSync(fileName, type).toString().split("\n").map(line => line.trim());
  if(arr[arr.length-1] == '') arr.splice(-1,1)
  return arr;
}
function delay(ms) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, ms)
    });
 }

colog.headerInfo("=== Init ===")
/*
 * Config checks & load pins
 */
colog.info("Checking config...")
if(!config.hasOwnProperty('logging_level') || typeof config['logging_level'] !== 'number'){
  config['logging_level'] = 2
}
config['logging_level'] = Math.max(0,Math.min(Math.round(config['logging_level'],0),3))
if(!config.hasOwnProperty('board') || typeof config['board'] !== 'string' || config['board'].length == 0){
  throw new Error("Must specify 'board' property in config.js (string)");
}
config['board'] = config['board'].trim()
if(config.hasOwnProperty('pins') && (Array.isArray(config['pins']) || typeof config['pins'] === 'string') && config['pins'].length > 0){
  if(!Array.isArray(config['pins'])) config['pins'] = [config['pins']]
} else {
  if(config.hasOwnProperty('pinsFile') && fs.existsSync(config['pinsFile'])){
    config['pins'] = linesToArraySync(config['pinsFile'])
    if(!config['pins'].length) throw new Error("No pin IDs given in pinsFile ("+config['pinsFile']+")");
  } else throw new Error("No pin IDs given in config file & no valid pinsFile found");
}
{
  let invalid = -1
  config['pins'].forEach(function(str,i,arr){
    arr[i] = str.toString().trim()
    if(!/^\d+$/.test(str)) invalid = i
  })
  if(invalid !== -1) throw new Error("Pin ID given in config['pins']["+invalid+"] looks invalid.")
}
colog.info("  Config OK");

/*
 * Main
 */
(async () => {
  colog.headerInfo("=== Launch ===")
  colog.info("Launching Chromium...")
  const browser = await puppeteer.launch({headless:config.headless});
  colog.info("Opening new tab...")
  const page = await browser.newPage();

  //Debugging
  var log_levels = [
    '',
    'error assert',
    'log debug error assert dir dirxml table trace clear count',
    'log debug info error warning dir dirxml table trace clear startGroup startGroupCollapsed endGroup assert profile profileEnd count timeEnd'
  ]
  page.on('console', msg => {
    if(log_levels[config.logging_level].includes(msg.type())){
      colog.log('['+msg.type().toUpperCase()+'] '+msg.text())
    }
  });

  //Set cookies to avoid repeated logins
  colog.info("Setting cookies...")
  await page.setCookie.apply(page,cookies)

  //Login
  colog.info("Opening login page...")
  page.goto(pinHost+'/login');
  await page.waitForNavigation();
  
  //Check if cookies worked and already logged in (pinterest homepage)
  if(!/.*pinterest.\w\w(?:\w?|\.\w\w)\/?(?:#.*?)?(?:\?.*?)?$/.test(page.url())){
    //Not logged in
    colog.info("Not logged it with cookies, will trry login...")
    await page.waitForSelector('[type=submit]')
    await page.type('#email', config.email)
    await page.type('#password', config.password)
    await delay(500)
    await page.click('[type=submit]')
    await page.waitForNavigation()

    //Check logged in (pinterest homepage again)
    if(!/.*pinterest.\w\w(?:\w?|\.\w\w)\/?(?:#.*?)?(?:\?.*?)?$/.test(page.url())){
      //Login failed
      throw new Error("Login failed")
    }

    //Logged in! Save cookies
    colog.info("Login successful!")
    colog.info("Saving cookies (async)...")
    const ckies = await page.cookies();
    fs.writeFile("./cookies.json", JSON.stringify(ckies), function(err) {
      if(err) return console.log(err)
      colog.info("  Cookies saved!")
    }); 
  } else colog.info("Cookies worked, logged in!")
  
  colog.headerInfo("=== Pinning ===")
  let counter = 0;
  colog.progress(counter, config.pins.length);
  for(id of config.pins) {
    let pinUrl = `${pinHost}/pin/${id}/`
    term.eraseLine()
    term.previousLine(1)
    colog.info("Pinning "+pinUrl+"...")
    colog.progress(counter, config.pins.length);
    page.goto(pinUrl);
    await page.waitForSelector('.PinBetterSave__Dropdown')
    page.click('.PinBetterSave__Dropdown')
    await page.waitForSelector('._4c')

    // Can click from page context, but not a real GUI click
    /* await page.evaluate((boardName) => {
      Array.from(document.querySelectorAll('._4c > div')).filter(div => div.textContent.toLowerCase() == boardName)[0].querySelector('[role=button]').click();
    }, config.board.toLowerCase())*/
    const boardButton = await page.evaluateHandle(
      boardName => {
        let btn = Array.from(document.querySelectorAll('._4c > div')).filter(div => div.textContent.toLowerCase().trim() == boardName)[0].querySelector('[role=button]')
        return Promise.resolve(btn)
      },
      config.board.toLowerCase()
    );
    await boardButton.click()
    boardButton.dispose()
    await page.waitForSelector('[data-test-id=saved-info]')
    // Can wait for true, but makes more sense to check once now selector is definitely there
    //await page.waitForFunction('document.querySelector("[data-test-id=saved-info]").textContent == "Saved to '+config.board+'"')
    let pinWorked = await page.evaluate(
      boardName => document.querySelector('[data-test-id=saved-info]').textContent.toLowerCase().trim() == 'saved to '+boardName,
      config.board.toLowerCase()
    )
    if(!pinWorked) throw new Error("Failed to pin to "+config.board);
    term.eraseLine()
    term.previousLine(1)
    colog.success("Pin successful")
    colog.progress(++counter, config.pins.length);
    await delay(config.pauseFor ? config.pauseFor : 5000)
  }

  colog.headerInfo("=== Cleaning up ===")
  colog.info("Closing Chromium...")
  await browser.close();
  colog.info("Bye!")
})();