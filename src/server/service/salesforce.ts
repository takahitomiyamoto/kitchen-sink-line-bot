export class SalesforceService {
  private static _salesforceService: SalesforceService = new SalesforceService();
  private constructor() {}
  public static get instance(): SalesforceService {
    return SalesforceService._salesforceService;
  }

  public sendFile = (targetImage, count) => {
    console.log('targetImage: ' + targetImage);
    console.log('count: ' + count);
    return new Promise((resolve, reject) => {
        // let q = `SELECT id,
        //             title__c,
        //             address__c,
        //             city__c,
        //             state__c,
        //             price__c,
        //             beds__c,
        //             baths__c,
        //             picture__c
        //         FROM property__c
        //         WHERE tags__c LIKE '%${category}%'
        //         LIMIT 5`;
        // console.log(q);
        // org.query({query: q}, (err, resp) => {
        //     if (err) {
        //         console.error(err);
        //         reject("An error as occurred");
        //     } else {
        //         resolve(resp.records);
        //     }
        // });
    });
};
}