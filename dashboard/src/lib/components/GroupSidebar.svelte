<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let groups: GroupNode[] = [];
  export let expandedGroups: Set<number> = new Set();

  const dispatch = createEventDispatcher();

  interface GroupNode {
    id: number;
    name: string;
    parentId: number | null;
    children?: GroupNode[];
  }

  // Utiliser un tableau réactif pour forcer la réactivité
  let expandedGroupsArray: number[] = [];

  // Synchroniser le Set avec le tableau
  $: {
    expandedGroupsArray = Array.from(expandedGroups);
  }

  function toggleGroup(groupId: number) {
    if (expandedGroups.has(groupId)) {
      expandedGroups.delete(groupId);
    } else {
      expandedGroups.add(groupId);
    }
    // Forcer la réactivité en mettant à jour le tableau
    expandedGroupsArray = Array.from(expandedGroups);
  }

  function handleGroupClick(group: GroupNode, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    dispatch('groupClick', { group });
  }

  function renderGroupTree(group: GroupNode, level: number = 0) {
    const hasChildren = group.children && group.children.length > 0;
    const isExpanded = expandedGroups.has(group.id);

    return {
      group,
      hasChildren,
      isExpanded,
      level
    };
  }

  // Fonction récursive pour obtenir tous les groupes dans un format plat avec leur niveau
  function getAllGroupsWithLevel(groups: GroupNode[], level: number = 0): Array<{group: GroupNode, level: number, hasChildren: boolean, isExpanded: boolean}> {
    let result: Array<{group: GroupNode, level: number, hasChildren: boolean, isExpanded: boolean}> = [];
    
    for (const group of groups) {
      const hasChildren = !!(group.children && group.children.length > 0);
      const isExpanded = expandedGroupsArray.includes(group.id);
      
      result.push({
        group,
        level,
        hasChildren,
        isExpanded
      });
      
      if (hasChildren && isExpanded && group.children) {
        result = result.concat(getAllGroupsWithLevel(group.children, level + 1));
      }
    }
    
    return result;
  }

  $: visibleGroups = getAllGroupsWithLevel(groups);
</script>

<div class="sidebar">
  <div class="sidebar-header">
    <h3>Groupes de Tokens</h3>
  </div>
  
  <div class="sidebar-content">
    {#if groups.length === 0}
      <p class="no-groups">Aucun groupe disponible</p>
    {:else}
      {#each visibleGroups as { group, level, hasChildren, isExpanded }}
        <div class="group-item" style="padding-left: {level * 20}px;">
          <div class="group-header">
            {#if hasChildren}
              <button 
                class="toggle-btn {isExpanded ? 'expanded' : ''}" 
                on:click={() => toggleGroup(group.id)}
                aria-label="{isExpanded ? 'Réduire' : 'Développer'}"
              >
                <span class="arrow">▶</span>
              </button>
            {:else}
              <span class="spacer"></span>
            {/if}
            <button 
              class="group-btn" 
              on:click={(e) => handleGroupClick(group, e)}
            >
              {group.name}
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .sidebar {
    width: 280px;
    height: 100vh;
    background-color: #f8f9fa;
    border-right: 1px solid #dee2e6;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #dee2e6;
    background-color: #ffffff;
  }

  .sidebar-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
  }

  .group-item {
    margin: 0;
  }

  .group-header {
    display: flex;
    align-items: center;
    padding: 8px 20px;
    gap: 8px;
  }

  .group-header:hover {
    background-color: #e9ecef;
  }

  .toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }

  .toggle-btn:hover {
    background-color: #dee2e6;
  }

  .toggle-btn.expanded .arrow {
    transform: rotate(90deg);
  }

  .arrow {
    font-size: 12px;
    color: #6c757d;
    transition: transform 0.2s ease;
  }

  .spacer {
    width: 20px;
  }

  .group-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 12px;
    text-align: left;
    flex: 1;
    border-radius: 4px;
    color: #333;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }

  .group-btn:hover {
    background-color: #007bff;
    color: white;
  }

  .no-groups {
    padding: 20px;
    text-align: center;
    color: #6c757d;
    font-style: italic;
  }

  /* Scrollbar styling */
  .sidebar-content::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar-content::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .sidebar-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .sidebar-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style> 