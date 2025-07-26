const esbuild = require('esbuild');

async function build() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isWatch = process.argv.includes('--watch');

  const buildOptions = {
    entryPoints: ['src/server.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist/server.js',
    format: 'cjs',
    sourcemap: !isProduction,
    minify: isProduction,
    external: ['@prisma/client'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  };

  if (isWatch) {
    const context = await esbuild.context(buildOptions);
    await context.watch();
    console.log('👀 Mode watch activé - reconstruction automatique...');
  } else {
    await esbuild.build(buildOptions);
    console.log('✅ Build terminé avec succès!');
  }
}

build().catch((error) => {
  console.error('❌ Erreur lors du build:', error);
  process.exit(1);
}); 