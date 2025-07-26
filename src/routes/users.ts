import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany();
    return users;
  });
}
