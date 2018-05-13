import * as circularJSON from 'circular-json';
import * as rp from 'request-promise';
import { LineService as lineService } from '../service/line';

// Imports the Google Cloud client library
const Translate = require('@google-cloud/translate');
const projectId = process.env.GCP_PROJECT_ID;
const client_email = process.env.GCP_CLIENT_EMAIL;
const private_key = process.env.GCP_PRIVATE_KEY;
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
    return new Promise((resolve, reject) => {
      const accessToken = accessToken_sf[0];
      const text = text_JA;
      const target = 'en';

      translate.translate(text, target)
      .then((results) => {
        let translations = results[0];
        translations = Array.isArray(translations) ? translations : [translations];
        const text_EN = translations[0];
        const values = {
          'text_EN': text_EN,
          'accessToken': accessToken
        };
        resolve(values);
      }).catch((err) => {
        console.error('ERROR:', err);
      });
    });
  }
}
