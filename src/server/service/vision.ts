import * as circularJSON from 'circular-json';
import * as rp from 'request-promise';
import * as jwt from 'jsonwebtoken';

export class VisionService {
  private static _visionService: VisionService = new VisionService();
  // private static _accessToken = VisionService.getAccessToken();

  private constructor() {}
  public static get instance(): VisionService {
    return VisionService._visionService;
  }

  // public static get accessToken() {
  //   return VisionService._accessToken;
  // }

  private static getAccessToken() {
    const tokenOptions = VisionService.createTokenOptions();
    console.log('tokenOptions: ' + tokenOptions);
    return new Promise((resolve, reject) => {
      rp(tokenOptions)
        .then((data) => {
          // console.log('data: ' + circularJSON.stringify(data));
          const accessToken = data['access_token'];
          resolve(accessToken)
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        })
      ;
    });
  }

  private static createTokenOptions() {
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

  private createPredictOptions(targetImage, accessToken) {
    const url = process.env.EINSTEIN_VISION_URL + process.env.EINSTEIN_API_VERSION;
    const reqUrl = url + '/vision/predict';
    const modelId = process.env.EINSTEIN_VISION_MODEL_ID;
    const options = {
      method: 'POST',
      uri: reqUrl,
      timeout: 3000,
      body: {
        'modelId': modelId,
        'numResults': 1,
        'sampleBase64Content': targetImage
      },
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Cache-Control': 'no-cache',
        'Content-Type': 'multipart/form-data'
      },
      json: true
    };
    return options;
  }

  // private static getAccessToken(options) {
  //   return new Promise((resolve, reject) => {
  //     // let accessToken;
  //     rp(options)
  //       .then((data) => {
  //         // const data = JSON.parse(body);
  //         const accessToken = data['access_token'];
  //         // console.log('0: accessToken: ' + accessToken);
  //         resolve(accessToken)
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         reject(err);
  //       })
  //     ;
  //   });
  // }

  // private static createTokenOptions = new Promise((resolve, reject) => {
  //   console.log('#################### 1. createTokenOptions ####################');
  //   const tokenOptions = this.createTokenOptions();
  //   resolve(tokenOptions);
  // });

  // private static getAccessToken = (tokenOptions, counter) => new Promise((resolve, reject) => {
  //   console.log('#################### 2. getAccessToken ####################');
  //   console.log('#################### counter: ' + counter);
  //   // 2回目以降は取得しない
  //   if (counter > 1) {
  //     return;
  //   }
  //   const ACCESS_TOKEN = this.getAccessToken(tokenOptions);
  //   resolve(ACCESS_TOKEN);
  // });

  public imageClassify = (targetImage) => {
    // const createPredictOptions = (accessToken) => new Promise((resolve, reject) => {
      //   console.log('#################### 3. createPredictOptions ####################');
      //   const predictOpitions = this.createPredictOptions(targetImage, accessToken);
      //   console.log('#################### accessToken: ' + accessToken);
      //   resolve(predictOpitions);
      // });
    const requestPredict = (predictOpitions) => {
      return new Promise((resolve, reject) => {
        rp(predictOpitions)
          .then((body) => {
            // POST succeeded...
            console.log('#################### body: ' + circularJSON.stringify(body));
            resolve(circularJSON.stringify(body));
          }).catch((err) => {
            // POST failed...
            console.log('#################### err: ' + err);
            reject(err);
          })
        ;
      });
    };

    const promise = Promise.reject('').catch(() => {
      VisionService.getAccessToken().then((accessToken) => {
        console.log('accessToken: ' + circularJSON.stringify(accessToken));
        const predictOpitions = this.createPredictOptions(targetImage, accessToken);
        requestPredict(predictOpitions);
      });
    });

    return promise;

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
  }

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

  public objectDetect = (targetImage) => {
    return new Promise((resolve, reject) => {
      // call Object Detection API
      setTimeout(() => {
        resolve('★★★');
      }, 1000);
    });
  }
}
