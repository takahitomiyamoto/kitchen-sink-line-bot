import * as circularJSON from 'circular-json';
import * as line from '@line/bot-sdk';
import * as fs from 'fs';
import { configLine } from '../config/line';
import { message } from '../constant/line';

export class LineService {
  private static _lineService: LineService = new LineService();
  private constructor() { }
  public static get instance(): LineService {
    return LineService._lineService;
  }

  public baseURL = process.env.HEROKU_BASE_URL;
  public client = new line.Client(configLine);

  public downloadContent = (messageId, downloadFile) => {
    return this.client.getMessageContent(messageId)
      .then((stream) => new Promise((resolve, reject) => {
        const writable = fs.createWriteStream(downloadFile);
        stream.on('error', reject).pipe(writable);
        stream.on('end', () => resolve(downloadFile));
        stream.on('error', reject);
      }))
      ;
  }

  public replyText = (token, texts) => {
    texts = Array.isArray(texts) ? texts : [texts];
    return this.client.replyMessage(
      token,
      texts.map((text) => ({ type: 'text', text }))
    );
  }

  public validate = (array, text) => {
    return new RegExp(array.join("|").toLowerCase()).test(text.toLowerCase());
    // return new RegExp(escape(array.join("|").toLowerCase())).test(escape(text.toLowerCase()));
  }

  public hasInitalMessage = (text: string) => {
    let initialMessages = [];
    initialMessages.push(message.HELLO);
    initialMessages.push(message.HELLO_JA);
    initialMessages.push(message.BUTTONS_YES_JA);
    if (this.validate(initialMessages, text)) {
      return true;
    }
    return false;
  }

  public initalMessage = (replyToken) => {
    return this.client.replyMessage(
      replyToken,
      [
        {
          type: 'sticker',
          packageId: message.POSITIVE_PACKAGE_ID,
          stickerId: message.POSITIVE_STICKER_ID
        },
        {
          type: 'template',
          altText: 'initalMessage',
          template: {
            type: 'buttons',
            title: message.INITIAL_MESSAGE_TITLE,
            text: message.INITIAL_MESSAGE_TEXT,
            actions: [
              {
                label: message.GOOGLE_EARTH_JA,
                type: 'uri',
                uri: 'https://earth.google.com/web/'
              },
              {
                label: message.SEARCH_LOCATION_JA,
                type: 'message',
                text: message.SEARCH_LOCATION_JA
              },
              {
                label: message.SAD_NO_THANKS_JA,
                type: 'message',
                text: message.SAD_NO_THANKS_JA
              }
            ]
          }
        }
      ]
    );
  }

  public hasContinueMessage = (text: string) => {
    let continueMessages = [];
    continueMessages.push(message.BUTTONS_NO_JA);
    if (this.validate(continueMessages, text)) {
      return true;
    }
    return false;
  }

  public continueMessage = (replyToken) => {
    return this.client.replyMessage(
      replyToken,
      [
        {
          type: 'sticker',
          packageId: message.NEGATIVE_PACKAGE_ID,
          stickerId: message.NEGATIVE_STICKER_ID
        },
        {
          type: 'text',
          text: message.OK_TELL_ME_AGAIN_JA
        }
      ]
    );
  }

  public hasStopMessage = (text: string) => {
    let stopMessages = [];
    stopMessages.push(message.NO_THANKS_JA);
    stopMessages.push(message.SAD_NO_THANKS_JA);
    if (this.validate(stopMessages, text)) {
      return true;
    }
    return false;
  }

  public isSad = (text: string) => {
    let sadMessages = [];
    sadMessages.push(message.SAD_NO_THANKS_JA);
    if (this.validate(sadMessages, text)) {
      return true;
    }
    return false;
  }

  public stopMessage = (replyToken, isSad) => {
    return this.client.replyMessage(
      replyToken,
      [
        {
          type: 'sticker',
          packageId: (isSad) ? message.SAD_NO_THANKS_PACKAGE_ID : message.NO_THANKS_PACKAGE_ID,
          stickerId: (isSad) ? message.SAD_NO_THANKS_STICKER_ID : message.NO_THANKS_STICKER_ID
        },
        {
          type: 'text',
          text: message.OK_TELL_ME_IF_NEEDED_JA
        }
      ]
    );
  }

  public hasLocationQuestion = (text: string) => {
    let locationQuestion = [];
    locationQuestion.push(message.SEARCH_LOCATION_JA);
    if (this.validate(locationQuestion, text)) {
      return true;
    }
    return false;
  }

  public requestImage = (replyToken) => {
    return this.client.replyMessage(
      replyToken,
      [
        {
          type: 'sticker',
          packageId: message.OK_PACKAGE_ID,
          stickerId: message.OK_STICKER_ID
        },
        {
          type: 'text',
          text: message.SEND_ME_IMAGE
        }
      ]
    );
  }

  public defaultMessage = (replyToken, sticker) => {
    console.log('defaultMessage');
    console.log('sticker: ' + circularJSON.stringify(sticker));
    let _sticker;
    if (0 === sticker.length) {
      _sticker = {
        type: 'sticker',
        packageId: message.UNKNOWN_PACKAGE_ID,
        stickerId: message.UNKNOWN_STICKER_ID
      };
    } else {
      _sticker = sticker[0];
    }

    return this.client.replyMessage(
      replyToken,
      [
        _sticker,
        {
          type: 'template',
          altText: 'defaultMessage',
          template: {
            type: 'buttons',
            title: message.DEFAULT_MESSAGE_TITLE_JA,
            text: message.DEFAULT_MESSAGE_TEXT_JA,
            actions: [
              {
                label: message.BUTTONS_YES_JA,
                type: 'message',
                text: message.BUTTONS_YES_JA
              },
              {
                label: message.NO_THANKS_JA,
                type: 'message',
                text: message.NO_THANKS_JA
              }
            ]
          }
        }
      ]
    );
  }

  private isNoHouse = (text: string) => {
    let isNoHouse = [];
    isNoHouse.push(message.NO_HOUSE_JA);
    if (this.validate(isNoHouse, text)) {
      return true;
    }
    return false;
  }

  private isFair = (text: string) => {
    let isFair = [];
    isFair.push(message.FOUND_FAIR_JA);
    console.log(isFair);
    console.log(circularJSON.stringify(text).toString().replace('n', ''));
    if (this.validate(isFair, circularJSON.stringify(text).toString().replace('n', ''))) {
      return true;
    }
    return false;
  }

  public sendMessage = (replyToken, messageToBeSent) => {
    console.log('sendMessage: ' + circularJSON.stringify(messageToBeSent));
    let _sticker;
    if (this.isNoHouse(messageToBeSent.text)) {
      _sticker = {
        type: 'sticker',
        packageId: message.NO_HOUSE_PACKAGE_ID,
        stickerId: message.NO_HOUSE_STICKER_ID
      };
    } else if (this.isFair(messageToBeSent.text)) {
      _sticker = {
        type: 'sticker',
        packageId: message.FAIR_PACKAGE_ID,
        stickerId: message.FAIR_STICKER_ID
      };
    } else {
      _sticker = {
        type: 'sticker',
        packageId: message.POSITIVE_PACKAGE_ID,
        stickerId: message.POSITIVE_STICKER_ID
      };
    }
    return this.client.replyMessage(
      replyToken,
      [
        _sticker,
        {
          type: 'template',
          altText: 'resultMessage',
          template: {
            type: 'buttons',
            title: message.RESULT_MESSAGE_JA,
            text: messageToBeSent.text + '\n' + message.ADDITIONAL_MESSAGE_JA,
            actions: [
              {
                label: message.GOOGLE_EARTH_JA,
                type: 'uri',
                uri: 'https://earth.google.com/web/'
              },
              {
                label: message.SEARCH_LOCATION_JA,
                type: 'message',
                text: message.SEARCH_LOCATION_JA
              },
              {
                label: message.NO_THANKS_JA,
                type: 'message',
                text: message.NO_THANKS_JA
              }
            ]
          }
        }
      ]
    )
    .then((result) => {
      console.log('sendMessage result: ' + circularJSON.stringify(result));
    }).catch((err) => {
      // error handling
      console.log('sendMessage err: ' + circularJSON.stringify(err));
    });
  }

  public getSticker = (sentiment) => {
    let packageId = '';
    let stickerId = '';
    console.log('sentiment: ' + circularJSON.stringify(sentiment));
    switch (sentiment) {
      case 'positive':
        return {
          type: 'sticker',
          packageId: message.POSITIVE_PACKAGE_ID,
          stickerId: message.POSITIVE_STICKER_ID
        };
      case 'negative':
        return {
          type: 'sticker',
          packageId: message.NEGATIVE_PACKAGE_ID,
          stickerId: message.NEGATIVE_STICKER_ID
        };
      default:
        return {
          type: 'sticker',
          packageId: message.UNKNOWN_PACKAGE_ID,
          stickerId: message.UNKNOWN_STICKER_ID
        };
    }
  }
}
