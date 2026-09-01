export interface CapabilityItem {
  id: string;
  title: string;
  description: string;
  iconName: 'zap' | 'check-circle' | 'clipboard-list' | 'badge-dollar-sign';
  badgeColor: string;
  textColor: string;
  details?: {
    keyBenefit: string;
    metrics: string;
    sampleAction: string;
  };
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  category: string;
  stats: string;
}

export interface StepItem {
  stepNumber: number;
  title: string;
  description: string;
  detail: string;
}

export interface ImpactStat {
  value: string;
  suffix?: string;
  label: string;
  highlight: string;
}

export interface FarmPlanFormData {
  farmName: string;
  location: string;
  farmSizeAcres: number | string;
  cropTypes: string[];
  irrigationType: string;
  primaryGoal: string;
  email: string;
  fullName: string;
}
