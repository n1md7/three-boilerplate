import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Texture } from 'three';
import { MyGLTFLoader, MyTextureLoader } from '@/src/setup/utils/Loader';

const aGLTF = new MyGLTFLoader();
const aIMAGE = new MyTextureLoader();
export const Assets = {
  Textures: {
    Ground: {} as Texture,
    Box: {} as Texture,
  },
  Models: {
    Sky: {} as GLTF,
    ShootingTarget: {} as GLTF,
  },
  Weapons: {
    DesertEagle: {} as GLTF,
    M60: {} as GLTF,
  },
};

export const AssetsLoaded = Promise.all([
  Promise.all([aIMAGE.load('images/checker.png'), aIMAGE.load('images/box.png')]),
  Promise.all([aGLTF.load('3d/sky_pano/scene.gltf'), aGLTF.load('3d/shooting-target/scene.gltf')]),
  Promise.all([aGLTF.load('3d/desert-eagle/scene.gltf'), aGLTF.load('3d/m60/scene.gltf')]),
]);

export const extractAssets = async (assets: Awaited<typeof AssetsLoaded>) => {
  const [textures, models, weapons] = assets;

  Assets.Textures.Ground = textures[0];
  Assets.Textures.Box = textures[1];

  Assets.Models.Sky = models[0];
  Assets.Models.ShootingTarget = models[1];

  Assets.Weapons.DesertEagle = weapons[0];
  Assets.Weapons.M60 = weapons[1];
};
