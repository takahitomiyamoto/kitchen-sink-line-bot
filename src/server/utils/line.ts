import * as circularJSON from 'circular-json';
import * as line from '@line/bot-sdk';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
import { configLine } from '../config/line';
import { message } from '../constant/line';

// base URL for webhook server
const baseURL = process.env.HEROKU_BASE_URL;

// create LINE SDK client
// const line = require('@line/bot-sdk');
const client = new line.Client(configLine);

// simple reply function
export const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

const validate = (array, text) => {
  return new RegExp(array.join("|").toLowerCase()).test(text.toLowerCase());
}

const hasInitalMessage = (text: string) => {
  let initialMessages = [];
  initialMessages.push(message.HELLO);
  initialMessages.push(message.HELLO_JA);
  initialMessages.push(message.BUTTONS_YES_JA);
  if (validate(initialMessages, text)) {
    return true;
  }
  return false;
}

const hasContinueMessage = (text: string) => {
  let continueMessages = [];
  continueMessages.push(message.BUTTONS_NO_JA);
  if (validate(continueMessages, text)) {
    return true;
  }
  return false;
}

const hasStopMessage = (text: string) => {
  let stopMessages = [];
  stopMessages.push(message.NO_THANKS_JA);
  if (validate(stopMessages, text)) {
    return true;
  }
  return false;
}

const hasLocationQuestion = (text: string) => {
  let locationQuestion = [];
  locationQuestion.push(message.SEARCH_LOCATION_JA);
  if (validate(locationQuestion, text)) {
    return true;
  }
  return false;
}

const initalMessage = (replyToken) => {
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

const continueMessage = (replyToken) => {
  return replyText(replyToken, message.OK_TELL_ME_AGAIN_JA);
}

const stopMessage = (replyToken) => {
  return replyText(replyToken, message.OK_TELL_ME_IF_NEEDED_JA);
}

const requestImage = (replyToken) => {
  return replyText(replyToken, message.SEND_ME_IMAGE);
}

const defaultMessage = (replyToken) => {
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

export const handleText = (message, replyToken, source) => {
  console.log('handleText');
  // const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
  // console.log('message: ' + circularJSON.stringify(message));
  // console.log('replyToken: ' + replyToken);
  // console.log('source: ' + circularJSON.stringify(source));
  switch (message.text) {
    // start initial communication
    case (hasInitalMessage(message.text) && message.text):
      return initalMessage(replyToken);
    // continue communication
    case (hasContinueMessage(message.text) && message.text):
      return continueMessage(replyToken);
    // stop communication
    case (hasStopMessage(message.text) && message.text):
      return stopMessage(replyToken);
    // start next communication
    case (hasLocationQuestion(message.text) && message.text):
      return requestImage(replyToken);

    // case 'profile':
    //   if (source.userId) {
    //     return client.getProfile(source.userId)
    //       .then((profile) => replyText(
    //         replyToken,
    //         [
    //           `Display name: ${profile.displayName}`,
    //           `Status message: ${profile.statusMessage}`,
    //         ]
    //       ));
    //   } else {
    //     return replyText(replyToken, 'Bot can\'t use profile API without user ID');
    //   }
    // case 'buttons':
    //   return client.replyMessage(
    //     replyToken,
    //     {
    //       type: 'template',
    //       altText: 'Buttons alt text',
    //       template: {
    //         type: 'buttons',
    //         thumbnailImageUrl: buttonsImageURL,
    //         title: 'My button sample',
    //         text: 'Hello, my button',
    //         actions: [
    //           { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
    //           { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
    //           { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
    //           { label: 'Say message', type: 'message', text: 'Rice=米' },
    //         ],
    //       },
    //     }
    //   );
    // case 'confirm':
    //   return client.replyMessage(
    //     replyToken,
    //     {
    //       type: 'template',
    //       altText: 'Confirm alt text',
    //       template: {
    //         type: 'confirm',
    //         text: 'Do it?',
    //         actions: [
    //           { label: 'Yes', type: 'message', text: 'Yes!' },
    //           { label: 'No', type: 'message', text: 'No!' },
    //         ],
    //       },
    //     }
    //   )
    // case 'carousel':
    //   return client.replyMessage(
    //     replyToken,
    //     {
    //       type: 'template',
    //       altText: 'Carousel alt text',
    //       template: {
    //         type: 'carousel',
    //         columns: [
    //           {
    //             thumbnailImageUrl: buttonsImageURL,
    //             title: 'hoge',
    //             text: 'fuga',
    //             actions: [
    //               { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
    //               { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
    //             ],
    //           },
    //           {
    //             thumbnailImageUrl: buttonsImageURL,
    //             title: 'hoge',
    //             text: 'fuga',
    //             actions: [
    //               { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
    //               { label: 'Say message', type: 'message', text: 'Rice=米' },
    //             ],
    //           },
    //         ],
    //       },
    //     }
    //   );
    // case 'image carousel':
    //   return client.replyMessage(
    //     replyToken,
    //     {
    //       type: 'template',
    //       altText: 'Image carousel alt text',
    //       template: {
    //         type: 'image_carousel',
    //         columns: [
    //           {
    //             imageUrl: buttonsImageURL,
    //             action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
    //           },
    //           {
    //             imageUrl: buttonsImageURL,
    //             action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
    //           },
    //           {
    //             imageUrl: buttonsImageURL,
    //             action: { label: 'Say message', type: 'message', text: 'Rice=米' },
    //           },
    //           {
    //             imageUrl: buttonsImageURL,
    //             action: {
    //               label: 'datetime',
    //               type: 'datetimepicker',
    //               data: 'DATETIME',
    //               mode: 'datetime',
    //             },
    //           },
    //         ]
    //       },
    //     }
    //   );
    // case 'datetime':
    //   return client.replyMessage(
    //     replyToken,
    //     {
    //       type: 'template',
    //       altText: 'Datetime pickers alt text',
    //       template: {
    //         type: 'buttons',
    //         text: 'Select date / time !',
    //         actions: [
    //           { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
    //           { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
    //           { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
    //         ],
    //       },
    //     }
    //   );
    // case 'imagemap':
    //   return client.replyMessage(
    //     replyToken,
    //     {
    //       type: 'imagemap',
    //       baseUrl: `${baseURL}/static/rich`,
    //       altText: 'Imagemap alt text',
    //       baseSize: { width: 1040, height: 1040 },
    //       actions: [
    //         { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
    //         { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
    //         { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
    //         { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
    //       ],
    //     }
    //   );
    // case 'bye':
    //   switch (source.type) {
    //     case 'user':
    //       return replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
    //     case 'group':
    //       return replyText(replyToken, 'Leaving group')
    //         .then(() => client.leaveGroup(source.groupId));
    //     case 'room':
    //       return replyText(replyToken, 'Leaving room')
    //         .then(() => client.leaveRoom(source.roomId));
    //   }
    default:
      console.log(`Echo message to ${replyToken}: ${message.text}`);
      return defaultMessage(replyToken);
  }
}

export const handleImage = (message, replyToken) => {
  console.log('handleImage');
  console.log('message: ' + circularJSON.stringify(message));
  console.log('replyToken: ' + replyToken);

  return client.replyMessage(
    replyToken,
    {
      'type': 'image',
      originalContentUrl: baseURL + `/${message.id}.jpg`,
      previewImageUrl: baseURL + `/${message.id}.jpg`
    }
  );

  // TODO: getMessageContentを呼べばいいはず。
  // client.getMessageContent(message.id)
  //   .then((stream) => {
  //     // stream.setEncoding('utf8');
  //     stream.on('data', (chunk) => {
  //       const data = Buffer.from(chunk);
  //       console.log('data: ' + data.toString());
  //     });

  //     stream.on('error', (err) => {
  //       // error handling
  //       console.log('err: ' + err);
  //     });
  //   })
  // ;

  // const downloadPath = path.join(__dirname, '../../downloaded', `${message.id}.jpg`);
  // const previewPath = path.join(__dirname, '../../downloaded', `${message.id}-preview.jpg`);
  // console.log('downloadPath: ' + downloadPath);
  // console.log('previewPath: ' + previewPath);
  // return downloadContent(message.id, downloadPath)
  //   .then((downloadPath) => {
  //     // ImageMagick is needed here to run 'convert'
  //     // Please consider about security and performance by yourself
  //     cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);
  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'image',
  //         originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
  //         previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
  //       }
  //     );
  //   });
}

export const handleVideo = (message, replyToken) => {
  // const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
  // const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);
  // return downloadContent(message.id, downloadPath)
  //   .then((downloadPath) => {
  //     // FFmpeg and ImageMagick is needed here to run 'convert'
  //     // Please consider about security and performance by yourself
  //     cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);
  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'video',
  //         originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
  //         previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
  //       }
  //     );
  //   });
}

export const handleAudio = (message, replyToken) => {
  // const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);
  // return downloadContent(message.id, downloadPath)
  //   .then((downloadPath) => {
  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'audio',
  //         originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
  //         duration: 1000,
  //       }
  //     );
  //   });
}

export const downloadContent = (messageId, downloadPath) => {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

export const handleLocation = (message, replyToken) => {
  return client.replyMessage(
    replyToken,
    {
      type: 'location',
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude,
    }
  );
}

export const handleSticker = (message, replyToken) => {
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

// export { handleEvent }
