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

  public validate = (array, text) => {
    return new RegExp(array.join("|").toLowerCase()).test(text.toLowerCase());
  }

  public hasStopMessage = (text: string) => {
    let stopMessages = [];
    stopMessages.push(message.NO_THANKS_JA);
    if (this.validate(stopMessages, text)) {
      return true;
    }
    return false;
  }

  public stopMessage = (replyToken, sticker) => {
    const sticker_0 = sticker[0];
    return this.client.replyMessage(
      replyToken,
      [
        sticker_0,
        {
          type: 'text',
          text: message.OK_TELL_ME_IF_NEEDED_JA
        }
      ]
    );
    // return this.replyText(replyToken, message.OK_TELL_ME_IF_NEEDED_JA);
  }

  public hasLocationQuestion = (text: string) => {
    let locationQuestion = [];
    locationQuestion.push(message.SEARCH_LOCATION_JA);
    if (this.validate(locationQuestion, text)) {
      return true;
    }
    return false;
  }

  public requestImage = (replyToken, sticker) => {
    const sticker_0 = sticker[0];
    return this.client.replyMessage(
      replyToken,
      [
        sticker_0,
        {
          type: 'text',
          text: message.SEND_ME_IMAGE
        }
      ]
    );
    // return this.replyText(replyToken, message.SEND_ME_IMAGE);
  }

  public defaultMessage = (replyToken) => {
    return this.client.replyMessage(
      replyToken,
      [
        {
          type: 'sticker',
          packageId: message.UNKNOWN_PACKAGE_ID,
          stickerId: message.UNKNOWN_STICKER_ID
        },
        {
          type: 'template',
          altText: 'defaultMessage',
          template: {
            type: 'confirm',
            text: message.SORRY_TELL_ME_AGAIN_JA,
            actions: [
              {
                label: message.BUTTONS_YES_JA,
                type: 'message',
                text: message.BUTTONS_YES_JA
              },
              {
                label: message.BUTTONS_NO_JA,
                type: 'message',
                text: message.BUTTONS_NO_JA
              }
            ]
          }
        }
      ]
    );
  }

  public sendMessage = (replyToken, message) => {
    console.log('sendMessage: ' + circularJSON.stringify(message));
    return this.client.replyMessage(
      replyToken,
        [
          this.getSticker('positive'),
          message,
          // {
          //   type: 'template',
          //   altText: 'additionalMessage',
          //   template: {
          //     type: 'confirm',
          //     text: message.ADDITONAL_MESSAGE_JA,
          //     actions: [
          //       {
          //         label: message.BUTTONS_YES_JA,
          //         type: 'message',
          //         text: message.SEARCH_LOCATION_JA
          //       },
          //       {
          //         label: message.BUTTONS_NO_JA,
          //         type: 'message',
          //         text: message.BUTTONS_NO_JA
          //       }
          //     ]
          //   }
          // }
        ]
      )
      .then((result) => {
        console.log('sendMessage result: ' + circularJSON.stringify(result));
      })
      .catch((err) => {
        // error handling
        console.log('sendMessage err: ' + circularJSON.stringify(err));
      })
      ;
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
          packageId: message.NEUTRAL_PACKAGE_ID,
          stickerId: message.NEUTRAL_STICKER_ID
        };
    }
  }
}
