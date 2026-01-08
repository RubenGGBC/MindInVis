import { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mapService } from '../services/mapService';

const MapDataContext = createContext(null);

export const MapDataProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // Fetch all maps
  const { data: allMaps = [], isLoading: isLoadingAllMaps } = useQuery({
    queryKey: ['maps'],
    queryFn: mapService.getAllMaps,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch recent maps
  const { data: recentMapsData = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recentMaps'],
    queryFn: mapService.getRecentMaps,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Create map mutation
  const createMapMutation = useMutation({
    mutationFn: mapService.createMap,
    onSuccess: () => {
      queryClient.invalidateQueries(['maps']);
      queryClient.invalidateQueries(['recentMaps']);
    },
  });

  // Update map mutation
  const updateMapMutation = useMutation({
    mutationFn: ({ id, data }) => mapService.updateMap(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maps']);
      queryClient.invalidateQueries(['recentMaps']);
    },
  });

  // Delete map mutation
  const deleteMapMutation = useMutation({
    mutationFn: mapService.deleteMap,
    onSuccess: () => {
      queryClient.invalidateQueries(['maps']);
      queryClient.invalidateQueries(['recentMaps']);
    },
  });

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: ({ id, isStarred }) => mapService.toggleStar(id, isStarred),
    onSuccess: () => {
      queryClient.invalidateQueries(['maps']);
      queryClient.invalidateQueries(['recentMaps']);
    },
  });

  // Quick actions for creating new maps
  const quickActions = useMemo(() => [
    {
      icon: 'Plus',
      label: 'Blank map',
      description: 'Start from scratch',
      size: 'large',
      color: 'cyan',
    },
    {
      icon: 'Sparkles',
      label: 'AI Generated',
      description: 'Let AI create a map',
      size: 'medium',
      color: 'purple',
    },
    {
      icon: 'BookOpen',
      label: 'From template',
      description: 'Use a preset structure',
      size: 'medium',
      color: 'blue',
    },
  ], []);

  // Templates for quick start
  const templates = useMemo(() => [
    { icon: 'Target', label: 'Goal Planning', color: 'cyan' },
    { icon: 'Briefcase', label: 'Project', color: 'purple' },
    { icon: 'Brain', label: 'Brainstorm', color: 'blue' },
    { icon: 'FileText', label: 'Notes', color: 'pink' },
    { icon: 'Lightbulb', label: 'Ideas', color: 'orange' },
  ], []);

  // Format recent maps for display
  const recentMaps = useMemo(() => {
    return recentMapsData.map((map) => ({
      id: map._id,
      name: map.title,
      category: map.category,
      nodes: map.nodeCount || 0,
      createdBy: map.owner?.name || 'Unknown',
      modified: formatRelativeTime(map.updatedAt),
      starred: map.isStarred || false,
      aiGenerated: map.aiGenerated || false,
      color: map.color || 'cyan',
    }));
  }, [recentMapsData]);

  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const value = {
    // Data
    quickActions,
    templates,
    recentMaps,
    allMaps,

    // Loading states
    isLoadingAllMaps,
    isLoadingRecent,

    // Mutations
    createMap: createMapMutation.mutate,
    updateMap: updateMapMutation.mutate,
    deleteMap: deleteMapMutation.mutate,
    toggleStar: toggleStarMutation.mutate,

    // Loading states for mutations
    isCreating: createMapMutation.isPending,
    isUpdating: updateMapMutation.isPending,
    isDeleting: deleteMapMutation.isPending,
  };

  return (
    <MapDataContext.Provider value={value}>
      {children}
    </MapDataContext.Provider>
  );
};

export const useMapData = () => {
  const context = useContext(MapDataContext);
  if (!context) {
    throw new Error('useMapData must be used within a MapDataProvider');
  }
  return context;
};
