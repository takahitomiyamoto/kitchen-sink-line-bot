import * as circularJSON from 'circular-json';
import * as rp from 'request-promise';
import * as jwt from 'jsonwebtoken';
import * as request from 'request';
import { LineService as lineService } from '../service/line';

export class VisionService {
  private static _visionService: VisionService = new VisionService();

  private constructor() {}
  public static get instance(): VisionService {
    return VisionService._visionService;
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

  private postDetect = (detectOptions) => {
    return new Promise((resolve, reject) => {
      rp(detectOptions)
      .then((data) => {
        console.log('data: ' + circularJSON.stringify(data));
        resolve(data)
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  };

  private postSentiment = (sentimentOptions) => {
    return new Promise((resolve, reject) => {
      rp(sentimentOptions)
      .then((data) => {
        console.log('data: ' + circularJSON.stringify(data));
        resolve(data)
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  };

  private createMessageForDetection = (predictresponse) => {
    const probabilities = (predictresponse[0])['probabilities'];
    probabilities.sort((a, b) => {
      if (a.probability > b.probability) { return -1; }
      if (a.probability < b.probability) { return 1; }
      return 0;
    });
    console.log(probabilities);

    let textMsg = '';
    const _count = probabilities.length;
    if (_count === 0) {
      textMsg = '家が見つかりません。';
    } else {
      const _probabilities_0 = probabilities[0];
      const _label = _probabilities_0.label;
      const _probability = Math.round(_probabilities_0.probability * 100);
      textMsg = `${_count}個 見つかりました。たとえば ${_probability}% の確率で ${_label} があります。`;
    }
    const messageToBeSent = {
      type:'text',
      text: textMsg
    };
    return messageToBeSent;
  };

  // TODO: createMessageForDetection と共通化する
  private createMessageForSentiment = (predictresponse) => {
    const probabilities = (predictresponse[0])['probabilities'];
    probabilities.sort((a, b) => {
      if (a.probability > b.probability) { return -1; }
      if (a.probability < b.probability) { return 1; }
      return 0;
    });
    console.log(probabilities);

    let textMsg = '';
    const _count = probabilities.length;
    if (_count === 0) {
      textMsg = '';
    } else {
      const _probabilities_0 = probabilities[0];
      const _label = _probabilities_0.label;
      // const _probability = Math.round(_probabilities_0.probability * 100);
      textMsg = _label;
    }
    const messageToBeSent = {
      type:'text',
      text: textMsg
    };
    return messageToBeSent;
  };

  public getObjectDetection = (targetImage, accessToken, replyToken) => {
    const sendMessage = (messageToBeSent) => {
      lineService.instance.sendMessage(messageToBeSent, replyToken);
    };
    const detectOptions = this.createDetectOptions(targetImage, accessToken);
    console.log('detectOptions: ' + circularJSON.stringify(detectOptions));

    return new Promise((resolve, reject) => {
      Promise.all([this.postDetect(detectOptions)])
      .then((data) => {
        return this.createMessageForDetection(data);
      }).then((messageToBeSent) => {
        console.log('messageToBeSent: ' + circularJSON.stringify(messageToBeSent));
        return sendMessage(messageToBeSent);
      })
      .catch((err) => {
        console.log(err);
      });
    });
  }

  public getSentiment = (text, accessToken) => {
    const sentimentOptions = this.createSentimentOptions(text, accessToken);
    console.log('sentimentOptions: ' + circularJSON.stringify(sentimentOptions));

    return new Promise((resolve, reject) => {
      Promise.all([this.postSentiment(sentimentOptions)])
      .then((data) => {
        console.log('getSentiment data: ' + circularJSON.stringify(data));
        return this.createMessageForDetection(data);
      }).then((messageToBeSent) => {
        console.log('messageToBeSent: ' + circularJSON.stringify(messageToBeSent));
        resolve(messageToBeSent);
      })
      .catch((err) => {
        console.log(err);
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
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(assertion)}&scope=offline`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
      json: true
    };
    return options;
  }

  // private createPredictOptions(targetImage, accessToken) {
  //   const url = process.env.EINSTEIN_VISION_URL + process.env.EINSTEIN_API_VERSION;
  //   const reqUrl = url + '/vision/predict';
  //   const modelId = process.env.EINSTEIN_VISION_PREDICT_MODEL_ID;
  //   const formData = {
  //     modelId: modelId,
  //     numResults: 3,
  //     sampleBase64Content: targetImage
  //   };
  //   const options = {
  //     url: reqUrl,
  //     headers: {
  //       'Authorization': 'Bearer ' + accessToken,
  //       'Cache-Control': 'no-cache',
  //       'Content-Type': 'multipart/form-data'
  //     },
  //     formData: formData,
  //     timeout: 60000,
  //     json: true
  //   };
  //   return options;
  // }

  private createDetectOptions(targetImage, accessToken) {
    const url = process.env.EINSTEIN_VISION_URL + process.env.EINSTEIN_API_VERSION;
    const reqUrl = url + '/vision/detect';
    const modelId = process.env.EINSTEIN_VISION_DETECT_MODEL_ID;
    const formData = {
      modelId: modelId,
      // numResults: 3,
      sampleLocation: targetImage
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
  }

  private createSentimentOptions(text, accessToken) {
    const url = process.env.EINSTEIN_VISION_URL + process.env.EINSTEIN_API_VERSION;
    const reqUrl = url + '/language/sentiment';
    const modelId = process.env.EINSTEIN_LANGUAGE_SENTIMENT_MODEL_ID;
    const formData = {
      modelId: modelId,
      document: text
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
  }
}
