import { useState, useEffect } from "react";

const SUPABASE_URL = "https://ihctymhrzsuvscvsxtnl.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloY3R5bWhyenN1dnNjdnN4dG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTA1NzAsImV4cCI6MjA5NjI2NjU3MH0.vmGy-nsegLhtQ0LN03uv7X02rt8io_3vgOXpnK-7NfQ";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const START_TIMES = ["10:00am","11:00am","12:00pm"];

function formatDate(dateStr) {
  const [y,m,d] = dateStr.split("-").map(Number);
  const date = new Date(y,m-1,d);
  return `${DAYS[date.getDay()]} ${d} ${MONTHS[m-1]}`;
}
function getTodayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
}
function genId() { return Math.random().toString(36).slice(2,10); }

async function sbFetch(path, opts={}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      "apikey": SUPABASE_ANON,
      "Authorization": `Bearer ${SUPABASE_ANON}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...opts.headers
    },
    ...opts
  });
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function createTrip(trip) {
  return sbFetch("trips", { method: "POST", body: JSON.stringify({ id: trip.id, event_name: trip.eventName, dates: trip.dates }) });
}
async function getTrip(id) {
  const data = await sbFetch(`trips?id=eq.${id}&select=*`);
  return data?.[0] || null;
}
async function saveResponse(tripId, name, selections) {
  return sbFetch("responses", { method: "POST", body: JSON.stringify({ trip_id: tripId, name, selections }) });
}
async function getResponses(tripId) {
  return await sbFetch(`responses?trip_id=eq.${tripId}&select=*&order=created_at.asc`) || [];
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#ff2d55;}
  .tp-page{min-height:100vh;background:linear-gradient(160deg,#ff2d55 0%,#ff6a00 50%,#ffcc00 100%);display:flex;flex-direction:column;align-items:center;padding:0 16px 60px;font-family:'Nunito',sans-serif;}
  .tp-hero{width:100%;max-width:540px;text-align:center;padding:36px 0 24px;}
  .tp-logo-tag{display:inline-block;background:#fff;color:#ff2d55;font-family:'Lilita One',cursive;font-size:11px;letter-spacing:3px;padding:4px 14px;border-radius:20px;margin-bottom:12px;text-transform:uppercase;}
  .tp-title{font-family:'Lilita One',cursive;font-size:clamp(34px,9vw,58px);color:#fff;line-height:1;text-shadow:4px 4px 0 rgba(0,0,0,0.18);margin-bottom:6px;}
  .tp-title span{color:#ffcc00;-webkit-text-stroke:2px #ff6a00;}
  .tp-subtitle{font-size:15px;color:rgba(255,255,255,0.85);font-weight:600;}
  .tp-card{background:#fff;border-radius:24px;padding:28px 24px;width:100%;max-width:540px;box-shadow:0 16px 48px rgba(255,45,85,0.25),0 4px 16px rgba(0,0,0,0.1);position:relative;overflow:hidden;margin-bottom:12px;}
  .tp-card::before{content:'';position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#ff2d55,#ff6a00,#ffcc00,#ff6a00,#ff2d55);background-size:200% 100%;animation:shimmer 3s linear infinite;}
  @keyframes shimmer{0%{background-position:0% 0%;}100%{background-position:200% 0%;}}
  .tp-badge{display:inline-flex;align-items:center;gap:6px;background:#fff3f5;border:1.5px solid #ffb3c1;color:#ff2d55;font-weight:800;font-size:10px;letter-spacing:2px;padding:4px 12px;border-radius:20px;margin-bottom:14px;text-transform:uppercase;}
  .tp-card-title{font-family:'Lilita One',cursive;font-size:24px;color:#1a1a1a;margin-bottom:3px;}
  .tp-card-sub{font-size:13px;color:#888;margin-bottom:22px;font-weight:600;}
  .tp-label{display:block;font-size:10px;font-weight:800;letter-spacing:2px;color:#ff6a00;text-transform:uppercase;margin-bottom:6px;}
  .tp-input{width:100%;border:2px solid #ffe0e6;border-radius:12px;padding:12px 14px;font-size:15px;font-family:'Nunito',sans-serif;font-weight:600;color:#1a1a1a;margin-bottom:18px;outline:none;transition:border-color .2s;background:#fff;}
  .tp-input:focus{border-color:#ff2d55;}
  .tp-row{display:flex;gap:10px;align-items:center;margin-bottom:10px;}
  .tp-add-btn{background:linear-gradient(135deg,#ff2d55,#ff6a00);border:none;color:#fff;border-radius:12px;padding:12px 18px;font-family:'Nunito',sans-serif;font-weight:800;font-size:13px;cursor:pointer;white-space:nowrap;box-shadow:0 4px 12px rgba(255,45,85,0.35);transition:transform .15s;}
  .tp-add-btn:hover{transform:translateY(-1px);}
  .tp-error{color:#ff2d55;font-size:13px;font-weight:700;margin:4px 0 12px;}
  .tp-chip-list{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px;}
  .tp-chip{display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#fff3f5,#fff8e1);border:1.5px solid #ffcc00;border-radius:20px;padding:6px 14px;font-size:13px;font-weight:700;color:#ff6a00;}
  .tp-chip-remove{background:none;border:none;color:#ff2d55;cursor:pointer;font-size:16px;padding:0;line-height:1;font-weight:900;}
  .tp-primary-btn{width:100%;background:linear-gradient(135deg,#ff2d55 0%,#ff6a00 100%);border:none;border-radius:14px;padding:16px;color:#fff;font-size:16px;font-family:'Lilita One',cursive;letter-spacing:1px;cursor:pointer;box-shadow:0 6px 20px rgba(255,45,85,0.4);transition:transform .15s;}
  .tp-primary-btn:hover{transform:translateY(-2px);}
  .tp-primary-btn:disabled{opacity:0.6;transform:none;cursor:not-allowed;}
  .tp-secondary-btn{width:100%;background:transparent;border:2px solid #ffe0e6;border-radius:14px;padding:14px;color:#ff6a00;font-size:14px;font-family:'Nunito',sans-serif;font-weight:800;cursor:pointer;transition:border-color .2s;margin-top:10px;}
  .tp-secondary-btn:hover{border-color:#ff2d55;}
  .tp-date-grid{display:flex;flex-direction:column;gap:12px;margin-bottom:22px;}
  .tp-date-block{border:2px solid #ffe0e6;border-radius:14px;padding:14px 16px;transition:border-color .2s;}
  .tp-date-block.sel{border-color:#ffcc00;background:#fffdf0;}
  .tp-date-block-title{font-size:14px;font-weight:800;color:#1a1a1a;margin-bottom:10px;}
  .tp-time-row{display:flex;gap:8px;}
  .tp-time-btn{flex:1;background:#f9f9f9;border:2px solid #eee;border-radius:10px;padding:9px 4px;color:#aaa;font-size:12px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;transition:all .15s;}
  .tp-time-btn.active{background:linear-gradient(135deg,#ff2d55,#ff6a00);border-color:transparent;color:#fff;box-shadow:0 4px 12px rgba(255,45,85,0.3);transform:scale(1.04);}
  .tp-link-box{background:#fff8f0;border:2px dashed #ffcc00;border-radius:14px;padding:16px;margin-bottom:18px;}
  .tp-link-label{font-size:10px;font-weight:800;letter-spacing:2px;color:#ff6a00;text-transform:uppercase;margin-bottom:8px;}
  .tp-link-row{display:flex;gap:8px;align-items:center;}
  .tp-link-text{flex:1;font-size:12px;font-weight:700;color:#555;word-break:break-all;background:#fff;border:1.5px solid #ffe0e6;border-radius:10px;padding:10px 12px;}
  .tp-copy-btn{background:linear-gradient(135deg,#ffcc00,#ff6a00);border:none;color:#fff;border-radius:10px;padding:10px 14px;font-family:'Nunito',sans-serif;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap;}
  .tp-copied{color:#ff6a00;font-size:12px;font-weight:700;text-align:center;margin-top:6px;}
  .tp-result-row{border:2px solid #ffe0e6;border-radius:14px;padding:14px 16px;margin-bottom:10px;background:#fff;}
  .tp-result-row.best{border-color:#ffcc00;background:linear-gradient(135deg,#fffdf0,#fff8f0);box-shadow:0 4px 16px rgba(255,204,0,0.2);}
  .tp-result-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
  .tp-result-date{font-weight:800;font-size:15px;color:#1a1a1a;}
  .tp-best-tag{background:linear-gradient(135deg,#ffcc00,#ff6a00);color:#fff;font-size:9px;font-weight:900;letter-spacing:2px;padding:3px 10px;border-radius:20px;text-transform:uppercase;}
  .tp-count{font-size:12px;font-weight:700;color:#ff6a00;background:#fff3e0;border-radius:20px;padding:3px 10px;}
  .tp-people{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}
  .tp-person{background:#fff3f5;border:1.5px solid #ffb3c1;border-radius:20px;padding:4px 10px;font-size:12px;font-weight:700;color:#ff2d55;}
  .tp-person-time{color:#ff9a00;font-weight:600;}
  .tp-divider{height:1px;background:#f5f5f5;margin:16px 0;}
  .tp-empty{text-align:center;color:#bbb;font-size:14px;font-weight:700;padding:24px 0;}
  .tp-loading{text-align:center;color:#ff6a00;font-size:14px;font-weight:700;padding:24px 0;}
  input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(40%) sepia(80%) saturate(500%) hue-rotate(320deg);cursor:pointer;}
`;

function OrganizerSetup({ onDone }) {
  const [eventName, setEventName] = useState("Thorpe Park Squad");
  const [dates, setDates] = useState([]);
  const [picking, setPicking] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addDate = () => {
    if (!picking) { setError("Pick a date first!"); return; }
    if (dates.includes(picking)) { setError("Already added!"); return; }
    setDates([...dates, picking].sort());
    setPicking(""); setError("");
  };

  const launch = async () => {
    if (!eventName.trim()) { setError("Give your trip a name!"); return; }
    if (dates.length < 1) { setError("Add at least one date!"); return; }
    setLoading(true);
    try {
      const id = genId();
      const trip = { id, eventName: eventName.trim(), dates };
      await createTrip(trip);
      onDone(trip);
    } catch(e) {
      setError("Failed to create trip. Check your connection.");
    }
    setLoading(false);
  };

  return (
    <div className="tp-card">
      <div className="tp-badge">🎡 Organiser</div>
      <h2 className="tp-card-title">Set up the trip</h2>
      <p className="tp-card-sub">Only you see this — share the link after.</p>
      <label className="tp-label">Trip name</label>
      <input className="tp-input" value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. Thorpe Park Squad" />
      <label className="tp-label">Add possible dates</label>
      <div className="tp-row">
        <input type="date" className="tp-input" style={{flex:1,marginBottom:0}} value={picking} min={getTodayStr()} onChange={e=>setPicking(e.target.value)} />
        <button className="tp-add-btn" onClick={addDate}>+ Add</button>
      </div>
      {error && <p className="tp-error">⚠ {error}</p>}
      {dates.length > 0 && (
        <div className="tp-chip-list" style={{marginTop:12}}>
          {dates.map(d => (
            <div key={d} className="tp-chip">
              🎢 {formatDate(d)}
              <button className="tp-chip-remove" onClick={()=>setDates(dates.filter(x=>x!==d))}>×</button>
            </div>
          ))}
        </div>
      )}
      <button className="tp-primary-btn" onClick={launch} disabled={loading}>
        {loading ? "Creating…" : "Generate link 🔗"}
      </button>
    </div>
  );
}

function ShareCard({ trip, onViewResults }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${window.location.pathname}#guest_${trip.id}`;

  const copy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2500); });
  };

  return (
    <div className="tp-card">
      <div className="tp-badge">🔗 Share</div>
      <h2 className="tp-card-title">{trip.eventName}</h2>
      <p className="tp-card-sub">Send this link to your crew. They'll land straight on the form.</p>
      <div className="tp-link-box">
        <div className="tp-link-label">📎 Shareable link</div>
        <div className="tp-link-row">
          <div className="tp-link-text">{shareUrl}</div>
          <button className="tp-copy-btn" onClick={copy}>Copy</button>
        </div>
        {copied && <div className="tp-copied">✓ Copied!</div>}
      </div>
      <p style={{fontSize:12,color:"#aaa",fontWeight:600,marginBottom:18,textAlign:"center"}}>
        {trip.dates.map(d=>formatDate(d)).join(" · ")}
      </p>
      <button className="tp-primary-btn" onClick={onViewResults}>View results 📊</button>
    </div>
  );
}

function ParticipantForm({ trip }) {
  const [name, setName] = useState("");
  const [selections, setSelections] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (date, time) => {
    if (selections[date]===time) { const n={...selections}; delete n[date]; setSelections(n); }
    else setSelections({...selections,[date]:time});
  };

  const submit = async () => {
    if (!name.trim()) { setError("Enter your name!"); return; }
    if (Object.keys(selections).length===0) { setError("Pick at least one date!"); return; }
    setLoading(true);
    try {
      await saveResponse(trip.id, name.trim(), selections);
      setDone(true);
    } catch(e) {
      setError("Couldn't save. Try again.");
    }
    setLoading(false);
  };

  if (done) return (
    <div className="tp-card" style={{textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:16}}>🎉</div>
      <h2 className="tp-card-title">You're in!</h2>
      <p className="tp-card-sub" style={{marginBottom:0}}>Saved! The organiser will let you know the final date.</p>
    </div>
  );

  return (
    <div className="tp-card">
      <div className="tp-badge">🎟 Availability</div>
      <h2 className="tp-card-title">{trip.eventName}</h2>
      <p className="tp-card-sub">Pick your arrival time for each day you can make it.</p>
      <label className="tp-label">Your name</label>
      <input className="tp-input" placeholder="e.g. Jordan" value={name} onChange={e=>setName(e.target.value)} />
      <label className="tp-label">Dates &amp; arrival time</label>
      <div className="tp-date-grid">
        {trip.dates.map(date => (
          <div key={date} className={`tp-date-block${selections[date]?" sel":""}`}>
            <div className="tp-date-block-title">📅 {formatDate(date)}</div>
            <div className="tp-time-row">
              {START_TIMES.map(t=>(
                <button key={t} className={`tp-time-btn${selections[date]===t?" active":""}`} onClick={()=>toggle(date,t)}>{t}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="tp-error">⚠ {error}</p>}
      <button className="tp-primary-btn" onClick={submit} disabled={loading}>
        {loading ? "Saving…" : "I'm in! ✓"}
      </button>
    </div>
  );
}

function Results({ trip, onBack }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try { const data = await getResponses(trip.id); setResponses(data); } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, [trip.id]);

  const summary = trip.dates.map(date => {
    const avail = responses.filter(r => r.selections[date]);
    return { date, count: avail.length, people: avail.map(r=>({name:r.name,time:r.selections[date]})) };
  }).sort((a,b)=>b.count-a.count);

  const max = summary[0]?.count || 0;

  return (
    <div className="tp-card">
      <div className="tp-badge">📊 Results</div>
      <h2 className="tp-card-title">{trip.eventName}</h2>
      <p className="tp-card-sub">{responses.length} {responses.length===1?"person":"people"} responded · live</p>
      <div className="tp-divider" />
      {loading && <div className="tp-loading">Loading…</div>}
      {!loading && summary.length===0 && <div className="tp-empty">No responses yet!</div>}
      {summary.map(({date,count,people})=>(
        <div key={date} className={`tp-result-row${count===max&&max>0?" best":""}`}>
          <div className="tp-result-top">
            <span className="tp-result-date">🗓 {formatDate(date)}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {count===max&&max>0&&<span className="tp-best-tag">BEST DAY</span>}
              <span className="tp-count">{count} free</span>
            </div>
          </div>
          {people.length>0&&(
            <div className="tp-people">
              {people.map(p=>(
                <span key={p.name} className="tp-person">{p.name} <span className="tp-person-time">from {p.time}</span></span>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="tp-divider" />
      <button className="tp-secondary-btn" onClick={onBack}>← Back to share link</button>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState(null);
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith("guest_")) {
      const tripId = hash.slice(6);
      getTrip(tripId).then(t => {
        if (t) { setTrip({ id: t.id, eventName: t.event_name, dates: t.dates }); setPhase("guest"); }
        else setPhase("setup");
      });
      return;
    }
    setPhase("setup");
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="tp-page">
        <div className="tp-hero">
          <div className="tp-logo-tag">🎡 Thorpe Park</div>
          <h1 className="tp-title">WHO'S <span>COMING?</span></h1>
          <p className="tp-subtitle">Find the best day for your whole crew 🎢</p>
        </div>
        {phase===null && <div style={{color:"#fff",fontWeight:700,fontSize:16}}>Loading…</div>}
        {phase==="setup" && <OrganizerSetup onDone={t=>{setTrip(t);setPhase("share");}} />}
        {phase==="share" && trip && <ShareCard trip={trip} onViewResults={()=>setPhase("results")} />}
        {phase==="guest" && trip && <ParticipantForm trip={trip} />}
        {phase==="results" && trip && <Results trip={trip} onBack={()=>setPhase("share")} />}
      </div>
    </>
  );
}
