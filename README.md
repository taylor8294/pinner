# PinnerJs

_Simple automated pinning to a given Pinterest board using Puppeteer_

## Install

### Download

``` bash
git clone https://github.com/taylor8294/pinner.git
cd pinner
npm install
```

## License

### Commercial license

If you want to use Pinner to develop commercial sites, themes, projects, and applications, the Commercial license is the appropriate license. With this option, your source code is kept proprietary. To acquire a Pinner Commercial License please [contact me](https://taylrr.co.uk/).

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
+ Alter any other options to customise the way Pinner works 

---

By [Taylor8294 🌈🐻](https://taylrr.co.uk)