import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Middleware pour parser le JSON
app.use(express.json());

// Endpoints pour les utilisateurs
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Endpoints pour les tokens
app.get('/tokens', async (req, res) => {
  const tokens = await prisma.token.findMany({
    include: {
      tokenValues: true,
    },
  });
  res.json(tokens);
});

app.get('/tokens/:id', async (req, res) => {
  const { id } = req.params;
  const token = await prisma.token.findUnique({
    where: { id: parseInt(id) },
    include: {
      tokenValues: true,
    },
  });
  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }
  res.json(token);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
