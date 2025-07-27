import Fastify from 'fastify';
import userRoutes from './routes/users';
import tokenRoutes from './routes/tokens';
import themeRoutes from './routes/themes';
import groupRoutes from './routes/groups';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';

const fastify = Fastify({
  logger: true,
});

// Enregistrer les routes
fastify.register(authRoutes);
fastify.register(userRoutes);
fastify.register(tokenRoutes);
fastify.register(themeRoutes);
fastify.register(groupRoutes);
fastify.register(healthRoutes);

// Démarrage du serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
