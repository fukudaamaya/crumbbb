import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useBakes } from '@/hooks/useBakes';
import { useRecipes } from '@/hooks/useRecipes';
import { Bake, Flour, AddIn } from '@/types/bake';
import Step1Recipe from './wizard/Step1Recipe';
import Step3Baking from './wizard/Step3Baking';
import Step4Capture from './wizard/Step4Capture';

interface BakeData {
  name: string;
  date: string;
  loaf_count: number;
  loaf_weight_g: number;
  flours: Flour[];
  add_ins: AddIn[];
  water_g: number;
  starter_g: number;
  leaven_g: number;
  hydration_pct: number;
  starter_pct: number;
  leaven_pct: number;
  bake_temp_c: number;
  preheat_time_mins: number;
  lid_on_mins: number;
  lid_off_mins: number;
}

function calcPct(grams: number, totalFlour: number): number {
  if (!totalFlour) return 0;
  return Math.round((grams / totalFlour) * 100);
}

export default function NewBakeWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addBake, updateBake, getBake } = useBakes();
  const { getRecipe } = useRecipes();

  const editId = searchParams.get('edit');
  const editBake = editId ? getBake(editId) : null;

  const recipeId = searchParams.get('recipe');
  const recipe = recipeId ? getRecipe(recipeId) : null;

  const [step, setStep] = useState(1);
  const [bakeData, setBakeData] = useState<Partial<BakeData>>(() => {
    if (editBake) {
      return {
        name: editBake.name,
        date: editBake.date,
        loaf_count: editBake.loaf_count,
        loaf_weight_g: editBake.loaf_weight_g,
        flours: editBake.flours,
        add_ins: editBake.add_ins,
        water_g: editBake.water_g,
        starter_g: editBake.starter_g,
        leaven_g: editBake.leaven_g,
        hydration_pct: editBake.hydration_pct,
        starter_pct: editBake.starter_pct,
        leaven_pct: editBake.leaven_pct,
        bake_temp_c: editBake.bake_temp_c,
        preheat_time_mins: editBake.preheat_time_mins,
        lid_on_mins: editBake.lid_on_mins,
        lid_off_mins: editBake.lid_off_mins,
      };
    }
    return {};
  });

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  const bakeDate = bakeData.date ?? searchParams.get('date') ?? today;
  const isPastDate = bakeDate < today;

  const handleStep1 = (data: {
    name: string;
    date: string;
    loaf_count: number;
    loaf_weight_g: number;
    flours: Flour[];
    add_ins: AddIn[];
    water_g: number;
    starter_g: number;
    leaven_g: number;
  }) => {
    const totalFlour = data.flours.reduce((s, f) => s + f.grams, 0);
    setBakeData(prev => ({
      ...prev,
      ...data,
      hydration_pct: calcPct(data.water_g, totalFlour),
      starter_pct: calcPct(data.starter_g, totalFlour),
      leaven_pct: calcPct(data.leaven_g, totalFlour),
    }));
    if (data.date < today) {
      setStep(3); // skip baking step for past dates
    } else {
      setStep(2);
    }
  };

  const handleStep2 = (data: { bake_temp_c: number; preheat_time_mins: number; lid_on_mins: number; lid_off_mins: number }) => {
    setBakeData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleSave = (data: { photos: string[]; notes: string; rating: number }) => {
    if (editId) {
      updateBake(editId, {
        name: bakeData.name,
        date: bakeData.date,
        loaf_count: bakeData.loaf_count,
        loaf_weight_g: bakeData.loaf_weight_g,
        flours: bakeData.flours,
        add_ins: bakeData.add_ins,
        water_g: bakeData.water_g,
        starter_g: bakeData.starter_g,
        leaven_g: bakeData.leaven_g,
        hydration_pct: bakeData.hydration_pct,
        starter_pct: bakeData.starter_pct,
        leaven_pct: bakeData.leaven_pct,
        bake_temp_c: bakeData.bake_temp_c,
        preheat_time_mins: bakeData.preheat_time_mins,
        lid_on_mins: bakeData.lid_on_mins,
        lid_off_mins: bakeData.lid_off_mins,
        bake_time_mins: 0,
        proofing_time_mins: 0,
        photos: data.photos,
        photo_base64: data.photos[0] ?? '',
        notes: data.notes,
        rating: data.rating,
      });
      navigate(`/bake/${editId}`, { replace: true });
    } else {
      const bake: Bake = {
        id: uuidv4(),
        name: bakeData.name ?? '',
        date: bakeData.date ?? today,
        loaf_count: bakeData.loaf_count ?? 1,
        loaf_weight_g: bakeData.loaf_weight_g ?? 500,
        flours: bakeData.flours ?? [],
        add_ins: bakeData.add_ins ?? [],
        water_g: bakeData.water_g ?? 0,
        starter_g: bakeData.starter_g ?? 0,
        leaven_g: bakeData.leaven_g ?? 0,
        hydration_pct: bakeData.hydration_pct ?? 0,
        starter_pct: bakeData.starter_pct ?? 0,
        leaven_pct: bakeData.leaven_pct ?? 0,
        proofing_time_mins: 0,
        bake_temp_c: bakeData.bake_temp_c ?? 0,
        bake_time_mins: 0,
        preheat_time_mins: bakeData.preheat_time_mins ?? 0,
        lid_on_mins: bakeData.lid_on_mins ?? 0,
        lid_off_mins: bakeData.lid_off_mins ?? 0,
        photo_base64: data.photos[0] ?? '',
        crumb_photo_base64: '',
        photos: data.photos,
        notes: data.notes,
        rating: data.rating,
        is_favourite: false,
        created_at: new Date().toISOString(),
      };
      addBake(bake);
      navigate('/', { replace: true });
    }
  };

  if (step === 1) {
    return (
      <Step1Recipe
        onNext={handleStep1}
        initialData={{
          date: searchParams.get('date') ?? undefined,
          ...(recipe ? {
            name: recipe.name,
            loaf_count: recipe.loaf_count,
            loaf_weight_g: recipe.loaf_weight_g,
            flours: recipe.flours,
            add_ins: (recipe as any).add_ins ?? [],
            water_g: recipe.water_g,
            starter_g: recipe.starter_g,
            leaven_g: recipe.leaven_g,
          } : {}),
          ...bakeData,
        }}
      />
    );
  }

  if (step === 2) {
    return (
      <Step3Baking
        onNext={handleStep2}
        onSkip={() => setStep(3)}
        onBack={() => setStep(1)}
        initialData={bakeData}
      />
    );
  }

  return (
    <Step4Capture
      onSave={handleSave}
      onBack={() => setStep(isPastDate ? 1 : 2)}
      initialData={editBake ? {
        photos: editBake.photos,
        notes: editBake.notes,
        rating: editBake.rating,
      } : undefined}
    />
  );
}
