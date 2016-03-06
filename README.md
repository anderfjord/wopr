
## Requirements
* [Node.js](http://nodejs.org/) -- v5.6.0
* [PM2](http://pm2.keymetrics.io/) -- v1.0.1

## Clone the repo
`git clone https://github.com/anderfjord/wopr`

## Change into the project directory
`cd wopr`

## Install local Node.js dependencies
`npm install`

## Start the app
`pm2 start config/pm2.json`

## Run tests
`npm test`

Unit tests are run using [Mocha](https://mochajs.org/)

## Run tests with code coverage
`npm run coverage`

Open `coverage/lcov-report/index.html` in a browser

Code coverage is generated using [Istanbul](https://www.npmjs.com/package/istanbul) in conjunction with [Mocha](https://mochajs.org/)

## Acknowledgements
This project was inspired by the Connect Four over WebRTC app developed by Mahmud Ridwan.

https://github.com/hjr265/arteegee

https://www.toptal.com/webrtc/taming-webrtc-with-peerjs

The WarGames font was provided by Dustin Norlander of [Cheap Skate Fonts](http://www.cheapskatefonts.com/).

The Geo font was provided by Ben Weiner of [Reading Type](https://readingtype.org.uk/).

Audio files were provided by [Uncle Bubby](http://wavs.unclebubby.com/movies/drama/war-games/)