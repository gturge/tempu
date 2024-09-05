import esbuild, { BuildContext } from 'esbuild';

// Build configuration for the main process
const mainCtx = await esbuild.context({
  entryPoints: ['./src/main.ts'],
  bundle: true,
  minify: false,
  packages: 'external',
  sourcemap: 'inline',
  tsconfig: 'main.tsconfig.json',
  platform: 'node',
  outdir: './app/dist/',
  format: 'esm',
});

// Build configuration for the preload
const preloadCtx = await esbuild.context({
  entryPoints: ['./src/preload.ts'],
  bundle: false,
  minify: false,
  sourcemap: 'inline',
  tsconfig: 'preload.tsconfig.json',
  platform: 'node',
  outdir: './app/dist/',
  format: 'cjs',
});

// Build configuration for the renderer process
const rendererCtx = await esbuild.context({
  entryPoints: ['./src/renderer.ts'],
  bundle: true,
  minify: false,
  sourcemap: 'inline',
  tsconfig: 'renderer.tsconfig.json',
  platform: 'browser',
  outdir: './app/dist/',
});

const contexts = [
  ['main', mainCtx],
  ['preload', preloadCtx],
  ['renderer', rendererCtx],
];
const watching = process.argv.includes('watch');

if (watching) {
  console.log('\x1b[34mWatching...\x1b[m');
}

const action = watching
  ? ([, ctx]) => ctx.watch()
  : async ([name, ctx]) => {
      try {
        await ctx.rebuild();
      } catch (err) {
        console.log('Failed', name);
      } finally {
        ctx.dispose();
      }
    };

contexts.forEach(action);
