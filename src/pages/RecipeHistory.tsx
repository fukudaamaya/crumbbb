import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import { useBakes } from '@/hooks/useBakes';
import BakeListView from '@/components/BakeListView';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function RecipeHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipe, deleteRecipe } = useRecipes();
  const { bakes, updateBake } = useBakes();
  const [showDelete, setShowDelete] = useState(false);

  const recipe = id ? getRecipe(id) : null;

  const matchingBakes = useMemo(() => {
    if (!recipe) return [];
    return bakes.filter((b) => b.name === recipe.name);
  }, [bakes, recipe]);

  const handleToggleFavourite = (bakeId: string, current: boolean) => {
    updateBake(bakeId, { is_favourite: !current });
  };

  const handleDelete = () => {
    if (!recipe) return;
    deleteRecipe(recipe.id);
    navigate(-1);
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
          <span className="wordmark truncate block text-xl">{recipe?.name || 'Recipe'}</span>
          <p className="text-[12px] text-muted-foreground mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {matchingBakes.length} {matchingBakes.length === 1 ? 'bake' : 'bakes'}
          </p>
        </div>
        <button
          onClick={() => setShowDelete(true)}
          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Delete recipe"
        >
          <Trash2 size={20} strokeWidth={2} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto py-4">
        {/* Recipe details */}
        {recipe && (
          <div className="px-4 mb-4 space-y-3">
            {recipe.flours.length > 0 && (
              <div className="crumb-card p-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Flour Blend</h3>
                {recipe.flours.map((f, i) => (
                  <div key={i} className="flex justify-between text-[14px] py-0.5">
                    <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{f.type}</span>
                    <span className="font-semibold tabular-nums">{f.grams}g</span>
                  </div>
                ))}
              </div>
            )}
            <div className="crumb-card p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Details</h3>
              <div className="flex gap-4 text-[14px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <span>{recipe.loaf_count} {recipe.loaf_count === 1 ? 'loaf' : 'loaves'}</span>
                <span>·</span>
                <span>{recipe.loaf_weight_g}g</span>
                {recipe.water_g > 0 && <><span>·</span><span>{recipe.water_g}g water</span></>}
              </div>
            </div>
          </div>
        )}

        {/* Bake history */}
        {matchingBakes.length > 0 && (
          <div className="px-4 mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>Bake History</h3>
          </div>
        )}

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

      {/* Delete confirmation sheet */}
      {showDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowDelete(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[16px] border-t border-border px-4 pt-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            <p className="text-center font-bold text-[17px] mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>Delete this recipe?</p>
            <p className="text-center text-[14px] text-muted-foreground mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              This can't be undone.
            </p>
            <button
              onClick={handleDelete}
              className="w-full py-4 text-[15px] font-semibold rounded-[4px] border border-border text-destructive mb-2"
              style={{ fontFamily: 'DM Sans, sans-serif', boxShadow: '2px 2px 0px hsl(var(--border))' }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="w-full py-3 text-[15px] font-semibold text-muted-foreground"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
