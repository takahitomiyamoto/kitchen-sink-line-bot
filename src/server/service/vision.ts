export class VisionService {
  private static _visionService: VisionService = new VisionService();
  private constructor() {}
  public static get instance(): VisionService {
    return VisionService._visionService;
  }

  public classify = targetImage => new Promise((resolve, reject) => {
    //todo update
    setTimeout(() => {
      resolve('★★★');
    }, 3000);
  })

}