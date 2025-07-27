<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleLogin() {
    if (!email || !password) {
      error = 'Email et mot de passe requis';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Stocker le token dans localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Rediriger vers le dashboard
        goto('/dashboard');
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Erreur de connexion';
      }
    } catch (err) {
      error = 'Erreur de connexion au serveur';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Connexion - Token Manager</title>
</svelte:head>

<main>
  <h1>Connexion</h1>
  
  <form on:submit|preventDefault={handleLogin}>
    <div>
      <label for="email">Email:</label>
      <input 
        type="email" 
        id="email" 
        bind:value={email} 
        required 
        disabled={loading}
      />
    </div>
    
    <div>
      <label for="password">Mot de passe:</label>
      <input 
        type="password" 
        id="password" 
        bind:value={password} 
        required 
        disabled={loading}
      />
    </div>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <button type="submit" disabled={loading}>
      {loading ? 'Connexion...' : 'Se connecter'}
    </button>
  </form>
</main>

<style>
  main {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  div {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  label {
    font-weight: bold;
  }
  
  input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .error {
    color: red;
    font-size: 14px;
  }
</style>
