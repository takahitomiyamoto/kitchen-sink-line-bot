import * as circularJSON from 'circular-json';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
import { configLine } from '../config/line';
import { LineService as lineService } from '../service/line';
import { VisionService as visionService } from '../service/vision';
import { SalesforceService as salesforceService } from '../service/salesforce';

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
            return lineService.instance.handleSticker(message, event.replyToken);
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
    switch (message.text) {
      // start initial communication
      case (lineService.instance.hasInitalMessage(message.text) && message.text):
        return lineService.instance.initalMessage(replyToken);
      // continue communication
      case (lineService.instance.hasContinueMessage(message.text) && message.text):
        return lineService.instance.continueMessage(replyToken);
      // stop communication
      case (lineService.instance.hasStopMessage(message.text) && message.text):
        return lineService.instance.stopMessage(replyToken);
      // start next communication
      case (lineService.instance.hasLocationQuestion(message.text) && message.text):
        return lineService.instance.requestImage(replyToken);
      default:
        console.log(`Echo message to ${replyToken}: ${message.text}`);
        return lineService.instance.defaultMessage(replyToken);
    }
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
}