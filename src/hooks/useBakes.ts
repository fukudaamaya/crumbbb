import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bake } from '@/types/bake';
import { sampleBakes } from '@/data/sampleBakes';
import { toast } from 'sonner';

// Map DB row to Bake type
function rowToBake(row: any): Bake {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    loaf_count: row.loaf_count,
    loaf_weight_g: row.loaf_weight_g,
    flours: (row.flours ?? []) as Bake['flours'],
    water_g: row.water_g,
    starter_g: row.starter_g,
    leaven_g: row.leaven_g,
    hydration_pct: row.hydration_pct,
    starter_pct: row.starter_pct,
    leaven_pct: row.leaven_pct,
    proofing_time_mins: row.proofing_time_mins,
    bake_temp_c: row.bake_temp_c,
    bake_time_mins: row.bake_time_mins,
    photo_base64: row.photo_base64,
    crumb_photo_base64: row.crumb_photo_base64,
    notes: row.notes,
    rating: row.rating,
    is_favourite: row.is_favourite,
    created_at: row.created_at,
  };
}

function demoNoop() {
  toast('Create an account to save your own bakes', {
    action: {
      label: 'Sign Up',
      onClick: () => { window.location.href = '/signup'; },
    },
  });
}

export function useBakes(demo = false) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDemo = demo || !user;

  const { data: bakes = [], isLoading } = useQuery({
    queryKey: ['bakes', isDemo ? 'demo' : user?.id],
    queryFn: async () => {
      if (isDemo) return sampleBakes;
      const { data, error } = await supabase
        .from('bakes')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToBake);
    },
    enabled: isDemo || !!user,
  });

  const addBakeMutation = useMutation({
    mutationFn: async (bake: Bake) => {
      if (isDemo) { demoNoop(); return; }
      const { id, created_at, ...rest } = bake;
      const { error } = await supabase.from('bakes').insert({
        ...rest,
        user_id: user!.id,
        flours: rest.flours as any,
      });
      if (error) throw error;
    },
    onSuccess: () => { if (!isDemo) queryClient.invalidateQueries({ queryKey: ['bakes'] }); },
  });

  const updateBakeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bake> }) => {
      if (isDemo) { demoNoop(); return; }
      const { flours, ...rest } = updates;
      const payload: any = { ...rest };
      if (flours !== undefined) payload.flours = flours as any;
      const { error } = await supabase.from('bakes').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { if (!isDemo) queryClient.invalidateQueries({ queryKey: ['bakes'] }); },
  });

  const deleteBakeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) { demoNoop(); return; }
      const { error } = await supabase.from('bakes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { if (!isDemo) queryClient.invalidateQueries({ queryKey: ['bakes'] }); },
  });

  const addBake = useCallback((bake: Bake) => addBakeMutation.mutate(bake), [addBakeMutation]);
  const updateBake = useCallback((id: string, updates: Partial<Bake>) => updateBakeMutation.mutate({ id, updates }), [updateBakeMutation]);
  const deleteBake = useCallback((id: string) => deleteBakeMutation.mutate(id), [deleteBakeMutation]);

  const getBake = useCallback((id: string) => bakes.find(b => b.id === id) ?? null, [bakes]);

  return { bakes, isLoading, addBake, updateBake, deleteBake, getBake, isDemo };
}
