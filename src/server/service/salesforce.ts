import * as nforce from 'nforce';
import * as circularJSON from 'circular-json';

export class SalesforceService {
  private static _salesforceService: SalesforceService = new SalesforceService();
  private org: any;
  private options = {
    username : process.env.SF_USER_NAME,
    password : process.env.SF_PASSWORD,
    securitytoken: process.env.SF_SECURITY_TOKEN,
    clientId : process.env.SF_CLIENT_ID,
    clientSecret : process.env.SF_CLIENT_SECRET,
    redirectUri : process.env.SF_REDIRECT_URL,
    apiVersion : process.env.SF_API_VERSION,
    environment : process.env.SF_ENVIRONMENT,
    mode : process.env.SF_MODE,
    autoRefresh: true,
  };

  private constructor() {
    this.org = nforce.createConnection({
      clientId : this.options.clientId,
      clientSecret : this.options.clientSecret,
      redirectUri : this.options.redirectUri,
      apiVersion : this.options.apiVersion,
      environment : this.options.environment,
      mode : this.options.mode,
    });
  }

  public static get instance(): SalesforceService {
    return SalesforceService._salesforceService;
  }

  public sendFile = (replyToken, targetImage, count) => {
    console.log('replyToken: ' + replyToken);
    console.log('targetImage: ' + targetImage);
    console.log('count: ' + count);

    const lineImage = nforce.createSObject('LINE_Image__c');
    lineImage.set('Name', replyToken);
    lineImage.set('Image_URL__c', targetImage);
    lineImage.set('Number_of_Houses__c', count);

    this.org.authenticate({
      username : this.options.username,
      password : this.options.password + this.options.securitytoken
    }).then((resp) => {
      const oauth = resp;
      this.org.insert({
        sobject : lineImage,
        oauth : oauth
      });
    }).then(() => {
      console.log('Successfully inserted.');
    }).catch((err) =>{
      console.error(err);
    });
  }
}