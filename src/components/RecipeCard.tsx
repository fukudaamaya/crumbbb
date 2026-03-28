import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/hooks/useRecipes';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const navigate = useNavigate();

  const flourSummary = recipe.flours
    .filter(f => f.type)
    .map(f => f.type)
    .join(', ');

  return (
    <button
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      className="crumb-card p-3 w-full text-left"
    >
      <p className="font-bold text-[14px] truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>
        {recipe.name || 'Untitled Recipe'}
      </p>
      <div className="flex gap-2 text-[12px] text-muted-foreground mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {flourSummary && <span className="truncate">{flourSummary}</span>}
        {flourSummary && <span>·</span>}
        <span>{recipe.loaf_count} {recipe.loaf_count === 1 ? 'loaf' : 'loaves'}</span>
        <span>·</span>
        <span>{recipe.loaf_weight_g}g</span>
      </div>
    </button>
  );
}
