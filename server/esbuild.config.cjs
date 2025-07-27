const esbuild = require('esbuild');
const { execSync } = require('child_process');

// Générer le client Prisma avant la compilation
try {
  console.log('🔧 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erreur lors de la génération du client Prisma:', error.message);
  process.exit(1);
}

const isWatch = process.argv.includes('--watch');

// Configuration pour le serveur
const serverBuildOptions = {
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
  format: 'cjs',
  sourcemap: true,
  minify: false,
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
    'process.env.NODE_ENV': '"production"'
  }
};

// Configuration pour le seed
const seedBuildOptions = {
  entryPoints: ['prisma/seed.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
  format: 'cjs',
  sourcemap: true,
  minify: false,
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
    'process.env.NODE_ENV': '"production"'
  }
};

if (isWatch) {
  console.log('👀 Mode watch activé...');
  Promise.all([
    esbuild.context(serverBuildOptions).then(context => context.watch()),
    esbuild.context(seedBuildOptions).then(context => context.watch())
  ]);
} else {
  console.log('🔨 Compilation du serveur et du seed...');
  Promise.all([
    esbuild.build(serverBuildOptions),
    esbuild.build(seedBuildOptions)
  ]).then(() => {
    console.log('✅ Serveur et seed compilés avec succès');
  }).catch((error) => {
    console.error('❌ Erreur de compilation:', error);
    process.exit(1);
  });
} 