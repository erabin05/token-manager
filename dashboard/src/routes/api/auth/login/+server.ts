import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const body = await request.json();

    // Faire un proxy vers le serveur backend
    const response = await fetch('http://server:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return json(data, { status: 200 });
    } else {
      return json(data, { status: response.status });
    }
  } catch (error) {
    return json({ error: 'Erreur de connexion au serveur' }, { status: 500 });
  }
};
