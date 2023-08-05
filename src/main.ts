import '@/src/styles/style.css';
import { Game } from '@/src/game/Game';
import { AssetsLoaded, extractAssets } from '@/src/assets';
import { assetLoadManager } from '@/src/setup/utils/Loader';
import { delay } from '@/src/setup/utils/common';
import { CrosshairController } from '@/src/first-person/controllers/CrosshairController';

const assetLoaderView = document.querySelector('#loader')! as HTMLDivElement;
const canvas = document.querySelector('#canvas')! as HTMLCanvasElement;
const resumeButton = document.querySelector('button.resume')! as HTMLButtonElement;

const updateProgress = (progress: number) => {
  assetLoaderView.innerHTML = `Loading... <br/><br/> ${progress.toFixed(2)}%`;
};

const assetsLoaded = AssetsLoaded.then(extractAssets);
assetsLoaded.catch(console.error);
assetLoadManager.onLoad = async () => {
  console.log('INFO: Asset loading complete');
  updateProgress(100);
  await delay(500);

  const button = document.createElement('button');
  button.classList.add('start');
  button.innerHTML = 'Start';
  button.onclick = () => {
    console.clear();
    console.log('INFO: Starting game...');
    assetsLoaded
      .then(() => {
        const game = Game.start();

        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') game.pause();
        });
        resumeButton.onclick = () => game.resume();
        document.addEventListener('pointerlockchange', () => {
          if (document.pointerLockElement === null) game.pause();
        });

        assetLoaderView.hidden = true;
        canvas.hidden = false;
        CrosshairController.getInstance().show();
      })
      .catch(console.error);
  };
  assetLoaderView.innerHTML = '';
  assetLoaderView.appendChild(button);
};
assetLoadManager.onProgress = (item, loaded, total) => {
  console.log(`INFO: Loading asset "${item}"`);
  updateProgress((loaded / total) * 100);
};
assetLoadManager.onError = (error) => {
  console.log(`Error: ${error}`);
  assetLoaderView.innerHTML = `Error: ${error}`;
};
