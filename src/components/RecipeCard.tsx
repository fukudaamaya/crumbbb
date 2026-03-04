import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/hooks/useRecipes';
import { Trash2 } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

export default function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const navigate = useNavigate();

  const flourSummary = recipe.flours
    .filter(f => f.type)
    .map(f => f.type)
    .join(', ');

  return (
    <div className="crumb-card p-4 space-y-2">
      <button
        onClick={() => navigate(`/recipe/${recipe.id}`)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[15px] truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>
              {recipe.name || 'Untitled Recipe'}
            </p>
            {flourSummary && (
              <p className="text-[12px] text-muted-foreground truncate mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {flourSummary}
              </p>
            )}
          </div>
          <span
            onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
            role="button"
            aria-label="Delete recipe"
          >
            <Trash2 size={16} strokeWidth={2} />
          </span>
        </div>

        <div className="flex gap-2 text-[12px] text-muted-foreground mt-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <span>{recipe.loaf_count} {recipe.loaf_count === 1 ? 'loaf' : 'loaves'}</span>
          <span>·</span>
          <span>{recipe.loaf_weight_g}g</span>
          {recipe.water_g > 0 && (
            <>
              <span>·</span>
              <span>{recipe.water_g}g water</span>
            </>
          )}
        </div>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/bake/new/1?recipe=${recipe.id}`); }}
        className="btn-primary w-full py-2.5 text-[14px] mt-2"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        Bake Again
      </button>
    </div>
  );
}
