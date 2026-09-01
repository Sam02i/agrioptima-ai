import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import BuyerExactContent from './BuyerExactContent';
import frameworkCss from './styles/framework.css?inline';
import pageCss from './styles/page.css?inline';
import leafletCss from 'leaflet/dist/leaflet.css?inline';

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
      {root && createPortal(<><style>{frameworkCss + pageCss + leafletCss + `.exact-portal-switch{display:flex;gap:4px;padding:3px;border-radius:9px;background:#ecebe2}.exact-portal-switch button{padding:6px 9px;border:0;border-radius:7px;background:transparent;color:#58645b;font-size:9px}.exact-portal-switch button:hover{background:#fffef8;color:#173f2b}@media(max-width:820px){.exact-portal-switch{position:fixed;right:14px;bottom:14px;z-index:24;box-shadow:0 8px 25px #173f2b25}}`}</style><BuyerExactContent onHome={onHome} onFarmer={onFarmer} /></>, root)}
    </div>
  );
}
