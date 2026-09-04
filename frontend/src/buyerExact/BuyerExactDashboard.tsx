import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import BuyerExactContent from './BuyerExactContent';
import frameworkCss from './styles/framework.css?inline';
import pageCss from './styles/page.css?inline';
import leafletCss from 'leaflet/dist/leaflet.css?inline';
import appCss from '../index.css?inline';
import marketplaceFixCss from '../buyerMarketplaceFixes.css?inline';
import buyerInteractiveCss from '../buyerInteractive.css?inline';
import farmEditorialThemeCss from '../farmEditorialTheme.css?inline';

const integrationCss=`.order-list{display:grid;gap:12px}.order-row{width:100%;display:grid;grid-template-columns:44px minmax(220px,1fr) 150px 180px 24px;align-items:center;gap:16px;padding:18px;border:1px solid #EAE7DD;border-radius:14px;background:#EAE7DD;text-align:left}.order-row:hover{border-color:#26483E;box-shadow:0 8px 22px #26483E12}.order-row>span b,.order-row>span small{display:block}.order-row>span small{margin:3px 0;color:#26483E;font-size:9px}.order-row>span b{font-size:12px}.passport-order-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.passport-order-card{padding:22px;border:1px solid #EAE7DD;border-radius:16px;background:#EAE7DD}.passport-order-card h2{margin:8px 0;font:22px Georgia,serif}.passport-order-card p{min-height:38px;color:#26483E;font-size:10px}.passport-order-card>div{display:flex;flex-wrap:wrap;gap:6px;margin:16px 0}.connected-engine{margin-top:22px;padding:22px;border:1px solid #EAE7DD;border-radius:17px;background:#EAE7DD}.connected-engine>div:first-child h2{margin:6px 0;font:26px Georgia,serif}.connected-engine>div:first-child p{color:#26483E;font-size:11px}.connected-engine .space-y-6{margin-top:18px}@media(max-width:820px){.order-row{grid-template-columns:38px 1fr 22px}.order-row>span:nth-child(3),.order-row>span:nth-child(4){grid-column:2}.passport-order-grid{grid-template-columns:1fr}}`;

export default function BuyerExactDashboard({ onHome, onFarmer }: { onHome:()=>void; onFarmer:()=>void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const shadow = hostRef.current.shadowRoot ?? hostRef.current.attachShadow({ mode: 'open' });
    setRoot(shadow);
  }, []);

  return (
    <div ref={hostRef} className="buyer-exact-host">
      {root && createPortal(<><style>{frameworkCss + pageCss + leafletCss + appCss + marketplaceFixCss + buyerInteractiveCss + integrationCss + `.exact-portal-switch{display:flex;gap:4px;padding:3px;border-radius:9px;background:#EAE7DD}.exact-portal-switch button{padding:6px 9px;border:0;border-radius:7px;background:transparent;color:#26483E;font-size:9px}.exact-portal-switch button:hover{background:#EAE7DD;color:#26483E}@media(max-width:820px){.exact-portal-switch{position:fixed;right:14px;bottom:14px;z-index:24;box-shadow:0 8px 25px #26483E25}}` + farmEditorialThemeCss}</style><BuyerExactContent onHome={onHome} onFarmer={onFarmer} /></>, root)}
    </div>
  );
}
