import { CapabilityItem, FeatureCard, StepItem, ImpactStat } from '../types';
import landingFieldPlough from '../assets/images/landing-field-plough.jpeg';
import landingRiceFarmer from '../assets/images/landing-rice-farmer.jpeg';
import farmValley from '../../assets/theme/farm-valley.webp';

export const HERO_BACKGROUND_IMAGE = farmValley;

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'recommendations',
    title: 'Smart Recommendations',
    description:
      'Data-driven insights for crop planning and resource optimization based on real-time soil and weather data.',
    iconName: 'zap',
    badgeColor: 'bg-[#c4f042]/20',
    textColor: 'text-[#c4f042]',
    details: {
      keyBenefit: 'Predictive sowing and harvesting timelines with 94% forecast precision',
      metrics: '+24% average yield increase in pilot farms',
      sampleAction: 'AI analyzes multi-depth soil moisture & upcoming 14-day rainfall.'
    }
  },
  {
    id: 'demand',
    title: 'Verified Demand',
    description:
      'Connect directly with verified buyers and secure contracts before harvest to guarantee income.',
    iconName: 'check-circle',
    badgeColor: 'bg-blue-400/20',
    textColor: 'text-blue-300',
    details: {
      keyBenefit: 'Guaranteed purchase agreements & transparent price indexes',
      metrics: 'Over 500+ verified food distributors and co-ops',
      sampleAction: 'Pre-negotiated contract matching based on certified harvest date.'
    }
  },
  {
    id: 'quality',
    title: 'Quality Tracking',
    description:
      'End-to-end traceability ensures product quality and builds trust with premium markets.',
    iconName: 'clipboard-list',
    badgeColor: 'bg-amber-400/20',
    textColor: 'text-amber-300',
    details: {
      keyBenefit: 'Blockchain & IoT verifiable origin certificates from seed to shelf',
      metrics: 'Zero rejected batch rates for certified growers',
      sampleAction: 'Automated batch quality grades generated from field sensor logs.'
    }
  },
  {
    id: 'credit',
    title: 'Instant Credit',
    description:
      'Access transparent financing options based on your digital farming footprint and projected yields.',
    iconName: 'badge-dollar-sign',
    badgeColor: 'bg-purple-400/20',
    textColor: 'text-purple-300',
    details: {
      keyBenefit: 'Pre-approved operational capital without predatory collateral',
      metrics: 'Underwritten within 24 hours via historical satellite indices',
      sampleAction: 'Flexible repayment aligned with seasonal harvest revenue cycles.'
    }
  }
];

export const FEATURES: FeatureCard[] = [
  {
    id: 'precision-crop',
    title: 'Precision Crop Management',
    description:
      'Track soil, crops, and weather in real time for better decisions and higher yields.',
    image: landingFieldPlough,
    alt: 'Indian farmer preparing a rice field with bullocks',
    category: 'Farm & Soil Planning',
    stats: 'Area-aware recommendations'
  },
  {
    id: 'spectral-quality',
    title: 'AI Spectral Quality & Grading',
    description:
      'Non-destructive optical grading measuring sweetness brix, internal defects, and shelf-life in seconds.',
    image:
      'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=85',
    alt: 'AI Spectral Quality & Grading optical crop assessment',
    category: 'Optical AI Diagnostics',
    stats: '99.4% Grading Accuracy'
  },
  {
    id: 'sustainable-ag',
    title: 'Sustainable Agriculture',
    description:
      'Protect soil, conserve resources, and grow long term.',
    image: landingRiceFarmer,
    alt: 'Indian farmer planting rice seedlings by hand',
    category: 'Farmer Decision Support',
    stats: 'Built around local farm data'
  }
];

export const STEPS: StepItem[] = [
  {
    stepNumber: 1,
    title: 'Tell Us About Your Farm',
    description:
      "We'll ask a few simple questions about your crops, land, and goals to understand your unique needs.",
    detail: 'Complete our 2-minute diagnostic specifying acreage, current crops, and primary production challenges.'
  },
  {
    stepNumber: 2,
    title: 'Get a Custom Plan',
    description:
      'Receive a tailored strategy combining the right sensors, software, and practices for your specific operation.',
    detail: 'Our agronomy engine maps out targeted hardware, automated valve triggers, and guaranteed buyer matches.'
  },
  {
    stepNumber: 3,
    title: 'Watch Your Farm Improve',
    description:
      'Implement the plan with our support and monitor your progress through intuitive, real-time dashboards.',
    detail: 'Track daily soil indices, irrigation efficiency, and profit forecasts directly on your phone or desktop.'
  }
];

export const IMPACT_METRICS: ImpactStat[] = [
  {
    value: '10k',
    suffix: '+',
    label: 'Farmers Empowered',
    highlight: 'Across 18 agricultural regions'
  },
  {
    value: '500',
    suffix: '+',
    label: 'Verified Buyers',
    highlight: 'Direct institutional off-takers'
  },
  {
    value: '$50',
    suffix: 'M',
    label: 'Yield Value Tracked',
    highlight: 'Protected with quality traceability'
  },
  {
    value: '95',
    suffix: '%',
    label: 'Satisfaction Rate',
    highlight: 'Farmer retention and re-contracting'
  }
];
