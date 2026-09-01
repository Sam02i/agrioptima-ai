import { useEffect, useState } from 'react';
import { ArrowRight, Building2, Sprout, X } from 'lucide-react';
import { getFarmerRecords, type FarmerRecord } from '../../api/farmers';

interface PortalChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFarmer: (farmerId?: string) => void;
  onBuyer: () => void;
}

export function PortalChoiceModal({ isOpen, onClose, onFarmer, onBuyer }: PortalChoiceModalProps) {
  const [farmers,setFarmers]=useState<FarmerRecord[]>([]);
  const [selected,setSelected]=useState('');
  const [recordsError,setRecordsError]=useState('');
  useEffect(()=>{if(!isOpen)return;getFarmerRecords().then((rows)=>{setFarmers(rows);setSelected((current)=>current||rows[0]?.farmer_id||'')}).catch(()=>setRecordsError('Start the backend to load farmer records.'))},[isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl border border-white/80">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close role selection"
          className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-[#f0fdf4] px-6 py-8 text-center sm:px-10 sm:py-10">
          <span className="inline-flex items-center rounded-full border border-[#bbf7d0] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#166534]">
            Join the AgriOptima network
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-[#052e16] sm:text-4xl">How would you like to continue?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
            Choose your workspace. You can switch between Farmer and Buyer portals at any time.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
          <div
            className="group rounded-3xl border border-emerald-100 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-[#86efac] hover:shadow-xl"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#dcfce7] text-[#166534]">
              <Sprout className="h-7 w-7" />
            </span>
            <h3 className="mt-5 font-serif text-2xl font-bold text-[#052e16]">I’m a Farmer</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">Plan crops, grade freshness, publish produce, find buyers, and optimize delivery.</p>
            {farmers.length>0&&<label className="mt-4 block text-xs font-bold uppercase tracking-wider text-[#166534]">Choose farmer profile<select value={selected} onClick={(event)=>event.stopPropagation()} onChange={(event)=>setSelected(event.target.value)} className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-gray-800 outline-none focus:ring-2 focus:ring-emerald-600">{farmers.map((farmer)=><option key={farmer.farmer_id} value={farmer.farmer_id}>{farmer.name} · {farmer.district}</option>)}</select></label>}
            {recordsError&&<small className="mt-3 block text-xs text-amber-700">{recordsError}</small>}
            <button type="button" onClick={() => onFarmer(selected || undefined)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#166534] px-4 py-2.5 text-sm font-bold text-white">Open Farmer workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
          </div>

          <button
            type="button"
            onClick={onBuyer}
            className="group rounded-3xl border border-emerald-900/10 bg-[#1b4332] p-6 text-left text-white transition-all hover:-translate-y-1 hover:bg-[#166534] hover:shadow-xl"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#c4f042] text-[#1b4332]">
              <Building2 className="h-7 w-7" />
            </span>
            <h3 className="mt-5 font-serif text-2xl font-bold">I’m a Buyer</h3>
            <p className="mt-2 text-sm leading-6 text-white/75">Access the Buyer Intelligence dashboard, farmer data, credit scoring, sourcing, and logistics.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#c4f042]">Open Buyer dashboard <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
