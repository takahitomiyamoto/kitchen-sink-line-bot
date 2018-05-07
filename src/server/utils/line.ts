import * as Express from 'express';
import * as BodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as line from '@line/bot-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from'child_process';
import { configHeroku } from '../config/heroku';
import { configLine } from '../config/line';

export class LineUtils {
  private static _lineUtils: LineUtils = new LineUtils();

  // base URL for webhook server
  private baseURL: string;
  // create LINE SDK client
  private client;

  /**
   * Creates an instance of Main.
   * @memberof LineUtils
   */
  private constructor() {
    this.baseURL = configHeroku.baseURL;
    this.client = new line.Client(configLine);
  }

  public static get instance(): LineUtils {
    return LineUtils._lineUtils;
  }

  // simple reply function
  private replyText = (token, texts) => {
    texts = Array.isArray(texts) ? texts : [texts];
    return this.client.replyMessage(
      token,
      texts.map((text) => ({ type: 'text', text }))
    );
  }

  private handleText(message, replyToken, source) {
    const buttonsImageURL = `${this.baseURL}/static/buttons/1040.jpg`;

    switch (message.text) {
      case 'profile':
        if (source.userId) {
          return this.client.getProfile(source.userId)
            .then((profile) => this.replyText(replyToken, [
              `Display name: ${profile.displayName}`,
              `Status message: ${profile.statusMessage}`,
            ]))
          ;
        } else {
          return this.replyText(replyToken, 'Bot can\'t use profile API without user ID');
        }
      case 'buttons':
        return this.client.replyMessage(
          replyToken, {
            type: 'template',
            altText: 'Buttons alt text',
            template: {
              type: 'buttons',
              thumbnailImageUrl: buttonsImageURL,
              title: 'My button sample',
              text: 'Hello, my button',
              actions: [
                {
                  label: 'Go to line.me',
                  type: 'uri',
                  uri: 'https://line.me'
                },
                {
                  label: 'Say hello1',
                  type: 'postback',
                  data: 'hello こんにちは'
                },
                {
                  label: '言 hello2',
                  type: 'postback',
                  data: 'hello こんにちは',
                  text: 'hello こんにちは'
                },
                {
                  label: 'Say message',
                  type: 'message',
                  text: 'Rice=米'
                }
              ]
            }
          }
        );
      case 'confirm':
        return this.client.replyMessage(
          replyToken, {
            type: 'template',
            altText: 'Confirm alt text',
            template: {
              type: 'confirm',
              text: 'Do it?',
              actions: [
                {
                  label: 'Yes',
                  type: 'message',
                  text: 'Yes!'
                },
                {
                  label: 'No',
                  type: 'message',
                  text: 'No!'
                }
              ]
            }
          }
        )
      case 'carousel':
        return this.client.replyMessage(
          replyToken, {
            type: 'template',
            altText: 'Carousel alt text',
            template: {
              type: 'carousel',
              columns: [
                {
                  thumbnailImageUrl: buttonsImageURL,
                  title: 'hoge',
                  text: 'fuga',
                  actions: [
                    {
                      label: 'Go to line.me',
                      type: 'uri',
                      uri: 'https://line.me'
                    },
                    {
                      label: 'Say hello1',
                      type: 'postback',
                      data: 'hello こんにちは'
                    }
                  ]
                },
                {
                  thumbnailImageUrl: buttonsImageURL,
                  title: 'hoge',
                  text: 'fuga',
                  actions: [
                    {
                      label: '言 hello2',
                      type: 'postback',
                      data: 'hello こんにちは',
                      text: 'hello こんにちは'
                    },
                    {
                      label: 'Say message',
                      type: 'message',
                      text: 'Rice=米'
                    }
                  ]
                }
              ]
            }
          }
        );
      case 'image carousel':
        return this.client.replyMessage(
          replyToken, {
            type: 'template',
            altText: 'Image carousel alt text',
            template: {
              type: 'image_carousel',
              columns: [
                {
                  imageUrl: buttonsImageURL,
                  action: {
                    label: 'Go to LINE',
                    type: 'uri',
                    uri: 'https://line.me'
                  }
                },
                {
                  imageUrl: buttonsImageURL,
                  action: {
                    label: 'Say hello1',
                    type: 'postback',
                    data: 'hello こんにちは'
                  }
                },
                {
                  imageUrl: buttonsImageURL,
                  action: {
                    label: 'Say message',
                    type: 'message',
                    text: 'Rice=米'
                  }
                },
                {
                  imageUrl: buttonsImageURL,
                  action: {
                    label: 'datetime',
                    type: 'datetimepicker',
                    data: 'DATETIME',
                    mode: 'datetime'
                  }
                }
              ]
            }
          }
        );
      case 'datetime':
        return this.client.replyMessage(
          replyToken, {
            type: 'template',
            altText: 'Datetime pickers alt text',
            template: {
              type: 'buttons',
              text: 'Select date / time !',
              actions: [
                {
                  type: 'datetimepicker',
                  label: 'date',
                  data: 'DATE',
                  mode: 'date'
                },
                {
                  type: 'datetimepicker',
                  label: 'time',
                  data: 'TIME',
                  mode: 'time'
                },
                {
                  type: 'datetimepicker',
                  label: 'datetime',
                  data: 'DATETIME',
                  mode: 'datetime'
                }
              ]
            }
          }
        );
      case 'imagemap':
        return this.client.replyMessage(
          replyToken, {
            type: 'imagemap',
            baseUrl: `${this.baseURL}/static/rich`,
            altText: 'Imagemap alt text',
            baseSize: {
              width: 1040,
              height: 1040
            },
            actions: [
              {
                area: {
                  x: 0,
                  y: 0,
                  width: 520,
                  height: 520
                },
                type: 'uri',
                linkUri: 'https://store.line.me/family/manga/en'
              },
              {
                area: {
                  x: 520,
                  y: 0,
                  width: 520,
                  height: 520
                },
                type: 'uri',
                linkUri: 'https://store.line.me/family/music/en'
              },
              {
                area: {
                  x: 0,
                  y: 520,
                  width: 520,
                  height: 520
                },
                type: 'uri',
                linkUri: 'https://store.line.me/family/play/en'
              },
              {
                area: {
                  x: 520,
                  y: 520,
                  width: 520,
                  height: 520
                },
                type: 'message',
                text: 'URANAI!'
              }
            ]
          }
        );
      case 'bye':
        switch (source.type) {
          case 'user':
            return this.replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
          case 'group':
            return this.replyText(replyToken, 'Leaving group')
              .then(() => this.client.leaveGroup(source.groupId));
          case 'room':
            return this.replyText(replyToken, 'Leaving room')
              .then(() => this.client.leaveRoom(source.roomId));
        }
      default:
        console.log(`Echo message to ${replyToken}: ${message.text}`);
        return this.replyText(replyToken, message.text);
    }
  }

  private handleImage(message, replyToken) {
    const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
    const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

    return this.downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        // ImageMagick is needed here to run 'convert'. Please consider about security and performance by yourself
        cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);

        return this.client.replyMessage(replyToken, {
          type: 'image',
          originalContentUrl: this.baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: this.baseURL + '/downloaded/' + path.basename(previewPath)
        });
      })
    ;
  }

  private handleVideo(message, replyToken) {
    const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
    const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

    return this.downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        // FFmpeg and ImageMagick is needed here to run 'convert'. Please consider about security and performance by yourself
        cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);

        return this.client.replyMessage(replyToken, {
          type: 'video',
          originalContentUrl: this.baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: this.baseURL + '/downloaded/' + path.basename(previewPath)
        });
      })
    ;
  }

  private handleAudio(message, replyToken) {
    const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);

    return this.downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        return this.client.replyMessage(replyToken, {
          type: 'audio',
          originalContentUrl: this.baseURL + '/downloaded/' + path.basename(downloadPath),
          duration: 1000
        });
      })
    ;
  }

  private downloadContent(messageId, downloadPath) {
    return this.client.getMessageContent(messageId)
      .then((stream) => new Promise((resolve, reject) => {
        const writable = fs.createWriteStream(downloadPath);
        stream.pipe(writable);
        stream.on('end', () => resolve(downloadPath));
        stream.on('error', reject);
      }))
    ;
  }

  private handleLocation(message, replyToken) {
    return this.client.replyMessage(replyToken, {
      type: 'location',
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude
    });
  }

  private handleSticker(message, replyToken) {
    return this.client.replyMessage(replyToken, {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId
    });
  }

  // callback function to handle a single event
  public handleEvent(event) {
    switch (event.type) {
      case 'message':
        const message = event.message;
        switch (message.type) {
          case 'text':
            return this.handleText(message, event.replyToken, event.source);
          case 'image':
            return this.handleImage(message, event.replyToken);
          case 'video':
            return this.handleVideo(message, event.replyToken);
          case 'audio':
            return this.handleAudio(message, event.replyToken);
          case 'location':
            return this.handleLocation(message, event.replyToken);
          case 'sticker':
            return this.handleSticker(message, event.replyToken);
          default:
            throw new Error(`Unknown message: ${JSON.stringify(message)}`);
        }
      case 'follow':
        return this.replyText(event.replyToken, 'Got followed event');
      case 'unfollow':
        return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);
      case 'join':
        return this.replyText(event.replyToken, `Joined ${event.source.type}`);
      case 'leave':
        return console.log(`Left: ${JSON.stringify(event)}`);
      case 'postback':
        let data = event.postback.data;
        if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
          data += `(${JSON.stringify(event.postback.params)})`;
        }
        return this.replyText(event.replyToken, `Got postback: ${data}`);
      case 'beacon':
        return this.replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);
      default:
        throw new Error(`Unknown event: ${JSON.stringify(event)}`);
    }
  }
}