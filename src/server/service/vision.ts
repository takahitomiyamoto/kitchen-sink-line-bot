import * as circularJSON from 'circular-json';
import * as rp from 'request-promise';
import * as jwt from 'jsonwebtoken';
import * as request from 'request';

export class VisionService {
  private static _visionService: VisionService = new VisionService();

  private constructor() {}
  public static get instance(): VisionService {
    return VisionService._visionService;
  }

  public getAccessToken_(callback) {
    const tokenOptions = this.createTokenOptions();
    console.log('tokenOptions: ' + tokenOptions);
    // return new Promise((resolve, reject) => {
      rp(tokenOptions)
      .then((data) => {
        const accessToken = data['access_token'];
        return callback(accessToken);
      })
      .catch((err) => {
        console.log(err);
      });
    // });
  }

  public getMessageContent_(messageId) {
    const options = {
      uri: 'https://api.line.me/v2/bot/message/' + messageId + '/content',
      headers: {
        'Authorization': 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN
      },
      json: true
    };
    return new Promise((resolve, reject) => {
      rp(options)
      .then((chunk) => {
        const data = Buffer.from(chunk);
        const targetImageBase64 = data.toString('base64');
        resolve(targetImageBase64);
      })
      .catch((err) => {
        console.log(err);
      });
    });
  }

  public getMessageContent(messageId, callback) {
    const options = {
      uri: 'https://api.line.me/v2/bot/message/' + messageId + '/content',
      headers: {
        'Authorization': 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN
      },
      json: true
    };
    console.log('options: ' + options);
    // return new Promise((resolve, reject) => {
      rp(options)
      .then((chunk) => {
        const data = Buffer.from(chunk);
        const targetImageBase64 = data.toString('base64');
        return callback(targetImageBase64);
      })
      .catch((err) => {
        console.log(err);
      });
    // });
  }

  public getAccessToken() {
    const tokenOptions = this.createTokenOptions();
    console.log('tokenOptions: ' + tokenOptions);
    return new Promise((resolve, reject) => {
      rp(tokenOptions)
      .then((data) => {
        const accessToken = data['access_token'];
        resolve(accessToken)
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  }

  private createTokenOptions() {
    const url = process.env.EINSTEIN_VISION_URL + process.env.EINSTEIN_API_VERSION;
    const private_key = process.env.EINSTEIN_VISION_PRIVATE_KEY;
    const account_id = process.env.EINSTEIN_VISION_ACCOUNT_ID;
    const reqUrl = url + '/oauth2/token';
    const rsa_payload = {
      "sub": account_id,
      "aud": reqUrl
    };
    const rsa_options = {
      header: {
        "alg": "RS256",
        "typ": "JWT"
      },
      expiresIn: '1m'
    };
    const assertion = jwt.sign(
      rsa_payload,
      private_key,
      rsa_options
    );
    const options = {
      method: 'POST',
      uri: reqUrl,
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(assertion)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
      json: true
    };
    return options;
  }

  public getImageClassification_(targetImage, accessToken, callback) {
    const predictOptions = this.createPredictOptions(targetImage, accessToken);
    console.log('predictOptions: ' + predictOptions);
    // return new Promise((resolve, reject) => {
      request.post(predictOptions, (error, response, body) => {
        console.log('error: ' + circularJSON.stringify(error));
        console.log('response: ' + circularJSON.stringify(response));
        console.log('body: ' + circularJSON.stringify(body));
        if (error) {
          console.log(error);
        }
        const predictresponse = circularJSON.stringify(body);
        return callback(predictresponse);
      });
      // .then((body) => {
      //   resolve(body);
      // })
      // .catch((err) => {
      //   console.log(err);
      //   reject(err);
      // });
    // });
  }

  public getImageClassification(targetImage, accessToken) {
    const predictOptions = this.createPredictOptions(targetImage, accessToken);
    console.log('predictOptions: ' + predictOptions);
    return new Promise((resolve, reject) => {
      request.post(predictOptions, (error, response, body) => {
        console.log('error: ' + circularJSON.stringify(error));
        console.log('response: ' + circularJSON.stringify(response));
        console.log('body: ' + circularJSON.stringify(body));
        if (error) {
          reject(error)
        }
        resolve(body);
      });
      // .then((body) => {
      //   resolve(body);
      // })
      // .catch((err) => {
      //   console.log(err);
      //   reject(err);
      // });
    });
  }

  private createPredictOptions(targetImage, accessToken) {
    const url = process.env.EINSTEIN_VISION_URL + process.env.EINSTEIN_API_VERSION;
    const reqUrl = url + '/vision/predict';
    const modelId = process.env.EINSTEIN_VISION_MODEL_ID;
    const formData = {
      modelId: modelId,
      sampleBase64Content: targetImage
    };
    const options = {
      url: reqUrl,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Cache-Control': 'no-cache',
        'Content-Type': 'multipart/form-data'
      },
      formData: formData,
      // method: 'POST',
      // uri: reqUrl,
      // timeout: 3000,
      // body: {
      //   'modelId': modelId,
      //   // 'numResults': 1,
      //   'sampleBase64Content': targetImage
      // },
      // headers: {
      //   'Authorization': 'Bearer ' + accessToken,
      //   'Cache-Control': 'no-cache',
      //   'Content-Type': 'multipart/form-data'
      // },
      json: true
    };
    return options;
  }

  public imageClassify = (targetImage) => {
    return new Promise((resolve, reject) => {
      // access_tokenを取得する
      this.getAccessToken()
      .then((accessToken) => {
        console.log('#################### getAccessToken accessToken: ' + accessToken);
        // 予測結果を取得する
        this.getImageClassification(targetImage, accessToken)
        .then((body) => {
          console.log('accessToken: ' + accessToken);
          console.log(circularJSON.stringify(body));
          resolve(circularJSON.stringify(body));
        })
        .catch((err) => {
          console.log('#################### getImageClassification err: ' + err);
          reject(err);
        });
      })
      .catch((err) => {
        console.log('#################### getAccessToken err: ' + err);
        reject(err);
      });
    });
  }

  public objectDetect = (targetImage) => {
    return new Promise((resolve, reject) => {
      // call Object Detection API
      setTimeout(() => {
        resolve('★★★');
      }, 1000);
    });
  }
}

    // const createPredictOptions = (accessToken) => new Promise((resolve, reject) => {
      //   console.log('#################### 3. createPredictOptions ####################');
      //   const predictOpitions = this.createPredictOptions(targetImage, accessToken);
      //   console.log('#################### accessToken: ' + accessToken);
      //   resolve(predictOpitions);
      // });
    // const requestPredict = (predictOpitions) => {
    //   return new Promise((resolve, reject) => {
    //     rp(predictOpitions)
    //       .then((body) => {
    //         // POST succeeded...
    //         console.log('#################### body: ' + circularJSON.stringify(body));
    //         resolve(circularJSON.stringify(body));
    //       }).catch((err) => {
    //         // POST failed...
    //         console.log('#################### err: ' + err);
    //         reject(err);
    //       })
    //     ;
    //   });
    // };

    // const promise = Promise.reject('').catch(() => {
    //   VisionService.getAccessToken().then((accessToken) => {
    //     console.log('accessToken: ' + circularJSON.stringify(accessToken));
    //     const predictOpitions = this.createPredictOptions(targetImage, accessToken);
    //     requestPredict(predictOpitions);
    //   });
    // });

    // return promise;

    // return new Promise((resolve, reject) => {
      // const accessToken = VisionService.getAccessToken();
      // console.log('accessToken: ' + circularJSON.stringify(accessToken));
      // const predictOpitions = this.createPredictOptions(targetImage, accessToken);
      // requestPredict(predictOpitions);
      // VisionService.getAccessToken().then((accessToken) => {
      //   console.log('accessToken: ' + circularJSON.stringify(accessToken));
      //   const predictOpitions = this.createPredictOptions(targetImage, accessToken);
      //   requestPredict(predictOpitions);
      // });
    // });

    // return new Promise((resolve, reject) => {
    //   const accessToken = VisionService.accessToken;
    //   console.log('accessToken: ' + accessToken);
    //   return createPredictOptions(accessToken);
    // }).then((predictOpitions) => {
    //   return requestPredict(predictOpitions);
    //   });
    // });
    // let counter = 0;
    // return new Promise((resolve, reject) => {
    //   this.logger('createTokenOptions: ' + counter);
    //   // return this.createTokenOptions();
    //   const tokenOptions = this.createTokenOptions();
    //   resolve(tokenOptions);
    // }).then((tokenOptions) => {
    //   counter = this.increment(counter);
    //   return new Promise((resolve, reject) => {
    //     resolve(this.getAccessToken(tokenOptions));
    //   })
    // }).then((accessToken) => {
    //   counter = this.increment(counter);
    //   // let access_token;
    //   // if (undefined === accessToken) {
    //   //   return;
    //   // }
    //   const access_token = accessToken;
    //   console.log('access_token: ' + access_token);
    //   return this.createPredictOptions(targetImage, access_token);
    // }).then((predictOpitions) => {
    //   counter = this.increment(counter);
    //   return new Promise((resolve, reject) => {
    //     rp(predictOpitions)
    //       .then((body) => {
    //         // POST succeeded...
    //         resolve(circularJSON.stringify(body));
    //       }).catch((err) => {
    //         // POST failed...
    //         console.log(err);
    //         reject(err);
    //       })
    //     ;
    //   });
    // });

    // return new Promise((resolve, reject) => {
      // call Image Classification API
      // const tokenOptions = this.createTokenOptions();
      // console.log('--------------------');
      // console.log('tokenOptions: ' + circularJSON.stringify(tokenOptions));
      // this.getAccessToken(tokenOptions)
        // .then((accessToken) => {
          // console.log('--------------------');
          // console.log('1: accessToken: ' + accessToken);
          // const predictOpitions = this.createPredictOptions(targetImage, accessToken);
          // console.log('--------------------');
          // console.log('predictOpitions: ' + circularJSON.stringify(predictOpitions));
      //     rp(predictOpitions)
      //       .then((body) => {
      //         // POST succeeded...
      //         resolve(circularJSON.stringify(body));
      //       })
      //       .catch((err) => {
      //         // POST failed...
      //         console.log(err);
      //         reject(err);
      //       })
      //     ;
      //   })
      // ;
      // setTimeout(() => {
      //   resolve('★★★');
      // }, 1000);
