'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Bell,
  Box,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileCheck2,
  Handshake,
  LayoutDashboard,
  Leaf,
  MapPin,
  Menu,
  Navigation,
  PackageCheck,
  QrCode,
  Route,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  ThermometerSun,
  Truck,
  Users,
  WalletCards,
  Warehouse,
  X,
  Zap,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from './ui/progress';
import CreditPanel from '../components/CreditPanel';
import FreshnessPanel from '../components/FreshnessPanel';
import LogisticsOptimizerPanel from '../components/LogisticsOptimizerPanel';

type Seller = {
  id: string;
  crop: string;
  name: string;
  location: string;
  variety: string;
  quantity: number;
  price: number;
  freshness: number;
  reliability: number;
  distance: number;
  delivery: string;
  image: string;
};
const sellers: Seller[] = [
  {
    id: 'demo-1',
    crop: 'Tomato',
    name: 'Sahyadri Farms FPO',
    location: 'Nashik, Maharashtra',
    variety: 'Abhinav · Grade A',
    quantity: 3000,
    price: 27,
    freshness: 94,
    reliability: 96,
    distance: 82,
    delivery: 'Today, 7 PM',
    image:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'demo-2',
    crop: 'Tomato',
    name: 'Nashik Fresh Collective',
    location: 'Pimpalgaon, Maharashtra',
    variety: 'Arka Rakshak · Grade A',
    quantity: 4000,
    price: 26.5,
    freshness: 91,
    reliability: 93,
    distance: 96,
    delivery: 'Tomorrow, 8 AM',
    image:
      'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'demo-3',
    crop: 'Tomato',
    name: 'Pragati Kisan Producer Co.',
    location: 'Sinnar, Maharashtra',
    variety: 'Himsona · Grade A',
    quantity: 3000,
    price: 27.8,
    freshness: 97,
    reliability: 98,
    distance: 61,
    delivery: 'Today, 5:30 PM',
    image:
      'https://images.unsplash.com/photo-1546470427-e26264be0b0d?auto=format&fit=crop&w=900&q=85',
  },
];
const nav = [
  ['Overview', LayoutDashboard],
  ['Marketplace', Store],
  ['Smart procurement', Sparkles],
  ['Orders', ShoppingBasket],
  ['Shipments', Truck],
  ['Produce passports', FileCheck2],
  ['Credit', WalletCards],
  ['Suppliers', Users],
] as const;
const stats = [
  ['Available sellers', '248', '+18 this week', Store, 'green'],
  ['Active orders', '12', '4 need attention', ShoppingBasket, 'blue'],
  ['In transit', '07', '2 arriving today', Truck, 'amber'],
  ['Monthly procurement', '₹42.8L', '128.4 tonnes', Box, 'green'],
  ['Average saving', '8.4%', '₹3.92L saved', ArrowDownRight, 'blue'],
  ['Credit available', '₹3.8L', 'of ₹5L limit', CreditCard, 'lime'],
] as const;

function Brand() {
  return (
    <div className="brand">
      <span>
        <Leaf />
      </span>
      AgriOptima
    </div>
  );
}
function Header({ menu, onHome, onFarmer }: { menu: () => void; onHome: () => void; onFarmer: () => void }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={menu}>
        <Menu />
      </button>
      <div className="search">
        <Search />
        <input placeholder="Search sellers, orders, shipments…" />
        <kbd>⌘ K</kbd>
      </div>
      <div className="top-actions">
        <div className="exact-portal-switch">
          <button onClick={onHome}>Home</button>
          <button onClick={onFarmer}>Farmer portal</button>
        </div>
        <button className="bell">
          <Bell />
          <i />
        </button>
        <span className="avatar">AM</span>
        <div className="person">
          <b>Arjun Mehta</b>
          <small>Procurement lead</small>
        </div>
        <ChevronDown />
      </div>
    </header>
  );
}
function Sidebar({
  active,
  setActive,
  open,
  close,
}: {
  active: string;
  setActive: (v: string) => void;
  open: boolean;
  close: () => void;
}) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-head">
        <Brand />
        <button onClick={close}>
          <X />
        </button>
      </div>
      <div className="workspace">
        <span>AM</span>
        <div>
          <b>Mehta Foods</b>
          <small>Buyer workspace</small>
        </div>
        <ChevronDown />
      </div>
      <nav>
        <p>Workspace</p>
        {nav.map(([label, Icon]) => (
          <button
            className={active === label ? 'active' : ''}
            key={label}
            onClick={() => {
              setActive(label);
              close();
            }}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="credit-mini">
        <div>
          <CircleDollarSign />
          Procurement credit
        </div>
        <strong>₹3,80,000</strong>
        <small>Available of ₹5,00,000</small>
        <Progress value={24}>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <button onClick={() => setActive('Credit')}>
          View credit profile <ArrowRight />
        </button>
      </div>
    </aside>
  );
}
function Heading({
  children,
  title,
  copy,
}: {
  children?: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-heading">
      <div>
        <span className="eyebrow">Tuesday, 1 September</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {children}
    </section>
  );
}

function Overview({
  market,
  plan,
  openShipment,
}: {
  market: () => void;
  plan: () => void;
  openShipment: (id: string) => void;
}) {
  return (
    <div className="page dashboard-page">
      <section className="opening-hero">
        <div className="opening-copy">
          <span className="hero-label">
            <Sparkles /> Buyer command center · Live
          </span>
          <h1>
            Smarter procurement.
            <br />
            <em>Stronger margins.</em>
          </h1>
          <p>
            One intelligent workspace to discover verified supply, negotiate
            fairly, optimize landed cost, and track every shipment from farm to
            warehouse.
          </p>
          <div className="opening-actions">
            <Button onClick={plan}>
              Build procurement plan <ArrowRight />
            </Button>
            <Button variant="outline" onClick={market}>
              Explore verified produce
            </Button>
          </div>
          <div className="hero-proof">
            <span>
              <ShieldCheck /> 248 verified sellers
            </span>
            <span>
              <Truck /> 7 live shipments
            </span>
            <span>
              <FileCheck2 /> 100% passport coverage
            </span>
          </div>
        </div>
        <article className="market-signal">
          <div className="signal-head">
            <span>
              <i /> Live market signal
            </span>
            <small>Updated 2 min ago</small>
          </div>
          <div className="signal-main">
            <div>
              <small>Nashik · Grade A Tomato</small>
              <strong>
                ₹26.50<em>/kg</em>
              </strong>
              <span>
                <ArrowDownRight /> 4.2% below weekly average
              </span>
            </div>
            <span className="signal-grade">A</span>
          </div>
          <div className="signal-grid">
            <span>
              <small>Matched supply</small>
              <b>18.4T</b>
            </span>
            <span>
              <small>Best landed cost</small>
              <b>₹28.70/kg</b>
            </span>
            <span>
              <small>Freshness confidence</small>
              <b>94%</b>
            </span>
            <span>
              <small>Potential saving</small>
              <b>₹14,000</b>
            </span>
          </div>
          <button onClick={plan}>
            View procurement opportunity <ArrowRight />
          </button>
        </article>
      </section>
      <section className="opening-ticker">
        <span>
          <i /> Market online
        </span>
        <p>Tomato arrivals steady in Nashik</p>
        <p>Cold-chain capacity available</p>
        <p>3 supplier offers awaiting review</p>
        <b>Average saving today · 8.4%</b>
      </section>
      <section className="metrics">
        {stats.map(([label, value, note, Icon, tone]) => (
          <article className="metric" key={label}>
            <span className={tone}>
              <Icon />
            </span>
            <p>{label}</p>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </section>
      <section className="two-col">
        <article className="panel volume">
          <PanelTitle
            eyebrow="Procurement pulse"
            title="Monthly volume"
            action="Last 6 months"
          />
          <div className="chart-number">
            <strong>128.4T</strong>
            <span>
              <ArrowDownRight /> 12.8% growth
            </span>
          </div>
          <div className="bars">
            {[48, 62, 54, 72, 67, 88].map((h, i) => (
              <div key={i}>
                <i
                  style={{ height: `${h}%` }}
                  className={i === 5 ? 'now' : ''}
                />
                <small>{['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i]}</small>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <PanelTitle
            eyebrow="Live operations"
            title="Needs attention"
            badge="4 updates"
          />
          <div className="attention">
            <Alert
              icon={Clock3}
              tone="red"
              title="Shipment delayed by 2h 10m"
              copy="ORD-2048 · Nashik → Mumbai"
            />
            <Alert
              icon={Handshake}
              tone="amber"
              title="Counter offer received"
              copy="Sahyadri Farms · ₹26.40/kg"
            />
            <Alert
              icon={WalletCards}
              tone="blue"
              title="Credit repayment due 7 Sep"
              copy="₹1,20,000 · 6 days remaining"
            />
          </div>
        </article>
      </section>
      <section className="opportunity">
        <div>
          <span className="ai">
            <Sparkles /> Procurement intelligence
          </span>
          <h2>
            Fulfil your 10T tomato requirement with <em>3 verified sellers.</em>
          </h2>
          <p>
            Clubbed logistics keeps freshness risk low while reducing landed
            cost by ₹1.40/kg.
          </p>
          <div className="opp-stats">
            <span>
              <small>Expected landed cost</small>
              <b>₹28.70/kg</b>
            </span>
            <span>
              <small>Potential saving</small>
              <b>₹14,000</b>
            </span>
            <span>
              <small>Delivery</small>
              <b>Tomorrow, 2–4 PM</b>
            </span>
          </div>
          <div className="actions">
            <Button onClick={plan}>
              Build procurement plan <ArrowRight />
            </Button>
            <Button variant="ghost" onClick={market}>
              Review matched sellers
            </Button>
          </div>
        </div>
        <RouteMap />
      </section>
      <section className="two-col lower">
        <article className="panel">
          <PanelTitle
            eyebrow="Arriving today"
            title="Live shipments"
            action="View all"
          />
          <Shipment
            crop="Tomato"
            qty="4,000 kg"
            order="ORD-2048 · Nashik Fresh"
            status="In transit"
            eta="ETA 2:10 PM"
            onClick={() => openShipment('SHP-2048')}
          />
          <Shipment
            crop="Red Onion"
            qty="2,500 kg"
            order="ORD-2043 · Lasalgaon FPO"
            status="Delayed 35m"
            eta="ETA 4:45 PM"
            delay
            onClick={() => openShipment('SHP-2043')}
          />
        </article>
        <article className="panel quality">
          <PanelTitle
            eyebrow="Quality assurance"
            title="Supplier reliability"
          />
          <div className="score">
            <strong>94</strong>
            <small>/100</small>
          </div>
          <div>
            <b>Strong network quality</b>
            <p>94.8% average on-time fulfilment across preferred suppliers.</p>
          </div>
          <div className="quality-stats">
            <span>
              <b>2.1%</b>
              <small>Rejection rate</small>
            </span>
            <span>
              <b>91%</b>
              <small>Fresh on arrival</small>
            </span>
          </div>
        </article>
      </section>
    </div>
  );
}
function PanelTitle({
  eyebrow,
  title,
  action,
  badge,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  badge?: string;
}) {
  return (
    <div className="panel-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <button>
          {action}
          <ChevronDown />
        </button>
      )}
      {badge && <Badge>{badge}</Badge>}
    </div>
  );
}
function Alert({
  icon: Icon,
  tone,
  title,
  copy,
}: {
  icon: typeof Clock3;
  tone: string;
  title: string;
  copy: string;
}) {
  return (
    <button>
      <span className={tone}>
        <Icon />
      </span>
      <div>
        <b>{title}</b>
        <small>{copy}</small>
      </div>
      <ArrowRight />
    </button>
  );
}
function RouteMap() {
  return (
    <div className="route-map">
      <span className="node n1">
        <Leaf />
        3T<small>Nashik</small>
      </span>
      <span className="node n2">
        <Leaf />
        4T<small>Pimpalgaon</small>
      </span>
      <span className="node n3">
        <Leaf />
        3T<small>Sinnar</small>
      </span>
      <i className="r1" />
      <i className="r2" />
      <i className="r3" />
      <span className="node hub">
        <Truck />
        10T<small>Clubbed</small>
      </span>
    </div>
  );
}
function Shipment({
  crop,
  qty,
  order,
  status,
  eta,
  delay,
  onClick,
}: {
  crop: string;
  qty: string;
  order: string;
  status: string;
  eta: string;
  delay?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="shipment" onClick={onClick}>
      <span className={`produce ${crop === 'Tomato' ? 'tomato' : 'onion'}`} />
      <span>
        <b>
          {qty} {crop}
        </b>
        <small>{order}</small>
      </span>
      <span className={delay ? 'delay' : ''}>
        <span>
          <i />
          {status}
        </span>
        <b>{eta}</b>
      </span>
      <span className="shipment-open">
        <ArrowRight />
      </span>
    </button>
  );
}

function Marketplace({
  selected,
  toggle,
}: {
  selected: string[];
  toggle: (id: string) => void;
}) {
  const [liveSellers,setLiveSellers]=useState<Seller[]>(sellers);
  useEffect(()=>{Promise.all([fetch('http://127.0.0.1:8000/marketplace/listings').then((r)=>r.json()),fetch('http://127.0.0.1:8000/marketplace/farmers').then((r)=>r.json())]).then(([listingData,farmerData])=>{const farmersById=new Map((farmerData.farmers||[]).map((farmer:any)=>[farmer.farmer_id,farmer]));const rows=(listingData.listings||[]).map((listing:any,index:number)=>{const farmer:any=farmersById.get(listing.farmer_id)||{};const crop=listing.crop_name||'Produce';const palette=['#dfe8cf','#f2d7bd','#d6e7df','#eee0bd','#d8d8ef'];const emoji:Record<string,string>={tomato:'🍅',onion:'🧅',orange:'🍊',soybean:'🌱',cotton:'☁️'};const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520"><rect width="100%" height="100%" fill="${palette[index%palette.length]}"/><circle cx="450" cy="230" r="145" fill="#ffffff77"/><text x="450" y="285" text-anchor="middle" font-size="170">${emoji[crop.toLowerCase()]||'🌾'}</text><text x="450" y="455" text-anchor="middle" font-family="Arial" font-size="30" fill="#173f2b">${crop} · ${farmer.name||listing.farmer_name}</text></svg>`;return{id:String(listing.listing_id),crop,name:farmer.name||listing.farmer_name||'Verified farmer',location:`${listing.district}, ${listing.state}`,variety:`${listing.crop_variety||'Standard'} · ${listing.declared_grade||'Verified'}`,quantity:Number(listing.available_quantity_kg||listing.quantity_kg||0),price:Number(listing.price_per_kg||0),freshness:88+(index%10),reliability:90+(index%8),distance:45+index*13,delivery:index%2?'Tomorrow, 8 AM':'Today, 7 PM',image:`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`}});if(rows.length)setLiveSellers(rows)}).catch(()=>undefined)},[]);
  return (
    <div className="page">
      <Heading
        title="Available produce"
        copy="Compare true landed cost—not just the quoted price."
      >
        <Button>
          <ShoppingBasket />
          Post requirement
        </Button>
      </Heading>
      <section className="filters">
        <div className="search">
          <Search />
          <input defaultValue="Tomato" />
        </div>
        <button>
          Grade A <ChevronDown />
        </button>
        <button>
          Within 150 km <ChevronDown />
        </button>
        <button>
          Harvested today <ChevronDown />
        </button>
        <span>{liveSellers.length} verified farmer listings</span>
      </section>
      <section className="seller-grid">
        {liveSellers.map((s, i) => (
          <article className="seller-card" key={s.id}>
            <div
              className="seller-img"
              style={{ backgroundImage: `url(${s.image})` }}
            >
              <span>
                <Zap />
                {s.freshness}% fresh
              </span>
              <button
                className={selected.includes(s.id) ? 'selected' : ''}
                onClick={() => toggle(s.id)}
              >
                {selected.includes(s.id) ? '✓ Added' : '+ Compare'}
              </button>
            </div>
            <div className="seller-body">
              <div className="seller-title">
                <div>
                  <span>{s.crop} · {s.variety}</span>
                  <h2>{s.name}</h2>
                  <p>
                    <MapPin />
                    {s.location} · {s.distance} km
                  </p>
                </div>
                <div>
                  <strong>₹{s.price}</strong>
                  <small>/kg</small>
                </div>
              </div>
              <div className="badges">
                <Badge>
                  <ShieldCheck />
                  AI verified
                </Badge>
                <Badge variant="outline">Passport ready</Badge>
                <Badge variant="outline">Grade A</Badge>
              </div>
              <div className="facts">
                <span>
                  <small>Available</small>
                  <b>{s.quantity.toLocaleString('en-IN')} kg</b>
                </span>
                <span>
                  <small>Harvest</small>
                  <b>Today, 5:30 AM</b>
                </span>
                <span>
                  <small>Delivery</small>
                  <b>{s.delivery}</b>
                </span>
                <span>
                  <small>Reliability</small>
                  <b>
                    <Star />
                    {s.reliability}%
                  </b>
                </span>
              </div>
              {i === 0 && (
                <div className="best">
                  <Sparkles />
                  Best landed cost · est. ₹28.80/kg
                </div>
              )}
              {i === 2 && (
                <div className="best quality-best">
                  <ShieldCheck />
                  Best quality · 97% freshness
                </div>
              )}
              <div className="seller-actions">
                <Button variant="outline">View farmer</Button>
                <Button onClick={() => toggle(s.id)}>{selected.includes(s.id)?'Added to plan':'Add to plan'}</Button>
              </div>
            </div>
          </article>
        ))}
      </section>
      {selected.length > 0 && (
        <div className="compare-dock">
          <span>
            <b>{selected.length} sellers selected</b>
            <small>Select at least 2 to compare landed cost</small>
          </span>
          <Button disabled={selected.length < 2}>
            Compare sellers <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}

function SmartPlan() {
  const [method, setMethod] = useState<'clubbed' | 'direct'>('clubbed');
  const logistics = method === 'clubbed' ? 8500 : 14000;
  return (
    <div className="page">
      <Heading
        title="Smart procurement plan"
        copy="One requirement, three verified sellers, one coordinated delivery."
      >
        <Badge className="verified">
          <ShieldCheck />
          Plan verified
        </Badge>
      </Heading>
      <section className="plan-hero">
        <div>
          <span className="ai">
            <Sparkles /> Recommended plan
          </span>
          <h2>Club 3 nearby sellers and save ₹13,000 on logistics.</h2>
          <p>
            Waiting 9 hours reduces logistics cost with low projected freshness
            risk.
          </p>
        </div>
        <div>
          <small>Expected landed cost</small>
          <strong>
            ₹{method === 'clubbed' ? '28.70' : '30.10'}
            <em>/kg</em>
          </strong>
          <span>₹2,87,000 total</span>
        </div>
      </section>
      <section className="plan-grid">
        <article className="panel allocation">
          <PanelTitle
            eyebrow="Quantity engine"
            title="Seller allocation"
            badge="10T / 10T matched"
          />
          {sellers.map((s, i) => (
            <div className="alloc" key={s.id}>
              <span>0{i + 1}</span>
              <div>
                <b>{s.name}</b>
                <small>
                  {s.location} · {s.freshness}% fresh
                </small>
              </div>
              <div>
                <b>{s.quantity / 1000}T</b>
                <small>₹{s.price}/kg</small>
              </div>
            </div>
          ))}
        </article>
        <article className="panel economics">
          <PanelTitle eyebrow="Landed cost engine" title="Complete economics" />
          <dl>
            <div>
              <dt>Commodity cost</dt>
              <dd>₹2,70,400</dd>
            </div>
            <div>
              <dt>Transportation</dt>
              <dd>₹{logistics.toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt>Handling & packaging</dt>
              <dd>₹4,600</dd>
            </div>
            <div>
              <dt>Expected spoilage</dt>
              <dd>₹3,500</dd>
            </div>
            <div>
              <dt>Expected landed cost</dt>
              <dd>₹{(278500 + logistics).toLocaleString('en-IN')}</dd>
            </div>
          </dl>
        </article>
      </section>
      <section className="shipment-choice">
        <PanelTitle
          eyebrow="Shipment decision"
          title="Choose speed or savings"
        />
        <div className="choices">
          <Choice
            chosen={method === 'direct'}
            onClick={() => setMethod('direct')}
            icon={Zap}
            overline="Direct shipment"
            title="Fastest delivery"
            copy="Dedicated pickup with the lowest waiting time."
            data={[
              ['Delivery', 'Today, 7 PM'],
              ['Logistics', '₹14,000'],
              ['Landed cost', '₹30.10/kg'],
            ]}
          />
          <Choice
            chosen={method === 'clubbed'}
            recommended
            onClick={() => setMethod('clubbed')}
            icon={Truck}
            overline="Clubbed shipment"
            title="Best landed cost"
            copy="Consolidated pickup. +9 hours, low freshness risk."
            data={[
              ['Delivery', 'Tomorrow, 2–4 PM'],
              ['Logistics', '₹8,500'],
              ['You save', '₹5,500'],
            ]}
          />
        </div>
        <div className="risk">
          <ShieldCheck />
          <span>
            <b>Consolidation recommended</b>
            <small>
              Waiting 9 hours reduces cost while projected arrival freshness
              remains “Fresh”.
            </small>
          </span>
          <Button>
            Continue with {method}
            <ArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}
function Choice({
  chosen,
  recommended,
  onClick,
  icon: Icon,
  overline,
  title,
  copy,
  data,
}: {
  chosen: boolean;
  recommended?: boolean;
  onClick: () => void;
  icon: typeof Zap;
  overline: string;
  title: string;
  copy: string;
  data: string[][];
}) {
  return (
    <button className={chosen ? 'chosen' : ''} onClick={onClick}>
      {recommended && <Badge>Recommended</Badge>}
      <span className="choice-icon">
        <Icon />
      </span>
      <div>
        <span>{overline}</span>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
      <dl>
        {data.map(([a, b]) => (
          <div key={a}>
            <dt>{a}</dt>
            <dd>{b}</dd>
          </div>
        ))}
      </dl>
    </button>
  );
}

function TrackingMap({ delayed }: { delayed: boolean }) {
  const mapNode = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mapNode.current) return;
    let map: import('leaflet').Map | undefined;
    let cancelled = false;
    void import('leaflet').then((L) => {
      if (cancelled || !mapNode.current) return;
      const origin: [number, number] = delayed
        ? [20.148, 74.24]
        : [20.011, 73.79];
      const current: [number, number] = delayed
        ? [19.916, 73.84]
        : [19.696, 73.56];
      const destination: [number, number] = [19.076, 72.877];
      const routePoints: [number, number][] = delayed
        ? [
            origin,
            [20.04, 74.08],
            current,
            [19.62, 73.42],
            [19.31, 73.08],
            destination,
          ]
        : [
            origin,
            [19.91, 73.72],
            current,
            [19.53, 73.37],
            [19.31, 73.08],
            destination,
          ];
      map = L.map(mapNode.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.polyline(routePoints, {
        color: '#b5cf28',
        weight: 5,
        opacity: 0.95,
      }).addTo(map);
      L.polyline(
        routePoints.slice(routePoints.findIndex((p) => p === current)),
        { color: '#d6ddd2', weight: 5, dashArray: '7 8', opacity: 0.95 },
      ).addTo(map);
      const marker = (pos: [number, number], kind: string, label: string) =>
        L.marker(pos, {
          icon: L.divIcon({
            className: 'passport-map-marker',
            html: `<span class="${kind}"></span><b>${label}</b>`,
            iconSize: [110, 38],
            iconAnchor: [18, 18],
          }),
        }).addTo(map!);
      marker(origin, 'origin', 'Pickup');
      marker(current, delayed ? 'truck delayed' : 'truck', 'Current location');
      marker(destination, 'destination', 'Mehta Foods');
      map.fitBounds(L.latLngBounds(routePoints).pad(0.16));
      setTimeout(() => map?.invalidateSize(), 80);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [delayed]);
  return (
    <div
      ref={mapNode}
      className="tracking-map"
      aria-label="Interactive live shipment tracking map"
    />
  );
}

function DigitalPassport({ id, close }: { id: string; close: () => void }) {
  const delayed = id === 'SHP-2043';
  const shipment = delayed
    ? {
        produce: 'Red Onion',
        variety: 'Nashik Red · Grade A',
        qty: '2,500 kg',
        seller: 'Lasalgaon Farmer Producer Co.',
        origin: 'Lasalgaon, Nashik',
        current: 'Kasara, Maharashtra',
        truck: 'MH-15-HH-2841',
        driver: 'Suresh Patil',
        eta: 'Today, 4:45 PM',
        remaining: '87 km',
        status: 'Delayed 35m',
        freshness: 'Fresh · Level 2',
        confidence: '89%',
        risk: 'Moderate',
      }
    : id === 'SHP-2050' ? {
        produce: 'Orange',
        variety: 'Nagpur Mandarin · Grade A',
        qty: '3,200 kg',
        seller: 'Vijay Deshmukh · Katol Citrus Grove',
        origin: 'Katol, Nagpur',
        current: 'Amravati Highway, Maharashtra',
        truck: 'MH-31-FQ-1902',
        driver: 'Amit Deshmukh',
        eta: 'Tomorrow, 8:30 AM',
        remaining: '612 km',
        status: 'Dispatched',
        freshness: 'Very fresh · Level 1',
        confidence: '96%',
        risk: 'Low',
      }
    : {
        produce: 'Tomato',
        variety: 'Arka Rakshak · Grade A',
        qty: '4,000 kg',
        seller: 'Nashik Fresh Collective',
        origin: 'Pimpalgaon, Nashik',
        current: 'Igatpuri, Maharashtra',
        truck: 'MH-04-KU-8824',
        driver: 'Rahul Jadhav',
        eta: 'Today, 2:10 PM',
        remaining: '112 km',
        status: 'In transit',
        freshness: 'Very fresh · Level 1',
        confidence: '94%',
        risk: 'Low',
      };
  const events = delayed
    ? [
        ['12:04 PM', 'Traffic delay detected', 'Current'],
        ['11:45 AM', 'Crossed Ghoti checkpoint', 'Done'],
        ['10:30 AM', 'Vehicle departed Lasalgaon', 'Done'],
        ['10:22 AM', 'Dispatch verification completed', 'Done'],
        ['10:05 AM', 'Produce collected', 'Done'],
      ]
    : [
        ['12:04 PM', 'Crossed Igatpuri checkpoint', 'Current'],
        ['11:45 AM', 'Temperature check · 18.4°C', 'Done'],
        ['10:30 AM', 'Vehicle departed Pimpalgaon', 'Done'],
        ['10:22 AM', 'Dispatch verification completed', 'Done'],
        ['10:05 AM', 'Produce collected', 'Done'],
      ];
  return (
    <section
      className="passport-screen"
      role="dialog"
      aria-modal="true"
      aria-label={`Digital produce passport ${id}`}
    >
      <header className="passport-top">
        <button onClick={close}>
          <ArrowLeft />
          Back to dashboard
        </button>
        <Brand />
        <div>
          <span className="live-dot">
            <i />
            Live tracking
          </span>
          <button onClick={close} aria-label="Close passport">
            <X />
          </button>
        </div>
      </header>
      <div className="passport-page">
        <section className="passport-heading">
          <div>
            <span className="eyebrow">Digital produce passport</span>
            <h1>
              {shipment.produce} · {shipment.qty}
            </h1>
            <p>
              {id} · Order ORD-{id.slice(-4)} · Updated just now
            </p>
          </div>
          <div className="passport-badges">
            <Badge>
              <ShieldCheck />
              AI verified
            </Badge>
            <Badge>
              <FileCheck2 />
              FPO verified
            </Badge>
            <Badge>
              <CheckCircle2 />
              Dispatch verified
            </Badge>
          </div>
        </section>
        <section className="passport-hero">
          <div className="passport-id">
            <div
              className={`passport-photo ${delayed ? 'passport-onion' : 'passport-tomato'}`}
            >
              <span>{shipment.freshness}</span>
            </div>
            <div className="passport-copy">
              <span>Shipment passport</span>
              <h2>{id}</h2>
              <p>Authenticated farm-to-buyer record</p>
              <div className="passport-chips">
                <span>
                  <Leaf />
                  Grade A
                </span>
                <span>
                  <ThermometerSun />
                  {shipment.confidence} AI confidence
                </span>
                <span>
                  <CalendarDays />
                  Harvested today
                </span>
              </div>
            </div>
            <div className="qr">
              <QrCode />
              <small>Scan passport</small>
              <b>AO-{id.slice(-4)}-09</b>
            </div>
          </div>
          <div className="passport-summary">
            <div>
              <span>Shipment status</span>
              <b className={delayed ? 'warning' : ''}>
                <i />
                {shipment.status}
              </b>
            </div>
            <div>
              <span>Current location</span>
              <b>{shipment.current}</b>
            </div>
            <div>
              <span>Expected arrival</span>
              <b>{shipment.eta}</b>
            </div>
            <div>
              <span>Freshness risk</span>
              <b>{shipment.risk}</b>
            </div>
          </div>
        </section>
        <section className="tracking-layout">
          <article className="map-card">
            <div className="map-head">
              <div>
                <span className="eyebrow">Live GPS position</span>
                <h2>Nashik → Mumbai warehouse</h2>
              </div>
              <span className="map-updated">
                <i />
                Updated 24 sec ago
              </span>
            </div>
            <TrackingMap delayed={delayed} />
            <div className="map-stats">
              <span>
                <Navigation />
                <small>Current</small>
                <b>{shipment.current}</b>
              </span>
              <span>
                <Route />
                <small>Remaining</small>
                <b>{shipment.remaining} · 2h 06m</b>
              </span>
              <span>
                <Warehouse />
                <small>Destination</small>
                <b>Mehta Foods, Vashi</b>
              </span>
              <span>
                <Clock3 />
                <small>ETA</small>
                <b>{shipment.eta}</b>
              </span>
            </div>
          </article>
          <aside className="timeline-card">
            <div className="timeline-head">
              <span className="eyebrow">Live events</span>
              <h2>Shipment timeline</h2>
            </div>
            <div className="live-events">
              {events.map(([time, label, state], index) => (
                <div
                  className={state === 'Current' ? 'current' : ''}
                  key={label}
                >
                  <span>{state === 'Current' ? <Truck /> : <Check />}</span>
                  <div>
                    <b>{label}</b>
                    <small>
                      {time}
                      {index === 0 ? ' · Live' : ''}
                    </small>
                  </div>
                </div>
              ))}
            </div>
            <div className={`freshness-alert ${delayed ? 'moderate' : ''}`}>
              <ThermometerSun />
              <div>
                <span>Projected arrival freshness</span>
                <b>{delayed ? 'Fresh · Level 2' : 'Fresh · Level 2'}</b>
                <small>
                  {delayed
                    ? 'Delay is being monitored; cold-chain remains stable.'
                    : 'Low risk. Expected quality change: −1 freshness level.'}
                </small>
              </div>
            </div>
          </aside>
        </section>
        <section className="passport-details">
          <article className="detail-card">
            <PanelTitle eyebrow="Shipment details" title="Origin & transport" />
            <dl>
              <div>
                <dt>Farmer / FPO</dt>
                <dd>{shipment.seller}</dd>
              </div>
              <div>
                <dt>Farm origin</dt>
                <dd>{shipment.origin}</dd>
              </div>
              <div>
                <dt>Harvest date</dt>
                <dd>1 Sep 2026 · 5:30 AM</dd>
              </div>
              <div>
                <dt>Quantity dispatched</dt>
                <dd>{shipment.qty}</dd>
              </div>
              <div>
                <dt>Vehicle</dt>
                <dd>{shipment.truck}</dd>
              </div>
              <div>
                <dt>Driver</dt>
                <dd>{shipment.driver}</dd>
              </div>
            </dl>
          </article>
          <article className="detail-card">
            <PanelTitle
              eyebrow="Quality intelligence"
              title="Dispatch verification"
            />
            <div className="quality-comparison">
              <div>
                <span>Dispatch quality</span>
                <strong>Level 1</strong>
                <b>Very fresh</b>
                <small>AI confidence · {shipment.confidence}</small>
              </div>
              <ArrowRight />
              <div>
                <span>Projected arrival</span>
                <strong>Level 2</strong>
                <b>Fresh</b>
                <small>Change · −1 level</small>
              </div>
            </div>
            <div className="acceptance">
              <ShieldCheck />
              <span>
                <b>Auto-accept eligible</b>
                <small>
                  Projected quality remains within your Grade A tolerance.
                </small>
              </span>
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}

const buyerOrders=[
  {id:'ORD-2041',shipment:'SHP-2041',crop:'Tomato',qty:'4,000 kg',supplier:'Nashik Fresh Collective',status:'In transit',eta:'Today, 2:10 PM',amount:'₹1,06,000'},
  {id:'ORD-2043',shipment:'SHP-2043',crop:'Red Onion',qty:'2,500 kg',supplier:'Lasalgaon Farmer Producer Co.',status:'Delayed 35m',eta:'Today, 4:45 PM',amount:'₹62,500'},
  {id:'ORD-2050',shipment:'SHP-2050',crop:'Orange',qty:'3,200 kg',supplier:'Vijay Deshmukh · Katol',status:'Dispatched',eta:'Tomorrow, 8:30 AM',amount:'₹1,12,000'},
];

function OrdersPage({openPassport}:{openPassport:(id:string)=>void}){
  return <div className="page"><Heading title="Orders" copy="Track active procurement orders from farmer pickup to warehouse receipt."/><section className="order-list">{buyerOrders.map((order)=><button key={order.id} className="order-row" onClick={()=>openPassport(order.shipment)}><span className={`produce ${order.crop==='Tomato'?'tomato':'onion'}`}/><span><small>{order.id}</small><b>{order.qty} {order.crop}</b><small>{order.supplier}</small></span><span><small>Order value</small><b>{order.amount}</b></span><span><small>Status</small><b>{order.status}</b><small>{order.eta}</small></span><ArrowRight/></button>)}</section></div>
}

function PassportsPage({openPassport}:{openPassport:(id:string)=>void}){
  return <div className="page"><Heading title="Produce passports" copy="Review current shipment passports and verify received quality with the freshness engine."/><section className="passport-order-grid">{buyerOrders.map((order)=><article key={order.id} className="passport-order-card"><span className="eyebrow">Digital produce passport</span><h2>{order.crop} · {order.qty}</h2><p>{order.shipment} · {order.supplier}</p><div><Badge><ShieldCheck/> Dispatch verified</Badge><Badge variant="outline">{order.status}</Badge></div><Button onClick={()=>openPassport(order.shipment)}>Open passport & tracking <ArrowRight/></Button></article>)}</section><section className="connected-engine"><div><span className="eyebrow">Receiving quality verification</span><h2>Upload received produce images</h2><p>The trained freshness engine grades the received shipment and provides confidence evidence before acceptance.</p></div><FreshnessPanel/></section></div>
}

function CreditEnginePage(){return <div className="page"><Heading title="Credit" copy="Live procurement-credit scores, limits, repayment behaviour, and risk evidence."/><section className="connected-engine"><CreditPanel/></section></div>}
function SupplierLogisticsPage(){return <div className="page"><Heading title="Suppliers & logistics" copy="Use connected farmer pickups to compare direct, pooled, and collection-hub landed cost."/><section className="connected-engine"><LogisticsOptimizerPanel/></section></div>}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="page">
      <Heading
        title={title}
        copy="This workspace is connected to your complete procurement journey."
      />
      <section className="empty">
        <span>
          <PackageCheck />
        </span>
        <h2>{title} is ready for your demo journey</h2>
        <p>
          Open Marketplace to select sellers, negotiate a rate, and build a
          consolidated 10-tonne tomato plan.
        </p>
        <Button variant="outline">Explore sample records</Button>
      </section>
    </div>
  );
}
function Negotiation({ seller, close }: { seller: Seller; close: () => void }) {
  const min =
    seller.price < 30
      ? seller.price - 5
      : seller.price < 100
        ? seller.price - 10
        : seller.price - Math.min(seller.price * 0.2, 50);
  const [offer, setOffer] = useState(seller.price - 2);
  const saving = (seller.price - offer) * seller.quantity;
  return (
    <div className="modal-bg" onMouseDown={close}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">Controlled negotiation</span>
            <h2>Send an offer to {seller.name}</h2>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <div className="quote">
          <span>
            <small>Seller price</small>
            <b>₹{seller.price}/kg</b>
          </span>
          <span>
            <small>Quantity</small>
            <b>{seller.quantity.toLocaleString('en-IN')} kg</b>
          </span>
          <span>
            <small>Allowed range</small>
            <b>
              ₹{min.toFixed(1)}–₹{seller.price}
            </b>
          </span>
        </div>
        <div className="offer">
          <div>
            <span>Your offer</span>
            <strong>
              ₹{offer.toFixed(2)}
              <small>/kg</small>
            </strong>
          </div>
          <input
            type="range"
            min={min}
            max={seller.price}
            step=".1"
            value={offer}
            onChange={(e) => setOffer(Number(e.target.value))}
          />
          <p>
            <span>₹{min.toFixed(1)} minimum</span>
            <span>₹{seller.price} seller price</span>
          </p>
        </div>
        <div className="saving">
          <span>
            <small>Saving per kg</small>
            <b>₹{(seller.price - offer).toFixed(2)}</b>
          </span>
          <span>
            <small>Total potential saving</small>
            <b>₹{saving.toLocaleString('en-IN')}</b>
          </span>
          <span>
            <small>Est. landed cost</small>
            <b>₹{(offer + 1.8).toFixed(2)}/kg</b>
          </span>
        </div>
        <div className="guard">
          <ShieldCheck />
          <span>
            <b>Fair-price guardrail active</b>
            <small>
              Offers below ₹{min.toFixed(1)}/kg are blocked for this commodity
              band.
            </small>
          </span>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={close}>
            Send offer
            <ArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function BuyerExactContent({ onHome, onFarmer }: { onHome:()=>void; onFarmer:()=>void }) {
  const [active, setActive] = useState('Overview');
  const [selected, setSelected] = useState<string[]>([]);
  const [passport, setPassport] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  let content: React.ReactNode;
  if (active === 'Overview')
    content = (
      <Overview
        market={() => setActive('Marketplace')}
        plan={() => setActive('Smart procurement')}
        openShipment={setPassport}
      />
    );
  else if (active === 'Marketplace')
    content = (
      <Marketplace
        selected={selected}
        toggle={(id) =>
          setSelected((v) =>
            v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
          )
        }
      />
    );
  else if (active === 'Smart procurement') content = <SmartPlan />;
  else if (active === 'Orders' || active === 'Shipments') content = <OrdersPage openPassport={setPassport}/>;
  else if (active === 'Produce passports') content = <PassportsPage openPassport={setPassport}/>;
  else if (active === 'Credit') content = <CreditEnginePage/>;
  else if (active === 'Suppliers') content = <SupplierLogisticsPage/>;
  else content = <Placeholder title={active} />;
  return (
    <main className="app">
      <Sidebar
        active={active}
        setActive={setActive}
        open={menu}
        close={() => setMenu(false)}
      />
      <div className="main">
        <Header menu={() => setMenu(true)} onHome={onHome} onFarmer={onFarmer} />
        {content}
      </div>
      {menu && <button className="overlay" onClick={() => setMenu(false)} />}{' '}
      {passport && (
        <DigitalPassport id={passport} close={() => setPassport(null)} />
      )}
    </main>
  );
}
