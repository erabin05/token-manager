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
    external: [
      '@prisma/client',
      'bcrypt',
      '@mapbox/node-pre-gyp',
      'mock-aws-s3',
      'aws-sdk',
      'nock',
      'fs',
      'path',
      'crypto',
      'os',
      'child_process',
      'util',
      'stream',
      'events',
      'assert',
      'buffer',
      'querystring',
      'url',
      'http',
      'https',
      'zlib',
      'tty',
      'readline',
      'repl',
      'vm',
      'perf_hooks',
      'async_hooks',
      'timers',
      'string_decoder',
      'punycode',
      'domain',
      'dns',
      'dgram',
      'cluster',
      'worker_threads',
      'inspector',
      'trace_events',
      'v8',
      'process',
      'module',
      'querystring',
      'url',
      'http',
      'https',
      'zlib',
      'tty',
      'readline',
      'repl',
      'vm',
      'perf_hooks',
      'async_hooks',
      'timers',
      'string_decoder',
      'punycode',
      'domain',
      'dns',
      'dgram',
      'cluster',
      'worker_threads',
      'inspector',
      'trace_events',
      'v8',
      'process',
      'module'
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  };

  // Build du serveur
  if (isWatch) {
    const context = await esbuild.context(buildOptions);
    await context.watch();
    console.log('👀 Mode watch activé - reconstruction automatique...');
  } else {
    await esbuild.build(buildOptions);
    console.log('✅ Build du serveur terminé!');
  }

  // Build du seed
  const seedBuildOptions = {
    entryPoints: ['prisma/seed.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist/seed.js',
    format: 'cjs',
    sourcemap: !isProduction,
    minify: isProduction,
    external: [
      '@prisma/client',
      'bcrypt',
      '@mapbox/node-pre-gyp',
      'mock-aws-s3',
      'aws-sdk',
      'nock',
      'fs',
      'path',
      'crypto',
      'os',
      'child_process',
      'util',
      'stream',
      'events',
      'assert',
      'buffer',
      'querystring',
      'url',
      'http',
      'https',
      'zlib',
      'tty',
      'readline',
      'repl',
      'vm',
      'perf_hooks',
      'async_hooks',
      'timers',
      'string_decoder',
      'punycode',
      'domain',
      'dns',
      'dgram',
      'cluster',
      'worker_threads',
      'inspector',
      'trace_events',
      'v8',
      'process',
      'module'
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  };

  if (!isWatch) {
    await esbuild.build(seedBuildOptions);
    console.log('✅ Build du seed terminé!');
  }
}

build().catch((error) => {
  console.error('❌ Erreur lors du build:', error);
  process.exit(1);
}); 