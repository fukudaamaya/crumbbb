import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/hooks/useRecipes';

interface RecipeCardProps {
  recipe: Recipe;
  lastBakePhoto?: string;
  lastBakeDate?: string;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RecipeCard({ recipe, lastBakePhoto, lastBakeDate }: RecipeCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      className="crumb-card p-3 w-full text-left flex items-center gap-3"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
        {lastBakePhoto ? (
          <img src={lastBakePhoto} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">🍞</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>
          {recipe.name || 'Untitled Recipe'}
        </p>
        <div className="flex gap-2 text-[12px] text-muted-foreground mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <span>{recipe.loaf_count} {recipe.loaf_count === 1 ? 'loaf' : 'loaves'}</span>
          {lastBakeDate && (
            <>
              <span>·</span>
              <span>Last baked {formatShortDate(lastBakeDate)}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
