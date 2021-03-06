import * as circularJSON from 'circular-json';
import * as cp from 'child_process';
import { configLine } from '../config/line';
import { LineService as lineService } from '../service/line';
import { VisionService as visionService } from '../service/vision';
import { GoogleService as googleService } from '../service/google';

export class LineController {
  private static _lineController: LineController = new LineController();
  private constructor() {}
  public static get instance(): LineController {
    return LineController._lineController;
  }

  // callback function to handle a single event
  public handleEvent = (event) => {
    console.log('event: ' + circularJSON.stringify(event));
    switch (event.type) {
      case 'message':
        const message = event.message;
        switch (message.type) {
          case 'text':
            return this.handleText(message, event.replyToken, event.source);
          case 'image':
            return this.handleImage(message, event.replyToken);
          case 'video':
            // return handleVideo(message, event.replyToken);
          case 'audio':
            // return handleAudio(message, event.replyToken);
          case 'location':
            // return handleLocation(message, event.replyToken);
          case 'sticker':
            return lineService.instance.defaultMessage(event.replyToken, []);
          default:
            throw new Error(`Unknown message: ${JSON.stringify(message)}`);
        }
      case 'follow':
        return lineService.instance.replyText(event.replyToken, 'Got followed event');
      case 'unfollow':
        return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);
      case 'join':
        return lineService.instance.replyText(event.replyToken, `Joined ${event.source.type}`);
      case 'leave':
        return console.log(`Left: ${JSON.stringify(event)}`);
      case 'postback':
        let data = event.postback.data;
        if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
          data += `(${JSON.stringify(event.postback.params)})`;
        }
        return lineService.instance.replyText(event.replyToken, `Got postback: ${data}`);
      case 'beacon':
        return lineService.instance.replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);
      default:
        throw new Error(`Unknown event: ${JSON.stringify(event)}`);
    }
  }

  public handleText = (message, replyToken, source) => {
    console.log('handleText');
    const hasInitalMessage = (text) => lineService.instance.hasInitalMessage(text);
    const initalMessage = (replyToken) => lineService.instance.initalMessage(replyToken);
    const hasContinueMessage =(text) => lineService.instance.hasContinueMessage(text);
    const continueMessage = (replyToken) => lineService.instance.continueMessage(replyToken);
    const hasStopMessage = (text) => lineService.instance.hasStopMessage(text);
    const isSad = (text) => lineService.instance.isSad(text);
    const stopMessage = (replyToken, isSad) => lineService.instance.stopMessage(replyToken, isSad);
    const hasLocationQuestion = (text) => lineService.instance.hasLocationQuestion(text);
    const requestImage = (replyToken) => lineService.instance.requestImage(replyToken);
    const defaultMessage = (replyToken, sticker) => lineService.instance.defaultMessage(replyToken, sticker);

    this.getSentimentSticker(message.text)
    .then((sticker) => {
      switch (message.text) {
        // start initial communication
        case (hasInitalMessage(message.text) && message.text):
          console.log('initalMessage');
          return initalMessage(replyToken);
        // continue communication
        case (hasContinueMessage(message.text) && message.text):
          console.log('continueMessage');
          return continueMessage(replyToken);
        // stop communication
        case (hasStopMessage(message.text) && message.text):
          console.log('stopMessage');
          return stopMessage(replyToken, isSad(message.text));
        // start next communication
        case (hasLocationQuestion(message.text) && message.text):
          console.log('requestImage');
          return requestImage(replyToken);
        default:
          console.log('defaultMessage');
          return defaultMessage(replyToken, sticker);
      }
    })
  }

  public handleImage = (message, replyToken) => {
    console.log('handleImage');
    console.log('message: ' + circularJSON.stringify(message));
    console.log('replyToken: ' + replyToken);
    const downloadFile = `${message.id}.jpg`;
    const previewFile = `${message.id}-preview.jpg`;
    const downloadFileUploaded = `/uploaded/${downloadFile}`;
    const previewFileUploaded = `/uploaded/${previewFile}`;
    const targetFile = `${lineService.instance.baseURL}${downloadFileUploaded}`;
    const downloadContent = lineService.instance.downloadContent(message.id, downloadFile);
    const getAccessToken = visionService.instance.getAccessToken();
    const getObjectDetection = (target, accessToken) => visionService.instance.getObjectDetection(target, accessToken, replyToken);

    Promise.all([downloadContent])
    .then((downloadFile) => {
      cp.execSync(`convert -resize 240x jpeg:${downloadFile} jpeg:${previewFile}`);
      cp.execSync(`mv ${downloadFile} .${downloadFileUploaded}`);
      cp.execSync(`mv ${previewFile} .${previewFileUploaded}`);
      // return lineService.instance.client.replyMessage(
      //   replyToken,
      //   {
      //     type: 'image',
      //     originalContentUrl: `${lineService.instance.baseURL}${downloadFileUploaded}`,
      //     previewImageUrl: `${lineService.instance.baseURL}${downloadFileUploaded}`
      //   }
      // );
    }).then(() => {
      Promise.all([getAccessToken])
      .then((accessToken) => {
        console.log('accessToken: ' + accessToken);
        Promise.all([getObjectDetection(targetFile, accessToken)])
      }).catch((error) => {
        console.log('error: ' + circularJSON.stringify(error));
      });
    })
  }

  private getSentimentSticker = (text_JA) => {
    const getTranslation = (text_JA, accessToken) => googleService.instance.getTranslation(text_JA, accessToken);
    const getAccessToken = visionService.instance.getAccessToken();
    const getSentiment = (text_EN, accessToken) => visionService.instance.getSentiment(text_EN, accessToken);
    const getSticker = (sentiment) => lineService.instance.getSticker(sentiment);

    return new Promise((resolve, reject) => {
      Promise.all([getAccessToken])
      .then((accessToken) => {
        // messageを英語に翻訳
        console.log('text_JA: ' + circularJSON.stringify(text_JA));
        Promise.all([getTranslation(text_JA, accessToken)])
        .then((values: any) => {
          console.log('values: ' + circularJSON.stringify(values));
          const values_0 = values[0];
          const text_EN = values_0.text_EN;
          const accessToken = values_0.accessToken;
          // 感情分析する
          Promise.all([getSentiment(text_EN, accessToken)])
          .then((sentiment: any) => {
            // 得られた感情に対するスタンプを取得する
            console.log('sentiment: ' + circularJSON.stringify(sentiment));
            const sentiment_0_text = sentiment[0].text;
            Promise.all([getSticker(sentiment_0_text)])
            .then((sticker) => {
              console.log('sticker: ' + circularJSON.stringify(sticker));
              resolve(sticker);
            })
          })
        })
      }).catch((error) => {
        console.log('error: ' + circularJSON.stringify(error));
        reject(error);
      });
    });
  }


}