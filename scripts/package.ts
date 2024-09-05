import packager from '@electron/packager';

packager({
  dir: '.',
  name: 'tempu',
  out: 'dist/',
  appVersion: '0.1.0',
})
  .then((appPaths: string[]) => {
    console.log(`Packaging complete save to: ${appPaths}`);
  })
  .catch((err) => {
    console.log(err);
  });
