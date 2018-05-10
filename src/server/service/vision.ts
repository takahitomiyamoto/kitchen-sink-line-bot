export class VisionService {
  private static _visionService: VisionService = new VisionService();
  private constructor() {}
  public static get instance(): VisionService {
    return VisionService._visionService;
  }

  public imageClassify = (targetImage) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('★★★');
      }, 1000);
    });
  }

  public objectDetect = (targetImage) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('★★★');
      }, 1000);
    });
  }
}