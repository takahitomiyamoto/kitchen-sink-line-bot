import * as circularJSON from 'circular-json';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
import { configLine } from '../config/line';
import { client, baseURL, replyText, hasInitalMessage, initalMessage, hasContinueMessage, continueMessage, hasStopMessage, stopMessage, hasLocationQuestion, requestImage, defaultMessage, downloadContent, sendMessage } from '../service/line';
import { VisionService as visionService } from '../service/vision';
import { SalesforceService as salesforceService } from '../service/salesforce';

// callback function to handle a single event
export const handleEvent = (event) => {
  console.log('event: ' + circularJSON.stringify(event));
  switch (event.type) {
    case 'message':
      const message = event.message;
      // console.log('message.type: ' + message.type);
      // console.log('message: ' + circularJSON.stringify(message));
      // console.log('event.replyTokene: ' + event.replyToken);
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          // return handleVideo(message, event.replyToken);
        case 'audio':
          // return handleAudio(message, event.replyToken);
        case 'location':
          // return handleLocation(message, event.replyToken);
        case 'sticker':
          // return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }
    case 'follow':
      return replyText(event.replyToken, 'Got followed event');
    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);
    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);
    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);
    case 'postback':
      let data = event.postback.data;
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `Got postback: ${data}`);
    case 'beacon':
      return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);
    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

const handleText = (message, replyToken, source) => {
  console.log('handleText');
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
    default:
      console.log(`Echo message to ${replyToken}: ${message.text}`);
      return defaultMessage(replyToken);
  }
}

const handleImage = (message, replyToken) => {
  console.log('handleImage');
  console.log('message: ' + circularJSON.stringify(message));
  console.log('replyToken: ' + replyToken);
  // const promise0 = visionService.instance.getMessageContent_(client, message.id);
  const promise0 = 0;
  const promise1 = visionService.instance.getAccessToken();
  const promise2 = (v1, v2) => visionService.instance.getImageClassification(v1, v2);
  Promise.all([Promise.all([promise0, promise1])
  .then((values) => {
    console.log('Promiss.all values: ' + values);

    client.getMessageContent(message.id)
    .then((stream) => {
      let targetImageBase64;
      stream.on('data', (chunk) => {
        const data = Buffer.from(chunk);
        targetImageBase64 = data.toString('base64');
      });
      stream.on('end', () => {
        // const data = Buffer.from(body);
        // const targetImageBase64 = data.toString('base64');
        console.log('-------------------- targetImageBase64: ' + targetImageBase64);
        return promise2(targetImageBase64, values[1]);
      })
    })
  })])
  .then((predictresponse) => {
    console.log('Promiss.all predictresponse: ' + circularJSON.stringify(predictresponse));
    const _predictresponse = predictresponse;
    const messageToBeSent = {
      type:'text',
      text: `画像の分析の結果、 "${_predictresponse}" `
    };
    return sendMessage(messageToBeSent, replyToken);
  }).catch((error) => {
    console.log('Promiss.all error: ' + circularJSON.stringify(error));
  });


  // // 1. Einstein Vision の access_token を取得する
  // visionService.instance.getAccessToken_(function(accessToken) {
  //   console.log('-------------------- accessToken: ' + accessToken);
  //   // 2. 画像のバイナリデータを取得する
  //   client.getMessageContent(message.id)
  //   .then((stream) => {
  //     stream.on('data', (chunk) => {
  //       const data = Buffer.from(chunk);
  //       const targetImageBase64 = data.toString('base64');
  // // visionService.instance.getMessageContent(message.id, function(targetImageBase64) {
  //       console.log('-------------------- targetImageBase64: ' + targetImageBase64);
  //       // 3. Einstein Vision の予測結果を取得する
  //       visionService.instance.getImageClassification_(targetImageBase64, accessToken, function(predictresponse) {
  //         console.log('-------------------- predictresponse: ' + predictresponse);
  //         // 4. Einstein Vision の予測結果を返信する
  //         const _predictresponse = predictresponse;
  //         const messageToBeSent = {
  //           type:'text',
  //           text: `画像の分析の結果、 "${_predictresponse}" `
  //         };
  //         return sendMessage(messageToBeSent, replyToken);
  //       });
  //     });
  //   });
  // });


  // client.getMessageContent(message.id)
  //   .then((stream) => {
  //     // stream.setEncoding('utf8');
  //     stream.on('data', (chunk) => {
  //       const data = Buffer.from(chunk);
  //       const targetImageBase64 = data.toString('base64');
  //       let _type;
  //       visionService.instance.imageClassify(targetImageBase64)
  //         .then(type => {
  //           _type = type;
  //           console.log('type: ' + _type);
  //           // return salesforceService.instance.findHouses(_type);
  //         }).then(houses => sendMessage(
  //           [
  //             {
  //               type:'text',
  //               text: `画像の分析の結果、 "${_type}" `
  //             },
  //             // formatter.formatProperties(houses)
  //           ],
  //           replyToken
  //         )).catch((err) => {
  //           // POST failed...
  //           console.log('err: ' + err);
  //         })
  //       ;
  //     });

  //     stream.on('error', (err) => {
  //       // error handling
  //       console.log('err: ' + err);
  //     });
  //   })
  // ;
}

export const handleVideo = (message, replyToken) => {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);
  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // FFmpeg and ImageMagick is needed here to run 'convert'. Please consider about security and performance by yourself
      cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);
      // return client.replyMessage(
      //   replyToken,
      //   {
      //     type: 'video',
      //     originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
      //     previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
      //   }
      // );
    });
}

export const handleAudio = (message, replyToken) => {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);
  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // return client.replyMessage(
      //   replyToken,
      //   {
      //     type: 'audio',
      //     originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
      //     duration: 1000,
      //   }
      // );
    });
}

const handleLocation = (message, replyToken) => {
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

const handleSticker = (message, replyToken) => {
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

