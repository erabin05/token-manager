<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let user: any = null;
  let loading = true;

  onMount(() => {
    // Vérifier si l'utilisateur est connecté
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (!accessToken || !userStr) {
      goto('/');
      return;
    }

    try {
      user = JSON.parse(userStr);
    } catch (err) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      goto('/');
      return;
    }

    loading = false;
  });

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    goto('/');
  }
</script>

<svelte:head>
  <title>Dashboard - Token Manager</title>
</svelte:head>

{#if loading}
  <main>
    <p>Chargement...</p>
  </main>
{:else if user}
  <main>
    <header>
      <h1>Dashboard</h1>
      <button on:click={handleLogout}>Déconnexion</button>
    </header>
    
    <section>
      <h2>Bienvenue, {user.name} !</h2>
      <p>Vous êtes connecté avec le rôle: <strong>{user.role}</strong></p>
      <p>Email: {user.email}</p>
    </section>
  </main>
{/if}

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ccc;
  }
  
  button {
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #c82333;
  }
  
  section {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
  }
  
  h2 {
    margin-top: 0;
    color: #333;
  }
  
  p {
    margin: 10px 0;
  }
</style> 