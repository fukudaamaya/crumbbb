import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import { useBakes } from '@/hooks/useBakes';
import BakeListView from '@/components/BakeListView';
import { ArrowLeft } from 'lucide-react';

export default function RecipeHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipe } = useRecipes();
  const { bakes, updateBake } = useBakes();

  const recipe = id ? getRecipe(id) : null;

  const matchingBakes = useMemo(() => {
    if (!recipe) return [];
    return bakes.filter(b => b.name === recipe.name);
  }, [bakes, recipe]);

  const handleToggleFavourite = (bakeId: string, current: boolean) => {
    updateBake(bakeId, { is_favourite: !current });
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header
        className="px-4 py-4 border-b border-border bg-background flex items-center gap-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 40px)' }}
      >
        <button onClick={() => navigate(-1)} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} className="text-foreground" />
        </button>
        <div className="min-w-0 flex-1">
          <span className="wordmark truncate block">{recipe?.name || 'Recipe'}</span>
          <p className="text-[12px] text-muted-foreground mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {matchingBakes.length} {matchingBakes.length === 1 ? 'bake' : 'bakes'}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto py-4">
        {matchingBakes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <span className="text-5xl mb-4">📋</span>
            <p className="text-muted-foreground text-[14px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              No bakes found for this recipe yet.
            </p>
          </div>
        ) : (
          <BakeListView bakes={matchingBakes} onToggleFavourite={handleToggleFavourite} />
        )}
      </div>

      {recipe && (
        <div className="px-4 pb-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
          <button
            onClick={() => navigate(`/bake/new/1?recipe=${recipe.id}`)}
            className="btn-primary w-full py-3 text-[14px]"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Bake Again
          </button>
        </div>
      )}
    </div>
  );
}
