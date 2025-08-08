import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, Clock, MapPin, Users, User, PlusCircle, X, Bell,
  LayoutDashboard, ListOrdered, MonitorSmartphone, ChevronRight, ChevronLeft,
  CheckCircle2, Search, Settings, QrCode,
} from "lucide-react";

/**************************************
 * QueueEasy – FRONTEND MVP (React + Tailwind)
 * Single-file for demo; simulated data & realtime.
 **************************************/
const STAFF = [
  { id: "s1", name: "Alex", role: "Barber" },
  { id: "s2", name: "Bea", role: "Stylist" },
  { id: "s3", name: "Carlo", role: "Therapist" },
];
const SERVICES = [
  { id: "svc1", name: "Haircut", mins: 45 },
  { id: "svc2", name: "Shave", mins: 30 },
  { id: "svc3", name: "Color", mins: 60 },
  { id: "svc4", name: "Massage", mins: 60 },
];
const SHOPS = [
  { id: "shop1", name: "QueueEasy Demo – Pioneer", address: "123 Pioneer St, Mandaluyong, Metro Manila", hours: { open: 9, close: 19 }, phone: "+63 917 000 0000", coords: { lat: 14.58, lng: 121.06 } },
  { id: "shop2", name: "QueueEasy Demo – BGC", address: "7th Ave, Bonifacio Global City, Taguig", hours: { open: 10, close: 20 }, phone: "+63 918 000 0000", coords: { lat: 14.55, lng: 121.05 } },
];
const fmtTime = (h, m = 0) => `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
function genTimeSlots(hours){ const slots=[]; for(let h=hours.open; h<hours.close; h++){ slots.push({id:`${h}:00`,label:fmtTime(h,0)}); slots.push({id:`${h}:30`,label:fmtTime(h,30)});} return slots;}
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(36).slice(2,9)}`;}
function loadLocal(key,fallback){ try{ const raw=localStorage.getItem(key); return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
function saveLocal(key,value){ try{ localStorage.setItem(key, JSON.stringify(value)); }catch{} }

function Toast({ message, onClose }){
  useEffect(()=>{ const t=setTimeout(onClose,2500); return ()=>clearTimeout(t)},[onClose]);
  return (<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl flex items-center gap-2">
    <CheckCircle2 className="w-5 h-5" /><span className="text-sm">{message}</span></div>);
}
const Card=({children,className=""})=>(<div className={`rounded-2xl bg-white/80 backdrop-blur shadow-sm border border-slate-200 ${className}`}>{children}</div>);
const SectionTitle=({icon:Icon,title,hint})=>(<div className="flex items-center gap-2 mb-3"><Icon className="w-5 h-5"/><h3 className="font-semibold text-slate-800">{title}</h3>{hint&&<span className="text-xs text-slate-500">{hint}</span>}</div>);
const Pill=({children})=>(<span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">{children}</span>);

function InstallBanner(){
  const [show,setShow]=useState(()=>loadLocal("qe_install_dismissed",false)===false);
  if(!show) return null;
  return (<div className="fixed bottom-0 inset-x-0 z-40">
    <div className="mx-auto max-w-5xl m-3 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-3"><MonitorSmartphone className="w-6 h-6"/><div><div className="font-semibold">Install QueueEasy to your Home Screen</div>
      <div className="text-sm opacity-90">Faster access, offline queue status, and push updates.</div></div></div>
      <div className="flex gap-2">
        <button onClick={()=>{saveLocal("qe_install_dismissed",true); setShow(false);}} className="px-3 py-2 rounded-xl bg-white text-indigo-700 font-medium">Dismiss</button>
        <button onClick={()=>alert("On a real PWA, this would trigger the install prompt.")} className="px-3 py-2 rounded-xl bg-black/20 font-medium">Install</button>
      </div>
    </div></div>);
}

function TopNav({active,setActive,shop,setShop}){
  return (<div className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-200">
    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
      <QrCode className="w-6 h-6 text-indigo-600"/><div className="font-bold text-slate-800">QueueEasy</div>
      <div className="hidden md:block text-slate-400">—</div>
      <div className="hidden md:flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4"/>
        <select value={shop.id} onChange={(e)=>setShop([...SHOPS].find(s=>s.id===e.target.value)||SHOPS[0])} className="border border-slate-300 rounded-lg px-2 py-1">
          {SHOPS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="ml-auto flex gap-1">
        {[{id:"customer",label:"Book",icon:CalendarDays},{id:"queue",label:"Queue Board",icon:ListOrdered},{id:"admin",label:"Admin",icon:LayoutDashboard}].map(tab=>(
          <button key={tab.id} onClick={()=>setActive(tab.id)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${active===tab.id?"bg-indigo-600 text-white border-indigo-600":"bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
            <tab.icon className="w-4 h-4"/>{tab.label}
          </button>
        ))}
      </div>
    </div></div>);
}

function CustomerBooking({ shop, bookings, setBookings }){
  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [serviceId,setServiceId]=useState(SERVICES[0].id);
  const [staffId,setStaffId]=useState("any");
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [toast,setToast]=useState("");

  const slots=useMemo(()=>genTimeSlots(shop.hours),[shop.hours]);
  const dayBookings=useMemo(()=>bookings.filter(b=>b.shopId===shop.id && b.date===date),[bookings,shop.id,date]);
  const reservedSet=useMemo(()=>new Set(dayBookings.map(b=>`${b.slot}_${b.staffId}`)),[dayBookings]);

  function createBooking(slot){
    if(!name||!phone){ setToast("Please enter your name and phone."); return; }
    const chosenStaff= staffId==="any" ? STAFF[Math.floor(Math.random()*STAFF.length)].id : staffId;
    const booking={ id:uid("bk"), shopId:shop.id, date, slot:slot.id, staffId:chosenStaff, serviceId, name, phone, status:"booked", createdAt:Date.now() };
    const next=[...bookings, booking]; setBookings(next); saveLocal("qe_bookings",next); setToast("Booking confirmed. See you soon!");
  }

  return (<div className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-4">
    <div className="md:col-span-2">
      <Card className="p-4">
        <SectionTitle icon={CalendarDays} title="Book a Slot" hint={`Open ${fmtTime(shop.hours.open)}–${fmtTime(shop.hours.close)}`}/>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <label className="text-sm text-slate-600"><span className="block mb-1">Date</span>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={date} onChange={e=>setDate(e.target.value)}/>
          </label>
          <label className="text-sm text-slate-600"><span className="block mb-1">Service</span>
            <select className="w-full border rounded-lg px-3 py-2" value={serviceId} onChange={e=>setServiceId(e.target.value)}>
              {SERVICES.map(s=><option key={s.id} value={s.id}>{s.name} — {s.mins} mins</option>)}
            </select>
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <label className="text-sm text-slate-600"><span className="block mb-1">Preferred Staff</span>
            <select className="w-full border rounded-lg px-3 py-2" value={staffId} onChange={e=>setStaffId(e.target.value)}>
              <option value="any">No preference (fastest)</option>
              {STAFF.map(st=><option key={st.id} value={st.id}>{st.name} — {st.role}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-slate-600"><span className="block mb-1">Your Name</span>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Juan D." value={name} onChange={e=>setName(e.target.value)}/>
            </label>
            <label className="text-sm text-slate-600"><span className="block mb-1">Phone</span>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="09XX…" value={phone} onChange={e=>setPhone(e.target.value)}/>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-slate-500"/><span className="text-sm text-slate-600">Select a time slot. Occupied slots show as disabled by staff.</span></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {slots.map(slot=>{
            const disabled = STAFF.some(st=>reservedSet.has(`${slot.id}_${st.id}`));
            return (<button key={slot.id} disabled={disabled} onClick={()=>createBooking(slot)} className={`px-3 py-2 rounded-xl border text-sm text-left transition ${disabled?"border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed":"border-slate-300 bg-white hover:bg-indigo-50"}`}>
              <div className="font-medium">{slot.label}</div>
              <div className="text-xs text-slate-500">{disabled?"Fully booked":"Available"}</div>
            </button>);
          })}
        </div>
      </Card>
    </div>
    <div className="md:col-span-1">
      <Card className="p-4">
        <SectionTitle icon={MapPin} title="Location"/>
        <div className="text-sm text-slate-700 font-medium">{shop.name}</div>
        <div className="text-sm text-slate-600">{shop.address}</div>
        <div className="text-sm text-slate-600 mt-1">☎ {shop.phone}</div>
        <div className="mt-3">
          <div className="text-xs text-slate-500 mb-1">Today’s estimated waits</div>
          <div className="flex flex-wrap gap-2">
            {STAFF.map(s=>(<Pill key={s.id}><User className="w-3 h-3"/>{s.name}: 15–30m</Pill>))}
          </div>
        </div>
      </Card>
      <Card className="p-4 mt-4">
        <SectionTitle icon={Bell} title="Notifications"/>
        <p className="text-sm text-slate-600">Enable push to get queue updates. (Mock for demo)</p>
        <button onClick={()=>alert("Push permissions would be requested here.")} className="mt-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium">Enable Push</button>
      </Card>
    </div>
  </div>);
}

function QueueBoard({ shop, bookings, setBookings }){
  const [_,forceTick]=useState(0);
  useEffect(()=>{
    const t=setInterval(()=>{
      forceTick(x=>x+1);
      const day=new Date().toISOString().slice(0,10);
      const todays=bookings.filter(b=>b.shopId===shop.id && b.date===day);
      if(todays.length===0) return;
      const active=todays.filter(b=>b.status==="booked"||b.status==="serving");
      if(active.length===0) return;
      const pick=active[Math.floor(Math.random()*active.length)];
      const next=bookings.map(b=>{
        if(b.id!==pick.id) return b;
        if(b.status==="booked") return {...b,status:"serving"};
        if(b.status==="serving") return {...b,status:"done"};
        return b;
      });
      setBookings(next); saveLocal("qe_bookings",next);
    },10000);
    return ()=>clearInterval(t);
  },[bookings,setBookings,shop.id]);

  const day=new Date().toISOString().slice(0,10);
  const todays=bookings.filter(b=>b.shopId===shop.id && b.date===day);
  const byStaff = [
    ...STAFF.map(st=>({ staff:st, queue: todays.filter(b=>b.staffId===st.id).sort((a,b)=>a.slot.localeCompare(b.slot)) }))
  ];
  return (<div className="max-w-6xl mx-auto p-4">
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <SectionTitle icon={ListOrdered} title="Live Queue Board" hint={new Date().toLocaleTimeString()}/>
        <div className="text-sm text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4"/>Auto-refreshing demo</div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {byStaff.map(({staff,queue})=>(
          <div key={staff.id} className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 flex items-center justify-between">
              <div className="font-semibold text-slate-800 flex items-center gap-2"><User className="w-4 h-4"/>{staff.name}</div>
              <div className="text-xs text-slate-500">{staff.role}</div>
            </div>
            <div className="divide-y">
              {queue.length===0 && (<div className="px-3 py-4 text-sm text-slate-500">No customers yet.</div>)}
              {queue.map((b,idx)=>(
                <div key={b.id} className="px-3 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">#{String(idx+1).padStart(2,"0")} — {b.name}</div>
                    <div className="text-xs text-slate-500">{b.slot} • {SERVICES.find(s=>s.id===b.serviceId)?.name||"Service"}</div>
                  </div>
                  <div className="text-xs">
                    {b.status==="booked" && <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">Waiting</span>}
                    {b.status==="serving" && <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">Serving</span>}
                    {b.status==="done" && <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">Done</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>);
}

function AdminDashboard({ shop, bookings, setBookings }){
  const [activeDate,setActiveDate]=useState(()=>new Date());
  const [searchTerm,setSearchTerm]=useState("");
  const [bufferMins,setBufferMins]=useState(10);
  const [showNewSlot,setShowNewSlot]=useState(false);
  const dateStr=activeDate.toISOString().slice(0,10);
  const slots=useMemo(()=>genTimeSlots(shop.hours),[shop.hours]);
  const todays=useMemo(()=>bookings.filter(b=>b.shopId===shop.id && b.date===dateStr),[bookings,shop.id,dateStr]);
  const filtered=todays.filter(b=>b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.phone.includes(searchTerm));

  function changeStatus(id,status){ const next=bookings.map(b=>b.id===id?{...b,status}:b); setBookings(next); saveLocal("qe_bookings",next); }
  function deleteBooking(id){ const next=bookings.filter(b=>b.id!==id); setBookings(next); saveLocal("qe_bookings",next); }
  function addManual(slotId){ const booking={ id:uid("bk"), shopId:shop.id, date:dateStr, slot:slotId, staffId:STAFF[0].id, serviceId:SERVICES[0].id, name:"Walk-in", phone:"", status:"booked", createdAt:Date.now() }; const next=[...bookings,booking]; setBookings(next); saveLocal("qe_bookings",next); setShowNewSlot(false); }

  const heat=useMemo(()=>{ const map={}; todays.forEach(b=>{ map[b.slot]=(map[b.slot]||0)+1; }); return map; },[todays]);
  const prevDay=()=>setActiveDate(d=>new Date(d.getTime()-86400000));
  const nextDay=()=>setActiveDate(d=>new Date(d.getTime()+86400000));

  return (<div className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-4">
    <div className="md:col-span-2">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle icon={LayoutDashboard} title="Admin — Schedule & Heat Map"/>
          <div className="flex items-center gap-2">
            <button onClick={prevDay} className="p-2 rounded-lg border"><ChevronLeft className="w-4 h-4"/></button>
            <div className="text-sm font-medium text-slate-700 w-36 text-center">{dateStr}</div>
            <button onClick={nextDay} className="p-2 rounded-lg border"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {slots.map(slot=>{
            const count=heat[slot.id]||0;
            const intensity=Math.min(count/STAFF.length,1);
            const bg=intensity===0? "bg-green-50" : intensity<0.5? "bg-amber-50" : "bg-rose-50";
            return (<div key={slot.id} className={`rounded-xl border border-slate-200 ${bg} p-3 text-sm flex flex-col gap-1`}>
              <div className="font-medium text-slate-800">{slot.label}</div>
              <div className="text-xs text-slate-600">{count} / {STAFF.length} booked</div>
              <button onClick={()=>setShowNewSlot(slot.id)} className="mt-1 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border hover:bg-white"><PlusCircle className="w-3 h-3"/> Add walk-in</button>
            </div>);
          })}
        </div>
      </Card>
      <Card className="p-4 mt-4">
        <SectionTitle icon={ListOrdered} title="Today’s Bookings"/>
        <div className="mb-3 flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"/>
            <input placeholder="Search by name or phone…" className="w-full border rounded-xl pl-9 pr-3 py-2" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
          </div>
          <label className="text-xs text-slate-600 flex items-center gap-2 border rounded-xl px-2">
            Buffer (mins)
            <input type="number" min={0} value={bufferMins} onChange={e=>setBufferMins(Number(e.target.value))} className="w-16 p-1 border rounded"/>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Time</th><th className="py-2">Customer</th><th className="py-2">Service</th><th className="py-2">Staff</th><th className="py-2">Status</th><th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 && (<tr><td colSpan={6} className="py-6 text-center text-slate-500">No bookings yet.</td></tr>)}
              {filtered.map(b=>(
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-2">{b.slot}</td>
                  <td className="py-2 font-medium">{b.name||"Walk-in"}</td>
                  <td className="py-2">{SERVICES.find(s=>s.id===b.serviceId)?.name}</td>
                  <td className="py-2">{STAFF.find(s=>s.id===b.staffId)?.name}</td>
                  <td className="py-2">
                    <select value={b.status} onChange={e=>changeStatus(b.id,e.target.value)} className="border rounded-lg px-2 py-1">
                      <option value="booked">Booked</option>
                      <option value="serving">Serving</option>
                      <option value="done">Done</option>
                      <option value="no-show">No-show</option>
                    </select>
                  </td>
                  <td className="py-2 text-right">
                    <button onClick={()=>deleteBooking(b.id)} className="inline-flex items-center gap-1 text-rose-600 hover:underline">
                      <X className="w-4 h-4"/> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    <div className="md:col-span-1">
      <Card className="p-4">
        <SectionTitle icon={Settings} title="Shop Settings (Demo)"/>
        <div className="text-sm text-slate-600">Hours: {fmtTime(shop.hours.open)}–{fmtTime(shop.hours.close)}</div>
        <div className="text-xs text-slate-500 mt-1">Adjust in real product via calendar templates.</div>
        <div className="mt-3 text-xs text-slate-500">Tip: Use the heat map to optimize staffing.</div>
      </Card>
      <Card className="p-4 mt-4">
        <SectionTitle icon={Bell} title="Alerts"/>
        <div className="text-sm text-slate-600">Auto text/email reminders ship in full product. This demo focuses on UI workflows.</div>
      </Card>
    </div>
    {showNewSlot && (<div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Add Walk-in</div>
          <button className="p-2" onClick={()=>setShowNewSlot(false)}><X className="w-5 h-5"/></button>
        </div>
        <div className="text-sm text-slate-600 mb-3">Slot: {showNewSlot}</div>
        <button onClick={()=>addManual(showNewSlot)} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium">Confirm</button>
      </div></div>)}
  </div>);
}

export default function App(){
  const [active,setActive]=useState("customer");
  const [shop,setShop]=useState(SHOPS[0]);
  const [bookings,setBookings]=useState(()=>loadLocal("qe_bookings",[]));
  useEffect(()=>{
    if(bookings.length===0){
      const seed=[
        { id:uid("bk"), shopId:"shop1", date:new Date().toISOString().slice(0,10), slot:"10:00", staffId:"s1", serviceId:"svc1", name:"Mina", phone:"0917xxxxxxx", status:"booked", createdAt:Date.now() },
        { id:uid("bk"), shopId:"shop1", date:new Date().toISOString().slice(0,10), slot:"10:30", staffId:"s2", serviceId:"svc2", name:"Paolo", phone:"0918xxxxxxx", status:"booked", createdAt:Date.now() },
        { id:uid("bk"), shopId:"shop1", date:new Date().toISOString().slice(0,10), slot:"11:00", staffId:"s3", serviceId:"svc4", name:"Ivy", phone:"0917xxxxxxx", status:"booked", createdAt:Date.now() },
      ];
      setBookings(seed); saveLocal("qe_bookings",seed);
    }
  },[]);
  return (<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
    <TopNav active={active} setActive={setActive} shop={shop} setShop={setShop}/>
    {active==="customer" && <CustomerBooking shop={shop} bookings={bookings} setBookings={setBookings}/>}
    {active==="queue" && <QueueBoard shop={shop} bookings={bookings} setBookings={setBookings}/>}
    {active==="admin" && <AdminDashboard shop={shop} bookings={bookings} setBookings={setBookings}/>}
    <InstallBanner/>
    <div className="mt-10 border-t bg-white/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-slate-500 flex items-center justify-between">
        <div>© {new Date().getFullYear()} QueueEasy — Frontend MVP Demo</div>
        <div className="flex items-center gap-3"><span>Demo only (no payments sent)</span></div>
      </div>
    </div>
  </div>);
}
