# ThreeJS boilerplate

Technologies used

- Vite
- Vitest
- Typescript
- Electron

## How to run

```bash
# Browser
$ npm run dev

# Build
$ npm run build
# Electron
$ npm run electron
```

<img width="1431" alt="image" src="https://github.com/n1md7/three-boilerplate/assets/6734058/e2892705-7fb1-4949-8291-f9b331af3950">


### Workflow actions

Once it is cloned make sure you enable permissions

`Settings > Actions > General` make sure in __Workflow permissions__ __Read and Write__ is granted

<img width="1312" alt="image" src="https://github.com/n1md7/three-boilerplate/assets/6734058/d5f4bd64-45e5-4025-a6e6-d869c801b4e4">

### Configure template source and update change

```bash
# Add remote source
git remote add template https://github.com/n1md7/three-boilerplate.git
# Pull changes
git pull template master
# Merge into current branch
git merge template/master --allow-unrelated-histories
```
