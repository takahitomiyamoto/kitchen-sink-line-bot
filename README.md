# kitchen-sink-line-bot
kitchen-sink LINE Bot for Heroku

## Usage (Heroku Button)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/takahitomiyamoto/kitchen-sink-line-bot)

## Usage (Manually)
    git clone https://github.com/takahitomiyamoto/kitchen-sink-line-bot.git
    cd kitchen-sink-line-bot/
    npm install
    heroku create {HEROKU_APP_NAME}
    git push heroku master -a {HEROKU_APP_NAME}

## Examples
- [Awesome Retail Advisor](https://github.com/takahitomiyamoto/kitchen-sink-line-bot/tree/master/examples/awesome-retail-advisor)

## Prerequisite
- [Getting started with the Messaging API](https://developers.line.me/ja/docs/messaging-api/getting-started/)
- [Einstein Vision](https://elements.heroku.com/addons/einstein-vision)
- [Object Detection Quick Start](https://metamind.readme.io/docs/od_qs_scenario)
- [nforce :: node.js salesforce REST API wrapper](https://github.com/kevinohara80/nforce)
- [googleapis/nodejs-translate](https://github.com/googleapis/nodejs-translate/blob/master/README.md#before-you-begin)

# Acknowledgement
- [line/line-bot-sdk-nodejs](https://github.com/line/line-bot-sdk-nodejs/tree/master/examples/kitchensink)
- [hinabasfdc/einstein-vision_sampleapp01](https://github.com/hinabasfdc/einstein-vision_sampleapp01)
- [dreamhouseapp-jp/dreamhousejp-bot-line](https://github.com/dreamhouseapp-jp/dreamhousejp-bot-line)
