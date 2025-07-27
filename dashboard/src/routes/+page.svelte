<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import GroupSidebar from '$lib/components/GroupSidebar.svelte';

  let user: any = null;
  let loading = true;
  let groups: any[] = [];
  let expandedGroups: Set<number> = new Set();
  let selectedGroup: any = null;

  onMount(async () => {
    // Vérifier si l'utilisateur est connecté
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (!accessToken || !userStr) {
      goto('/login');
      return;
    }

    try {
      user = JSON.parse(userStr);
      
      // Charger les groupes
      await loadGroups();
    } catch (err) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      goto('/login');
      return;
    }

    loading = false;
  });

  async function loadGroups() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('/api/groups', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        groups = await response.json();
      } else {
        console.error('Erreur lors du chargement des groupes:', response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    }
  }

  function handleGroupClick(event: CustomEvent) {
    const group = event.detail.group;
    selectedGroup = group;
    console.log('Groupe sélectionné:', group);
    // Ici vous pourrez ajouter plus tard la logique pour afficher les tokens du groupe
  }

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    goto('/login');
  }
</script>

<svelte:head>
  <title>Dashboard - Token Manager</title>
</svelte:head>

{#if loading}
  <main class="loading">
    <p>Chargement...</p>
  </main>
{:else if user}
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <GroupSidebar 
      {groups} 
      {expandedGroups} 
      on:groupClick={handleGroupClick}
    />
    
    <!-- Contenu principal -->
    <main class="main-content">
      <header>
        <h1>Dashboard</h1>
        <button on:click={handleLogout}>Déconnexion</button>
      </header>
      
      <section class="content-section">
        <h2>Bienvenue, {user.name} !</h2>
        <p>Vous êtes connecté avec le rôle: <strong>{user.role}</strong></p>
        <p>Email: {user.email}</p>
        
        {#if selectedGroup}
          <div class="selected-group">
            <h3>Groupe sélectionné</h3>
            <p><strong>Nom:</strong> {selectedGroup.name}</p>
            <p><strong>ID:</strong> {selectedGroup.id}</p>
            {#if selectedGroup.children && selectedGroup.children.length > 0}
              <p><strong>Sous-groupes:</strong> {selectedGroup.children.length}</p>
            {/if}
          </div>
        {:else}
          <p class="no-selection">Sélectionnez un groupe dans la sidebar pour voir ses détails</p>
        {/if}
      </section>
    </main>
  </div>
{/if}

<style>
  .dashboard-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
    color: #666;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  button {
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  button:hover {
    background-color: #c82333;
  }
  
  .content-section {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f8f9fa;
  }
  
  h2 {
    margin-top: 0;
    color: #333;
    margin-bottom: 20px;
  }
  
  p {
    margin: 10px 0;
    color: #555;
  }

  .selected-group {
    margin-top: 30px;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .selected-group h3 {
    margin-top: 0;
    color: #007bff;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
  }

  .no-selection {
    text-align: center;
    color: #6c757d;
    font-style: italic;
    margin-top: 50px;
    font-size: 1.1rem;
  }
</style>
