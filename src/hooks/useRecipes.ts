import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Flour, AddIn } from '@/types/bake';
import { toast } from 'sonner';

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  loaf_count: number;
  loaf_weight_g: number;
  flours: Flour[];
  water_g: number;
  starter_g: number;
  leaven_g: number;
  created_at: string;
}

function rowToRecipe(row: any): Recipe {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    loaf_count: row.loaf_count,
    loaf_weight_g: row.loaf_weight_g,
    flours: (row.flours ?? []) as Flour[],
    water_g: row.water_g,
    starter_g: row.starter_g,
    leaven_g: row.leaven_g,
    created_at: row.created_at,
  };
}

export function useRecipes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToRecipe);
    },
    enabled: !!user,
  });

  const addRecipeMutation = useMutation({
    mutationFn: async (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) return;
      const { error } = await supabase.from('recipes').insert({
        ...recipe,
        user_id: user.id,
        flours: recipe.flours as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe saved!');
    },
    onError: () => toast.error('Failed to save recipe'),
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });

  const addRecipe = useCallback(
    (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at'>) => addRecipeMutation.mutate(recipe),
    [addRecipeMutation]
  );

  const deleteRecipe = useCallback(
    (id: string) => deleteRecipeMutation.mutate(id),
    [deleteRecipeMutation]
  );

  const getRecipe = useCallback(
    (id: string) => recipes.find(r => r.id === id) ?? null,
    [recipes]
  );

  return { recipes, isLoading, addRecipe, deleteRecipe, getRecipe };
}
