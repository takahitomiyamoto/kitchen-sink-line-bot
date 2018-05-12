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

  public getMessageContent(messageId, callback) {
    const options = {
      uri: 'https://api.line.me/v2/bot/message/' + messageId + '/content',
      headers: {
        'Authorization': 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN,
        'Content-Type': 'multipart/form-data'
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
        console.log('expires_in: ' + data['expires_in']);
        resolve(accessToken)
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  }

  public getImageClassification(targetImage, accessToken) {
    const predictOptions = this.createPredictOptions(targetImage, accessToken);
    return new Promise((resolve, reject) => {
      try {
      request.post(predictOptions, (error, response, body) => {
        if (error) {
          reject(error)
        }
        if (response['statusCode'] === 200) {
          resolve(body);
        }
        reject(circularJSON.stringify(body));
      })
      } catch(err) {
        reject(err);
      }
    });
  }

  public getObjectDetection = (targetImage, accessToken) => {
    return new Promise((resolve, reject) => {
      const detectOptions = this.createDetectOptions(targetImage, accessToken);
      console.log('detectOptions: ' + circularJSON.stringify(detectOptions));
    // }).then((detectOptions: any) => {
      // return new Promise((resolve, reject) => {
      //   rp(detectOptions)
      // .then((data) => {
      //   console.log('data: ' + circularJSON.stringify(data));
      // // const accessToken = data['access_token'];
      // //   console.log('expires_in: ' + data['expires_in']);
      //   // resolve(data)
      //   return data;
      // })
      // .catch((err) => {
      //   console.log(err);
      //   // reject(err);
      // });
      try {
      request.post(detectOptions, (error, response, body) => {
        console.log('error: ' + circularJSON.stringify(error));
        console.log('response: ' + circularJSON.stringify(response));
        // console.log('body: ' + circularJSON.stringify(body));
        if (error) {
          reject(error)
        }
        if (response['statusCode'] === 200) {
          console.log('---------------------------------------- OK ---------------------------------------- ' + circularJSON.stringify(body));
          resolve(body);
        }
        reject(circularJSON.stringify(body));
      })
      } catch(err) {
        reject(err);
      }
    // });
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
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(assertion)}&scope=offline`,
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
    const formData = {
      modelId: modelId,
      numResults: 3,
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
      timeout: 60000,
      json: true
    };
    return options;
  }

  private createDetectOptions(targetImage, accessToken) {
    // return new Promise((resolve, reject) => {
    const url = process.env.EINSTEIN_VISION_URL + process.env.EINSTEIN_API_VERSION;
    const reqUrl = url + '/vision/detect';
    const modelId = process.env.EINSTEIN_VISION_MODEL_ID;
    const formData = {
      modelId: modelId,
      numResults: 3,
      // sampleLocation: 'https://einstein.ai/images/alpine.jpg'
      sampleLocation: targetImage
      // sampleContent: '/uploaded/alpine.jpg'
    };
    const options = {
      method: 'POST',
      url: reqUrl,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Cache-Control': 'no-cache',
        'Content-Type': 'multipart/form-data'
      },
      formData: formData,
      timeout: 60000,
      json: true
    };
    return options;
    // resolve(options);
    // })
  }
}
