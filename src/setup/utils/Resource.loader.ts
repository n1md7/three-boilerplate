import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Loader {
  private loader = new GLTFLoader();

  load(path: string): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (resource) => resolve(resource as GLTF),
        function (xhr: any) {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => reject(error)
      );
    });
  }
}
