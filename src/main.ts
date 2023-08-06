import '@/src/styles/style.css';
import { Game } from '@/src/game/Game';
import { AssetsLoaded, extractAssets } from '@/src/assets';
import { assetLoadManager } from '@/src/setup/utils/Loader';
import { delay } from '@/src/setup/utils/common';
import * as ui from '@/src/game/ui';

ui.progress.show();

const assetsLoaded = AssetsLoaded.then(extractAssets);
assetsLoaded.catch(console.error);
const game = new Game();
ui.menu.resume.click(() => game.resume());
ui.start.click(() => {
  assetsLoaded
    .then(async () => {
      console.clear();

      ui.start.hide();
      ui.progress.show();
      ui.progress.displayText('Loading...');

      await delay(100);

      game.setup();
      game.start();

      ui.progress.hide();
      ui.canvas.show();
    })
    .catch(console.error);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') game.pause();
});
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === null) game.pause();
});

assetLoadManager.onLoad = async () => {
  console.log('INFO: Asset loading complete');

  ui.progress.update(100);

  await delay(500);

  ui.progress.hide();
  ui.start.show();
};
assetLoadManager.onProgress = (item, loaded, total) => {
  console.log(`INFO: Loading asset "${item}"`);
  ui.progress.update((loaded / total) * 100);
};
assetLoadManager.onError = (error) => {
  console.error(`Error: ${error}`);
  ui.progress.displayText(`Error: ${error}`);
};
