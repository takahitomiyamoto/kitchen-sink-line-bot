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
    let accessToken;
    rp(options)
      .then((data) => {
        // const data = JSON.parse(body);
        accessToken = data['access_token'];
        console.log('accessToken: ' + accessToken);
      })
      .catch((err) => {
        console.log(err);
      })
    ;
    return accessToken;
  }

  public imageClassify = (targetImage) => {
    return new Promise((resolve, reject) => {
      // call Image Classification API
      const tokenOptions = this.createTokenOptions();
      const accessToken = this.getAccessToken(tokenOptions)
        // .then((accessToken) => {
      const predictOpitions = this.createPredictOptions(targetImage, accessToken);
        // })
        // .then((options) => {
      rp(predictOpitions)
        .then((body) => {
          // POST succeeded...
          resolve(circularJSON.stringify(body));
        })
        .catch((err) => {
          // POST failed...
          console.log(err);
          reject(err);
        })
      ;
        // })
      // ;
      // setTimeout(() => {
      //   resolve('★★★');
      // }, 1000);
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
