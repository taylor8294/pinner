# PinnerJs

_Simple automated re-pinning to a given Pinterest board using Puppeteer_

## Install

### Download

``` bash
git clone https://github.com/taylor8294/pinner.git
cd pinner
npm install
```

## License

### Commercial license

If you want to use Pinner to develop commercial sites, tools, projects, or applications, the Commercial license is the appropriate license. With this option, your source code is kept proprietary. To acquire a Pinner Commercial License please [contact me](https://www.taylrr.co.uk/).

### Open source license

If you are creating an open source application under a license compatible with the [GNU GPL license v3](https://www.gnu.org/licenses/gpl-3.0.html), you may use Pinner under the terms of the GPLv3.

## Usage

Pinner is very simple to run
+ Copy or rename `config.tpl.js` to `config.js`
+ Enter your Pinterest account login details in `config.js`
+ Enter IDs of pins you want to pin either
  - As an array directly in `config.pins`
  - In a file (eg. `pins.txt` in the root folder) with one ID per line, and set `config.pinsFile` as the path to that file  (eg. `pins.txt`)
+ Enter the name of the board you wish to pin to in `config.board`
+ Alter any other options to customise the way Pinner works such as `pauseFor`
+ To start, simply run `npm start`

## Warnings / To Do

Pinner is in it's early stages.
+ Currently pinner contains minimal error checking, ensure the pin IDs provided in `config.pins` (or `config.pinsFile`) produce valid URLs.
+ Pinner doesn't try to avoid Pinterst rate limits other than the `pauseFor` option (which dictates how long to pause between pins) and the saving cookies functionality (to avoid repeated logins). It does not consider daily or hourly limits itself, please be aware of this to avoid your accout receiving any bans from Pinterest. 

---

By [Taylor8294 🌈🐻](https://www.taylrr.co.uk/)