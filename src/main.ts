import '@/src/styles/style.css';
import { Game } from '@/src/Game';
import { AssetsLoaded, extractAssets } from '@/src/assets';

AssetsLoaded.then(extractAssets).then(Game.start).catch(console.error);
