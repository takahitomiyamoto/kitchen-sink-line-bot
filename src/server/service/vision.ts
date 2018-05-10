import * as circularJSON from 'circular-json';
import * as rp from 'request-promise';
import * as jwt from 'jsonwebtoken';

export class VisionService {
  private static _visionService: VisionService = new VisionService();
  private constructor() {}
  public static get instance(): VisionService {
    return VisionService._visionService;
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

  private getAccessToken(options) {
    return new Promise((resolve, reject) => {
      // let accessToken;
      rp(options)
        .then((data) => {
          // const data = JSON.parse(body);
          const accessToken = data['access_token'];
          // console.log('0: accessToken: ' + accessToken);
          resolve(accessToken)
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        })
      ;
    });
  }

  private increment = (counter) => {
    console.log('####################' + (counter + 1) + '####################');
  }

  public imageClassify = (targetImage) => {
    // let createTokenOptions = new Promise((resolve, reject) => {
    //   console.log('#################### 1 ####################');
    //   const tokenOptions = this.createTokenOptions();
    //   resolve(tokenOptions);
    // });
    let counter = 0;
    return new Promise((resolve, reject) => {
      this.increment(counter);
      // return this.createTokenOptions();
      const tokenOptions = this.createTokenOptions();
      resolve(tokenOptions);
    }).then((tokenOptions) => {
      this.increment(counter);
      return new Promise((resolve, reject) => {
        resolve(this.getAccessToken(tokenOptions));
      })
    }).then((accessToken) => {
      this.increment(counter);
      // let access_token;
      // if (undefined === accessToken) {
      //   return;
      // }
      const access_token = accessToken;
      console.log('access_token: ' + access_token);
      return this.createPredictOptions(targetImage, access_token);
    }).then((predictOpitions) => {
      this.increment(counter);
      return new Promise((resolve, reject) => {
        rp(predictOpitions)
          .then((body) => {
            // POST succeeded...
            resolve(circularJSON.stringify(body));
          }).catch((err) => {
            // POST failed...
            console.log(err);
            reject(err);
          })
        ;
      });
    });
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
