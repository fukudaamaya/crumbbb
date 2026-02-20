import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useBakes } from '@/hooks/useBakes';
import { Bake, Flour } from '@/types/bake';
import Step1Recipe from './wizard/Step1Recipe';
import Step2Proofing from './wizard/Step2Proofing';
import Step3Baking from './wizard/Step3Baking';
import Step4Capture from './wizard/Step4Capture';

interface BakeData {
  name: string;
  date: string;
  loaf_count: number;
  loaf_weight_g: number;
  flours: Flour[];
  water_g: number;
  starter_g: number;
  leaven_g: number;
  hydration_pct: number;
  starter_pct: number;
  leaven_pct: number;
  proofing_time_mins: number;
  bake_temp_c: number;
  bake_time_mins: number;
}

function calcPct(grams: number, totalFlour: number): number {
  if (!totalFlour) return 0;
  return Math.round((grams / totalFlour) * 100);
}

export default function NewBakeWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addBake } = useBakes();

  const [step, setStep] = useState(1);
  const [bakeData, setBakeData] = useState<Partial<BakeData>>({});

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  const bakeDate = bakeData.date ?? searchParams.get('date') ?? today;
  const isPastDate = bakeDate < today;

  const handleStep1 = (data: {
    name: string;
    date: string;
    loaf_count: number;
    loaf_weight_g: number;
    flours: Flour[];
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
    // Skip steps 2 & 3 for past dates
    if (data.date < today) {
      setStep(4);
    } else {
      setStep(2);
    }
  };

  const handleStep2 = (proofingMins: number) => {
    setBakeData(prev => ({ ...prev, proofing_time_mins: proofingMins }));
    setStep(3);
  };

  const handleStep3 = (data: { bake_temp_c: number; bake_time_mins: number }) => {
    setBakeData(prev => ({ ...prev, ...data }));
    setStep(4);
  };

  const handleSave = (data: {
    photo_base64: string;
    crumb_photo_base64: string;
    notes: string;
    rating: number;
  }) => {
    const bake: Bake = {
      id: uuidv4(),
      name: bakeData.name ?? '',
      date: bakeData.date ?? today,
      loaf_count: bakeData.loaf_count ?? 1,
      loaf_weight_g: bakeData.loaf_weight_g ?? 500,
      flours: bakeData.flours ?? [],
      water_g: bakeData.water_g ?? 0,
      starter_g: bakeData.starter_g ?? 0,
      leaven_g: bakeData.leaven_g ?? 0,
      hydration_pct: bakeData.hydration_pct ?? 0,
      starter_pct: bakeData.starter_pct ?? 0,
      leaven_pct: bakeData.leaven_pct ?? 0,
      proofing_time_mins: bakeData.proofing_time_mins ?? 0,
      bake_temp_c: bakeData.bake_temp_c ?? 0,
      bake_time_mins: bakeData.bake_time_mins ?? 0,
      photo_base64: data.photo_base64,
      crumb_photo_base64: data.crumb_photo_base64,
      notes: data.notes,
      rating: data.rating,
      is_favourite: false,
      created_at: new Date().toISOString(),
    };
    addBake(bake);
    navigate('/', { replace: true });
  };

  if (step === 1) {
    return (
      <Step1Recipe
        onNext={handleStep1}
        initialData={{
          date: searchParams.get('date') ?? undefined,
          ...bakeData,
        }}
      />
    );
  }

  if (step === 2) {
    return (
      <Step2Proofing
        date={bakeData.date ?? today}
        onNext={handleStep2}
        onSkip={() => setStep(3)}
        onBack={() => setStep(1)}
      />
    );
  }

  if (step === 3) {
    return (
      <Step3Baking
        date={bakeData.date ?? today}
        onNext={handleStep3}
        onSkip={() => setStep(4)}
        onBack={() => setStep(2)}
      />
    );
  }

  return (
    <Step4Capture
      onSave={handleSave}
      onBack={() => setStep(isPastDate ? 1 : 3)}
    />
  );
}
