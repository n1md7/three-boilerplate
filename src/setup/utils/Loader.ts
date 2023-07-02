import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { delay } from '@/src/setup/utils/common';
import { CrosshairController } from '@/src/first-person/controllers/CrosshairController';
import { ImageLoader, LoadingManager, Texture, TextureLoader } from 'three';

const assetLoaderView = document.querySelector('#loading')! as HTMLDivElement;
const canvas = document.querySelector('#canvas')! as HTMLCanvasElement;

const updateProgress = (progress: number) => {
  assetLoaderView.innerHTML = `Loading... <br/><br/> ${progress.toFixed(2)}%`;
};

export const manager = new LoadingManager(
  async () => {
    console.log('INFO: Asset loading complete');
    console.log('INFO: Starting game...');
    updateProgress(100);
    await delay(500);

    const button = document.createElement('button');
    button.innerHTML = 'Start';
    button.style.width = '200px';
    button.style.height = '80px';
    button.style.fontSize = '30px';
    button.style.cursor = 'pointer';
    button.onclick = () => {
      assetLoaderView.hidden = true;
      canvas.hidden = false;
      CrosshairController.getInstance().show();
      document.body.requestPointerLock();
    };
    assetLoaderView.innerHTML = '';
    assetLoaderView.appendChild(button);
  },
  (item, loaded, total) => {
    console.log(`INFO: Loading asset "${item}"`);
    updateProgress((loaded / total) * 100);
  },
  (error) => {
    console.log(`Error: ${error}`);
    assetLoaderView.innerHTML = `Error: ${error}`;
  }
);

export class MyGLTFLoader {
  private readonly loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader(manager);
  }

  load(path: string): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (resource) => resolve(resource as GLTF),
        undefined,
        (error) => reject(error)
      );
    });
  }
}

export class MyImageLoader {
  private loader: ImageLoader;

  constructor() {
    this.loader = new ImageLoader(manager);
  }

  load(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (resource) => resolve(resource as HTMLImageElement),
        undefined,
        (error) => reject(error)
      );
    });
  }
}

export class MyTextureLoader {
  private loader: TextureLoader;

  constructor() {
    this.loader = new TextureLoader(manager);
  }

  load(path: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (resource) => resolve(resource as Texture),
        undefined,
        (error) => reject(error)
      );
    });
  }
}
