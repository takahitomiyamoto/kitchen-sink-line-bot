import * as circularJSON from 'circular-json';
import * as line from '@line/bot-sdk';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
import { configLine } from '../config/line';
import { message } from '../constant/line';

// TODO:
export class LineService {
  private static _lineService: LineService = new LineService();
  private constructor() {}
  public static get instance(): LineService {
    return LineService._lineService;
  }

  public baseURL = process.env.HEROKU_BASE_URL;
  public client = new line.Client(configLine);
  public downloadContent = (messageId, downloadPath) => {
    console.log('LineService downloadContent');
    console.log('LineService messageId: ' + messageId);
    // console.log('LineService downloadPath: ' + downloadPath);
    return this.client.getMessageContent(messageId)
      .then((stream) => new Promise((resolve, reject) => {
        console.log('LineService then: ' + downloadPath);
        // fs.mkdirSync('output');
        const writable = fs.createWriteStream(`${messageId}.jpg`);
        // const writable = fs.createWriteStream(downloadPath);
        // const errorHandling = (err) => { console.log(err) }
        console.log('LineService then: writable');
        // writable.on('open', () => {
        // stream.pipe(writable);
        stream.on('error', reject).pipe(writable);
        console.log('LineService then: writable pipe');
        stream.on('end', () => resolve(`${messageId}.jpg`));
        // stream.on('end', () => resolve(downloadPath));
        console.log('LineService then: end');
        stream.on('error', reject);
        console.log('LineService then: error');
        // })
      }))
    ;
  }

}

// base URL for webhook server
export const baseURL = process.env.HEROKU_BASE_URL;

// create LINE SDK client
export const client = new line.Client(configLine);

const validate = (array, text) => {
  return new RegExp(array.join("|").toLowerCase()).test(text.toLowerCase());
}

export const hasInitalMessage = (text: string) => {
  let initialMessages = [];
  initialMessages.push(message.HELLO);
  initialMessages.push(message.HELLO_JA);
  initialMessages.push(message.BUTTONS_YES_JA);
  if (validate(initialMessages, text)) {
    return true;
  }
  return false;
}

export const hasContinueMessage = (text: string) => {
  let continueMessages = [];
  continueMessages.push(message.BUTTONS_NO_JA);
  if (validate(continueMessages, text)) {
    return true;
  }
  return false;
}

export const hasStopMessage = (text: string) => {
  let stopMessages = [];
  stopMessages.push(message.NO_THANKS_JA);
  if (validate(stopMessages, text)) {
    return true;
  }
  return false;
}

export const hasLocationQuestion = (text: string) => {
  let locationQuestion = [];
  locationQuestion.push(message.SEARCH_LOCATION_JA);
  if (validate(locationQuestion, text)) {
    return true;
  }
  return false;
}

// simple reply function
export const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

export const initalMessage = (replyToken) => {
  return client.replyMessage(
    replyToken, {
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
  );
}

export const continueMessage = (replyToken) => {
  return replyText(replyToken, message.OK_TELL_ME_AGAIN_JA);
}

export const stopMessage = (replyToken) => {
  return replyText(replyToken, message.OK_TELL_ME_IF_NEEDED_JA);
}

export const requestImage = (replyToken) => {
  return replyText(replyToken, message.SEND_ME_IMAGE);
}

export const defaultMessage = (replyToken) => {
  return client.replyMessage(
    replyToken, {
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
  );
}

export const sendMessage = (message, replyToken) => {
  console.log('sendMessage: ' + circularJSON.stringify(message));
  return client.replyMessage(replyToken, message)
    .then((result) => {
      console.log('sendMessage result: ' + circularJSON.stringify(result));
    })
    .catch((err) => {
      // error handling
      console.log('sendMessage err: ' + circularJSON.stringify(err));
    })
  ;
}

export const downloadContent = (messageId, downloadPath) => {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }))
  ;
}
