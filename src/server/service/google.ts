import * as circularJSON from 'circular-json';
import * as rp from 'request-promise';
import { LineService as lineService } from '../service/line';

// Imports the Google Cloud client library
const Translate = require('@google-cloud/translate');
// Your Google Cloud Platform project ID
const projectId = process.env.GCP_PROJECT_ID;
const client_email = process.env.GCP_CLIENT_EMAIL;
const private_key = process.env.GCP_PRIVATE_KEY;
// Creates a client
const translate = new Translate({
  projectId: projectId,
  credentials: {
    client_email: client_email,
    private_key: private_key
  }
});

export class GoogleService {
  private static _googleService: GoogleService = new GoogleService();
  private constructor() {}
  public static get instance(): GoogleService {
    return GoogleService._googleService;
  }

  public getTranslation = (text_JA, accessToken_sf) => {
    // const translationOptions = this.createTranslationOptions(text_JA);
    return new Promise((resolve, reject) => {
      // rp(translationOptions)
      // .then((data) => {
      //   console.log('data: ' + circularJSON.stringify(data));
      //   let values = {
      //     text_EN: text_JA,
      //     accessToken: accessToken_sf
      //   };
      //   resolve(values)
      // })
      // .catch((err) => {
      //   console.log(err);
      //   reject(err);
      // });
      const text = 'こんにちは。お元気ですか？'; //text_JA;  //'The text to translate, e.g. Hello, world!';
      const target = 'en'; //'The target language, e.g. ru';

      /*
       * Translates the text into the target language. "text" can be a string for
       * translating a single piece of text, or an array of strings for translating
       * multiple texts.
       */
      translate
      // .detect(text, target)
      .translate(text, target)
      .then((results) => {
        let translations = results[0];
        translations = Array.isArray(translations) ? translations : [translations];

        console.log('Translations:');
        translations.forEach((translation, i) => {
          console.log(`${text[i]} => (${target}) ${translation}`);
          let values = {
            text_EN: translation,
            accessToken: accessToken_sf
          };
          resolve(values)
        });
      }).catch((err) => {
        console.error('ERROR:', err);
      });
    });
  }

  // private createTranslationOptions(text_JA) {
  //   const url = process.env.EINSTEIN_VISION_URL + process.env.EINSTEIN_API_VERSION;
  //   const reqUrl = url + '/language/sentiment';
  //   const modelId = process.env.EINSTEIN_LANGUAGE_SENTIMENT_MODEL_ID;
  //   const formData = {
  //     modelId: modelId,
  //     document: text
  //   };
  //   const options = {
  //     method: 'POST',
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
}
