import { useState, useEffect } from "react";

const SUPABASE_URL = "https://ihctymhrzsuvscvsxtnl.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloY3R5bWhyenN1dnNjdnN4dG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTA1NzAsImV4cCI6MjA5NjI2NjU3MH0.vmGy-nsegLhtQ0LN03uv7X02rt8io_3vgOXpnK-7NfQ";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(d) {
  const [y,m,day] = d.split("-").map(Number);
  const date = new Date(y,m-1,day);
  return `${DAYS[date.getDay()]} ${day} ${MONTHS[m-1]}`;
}
function getTodayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
}
function genId() { return Math.random().toString(36).slice(2,10); }

async function sbFetch(path, opts={}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { "apikey": SUPABASE_ANON, "Authorization": `Bearer ${SUPABASE_ANON}`, "Content-Type": "application/json", "Prefer": "return=representation", ...opts.headers },
    ...opts
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function signUp(email, password, name) {
  const existing = await sbFetch(`organizers?email=eq.${encodeURIComponent(email)}&select=*`);
  if (existing?.length > 0) throw new Error("Email already registered!");
  const data = await sbFetch("organizers", { method: "POST", body: JSON.stringify({ id: genId(), email, password, name }) });
  return data?.[0];
}
async function signIn(email, password) {
  const data = await sbFetch(`organizers?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}&select=*`);
  if (!data?.length) throw new Error("Wrong email or password!");
  return data[0];
}
async function createTrip(trip) {
  return sbFetch("trips", { method: "POST", body: JSON.stringify({ id: trip.id, event_name: trip.eventName, dates: trip.dates, time_slots: trip.timeSlots, organizer_id: trip.organizerId }) });
}
async function getTrip(id) {
  const data = await sbFetch(`trips?id=eq.${id}&select=*`);
  return data?.[0] || null;
}
async function getOrganizerTrips(organizerId) {
  return await sbFetch(`trips?organizer_id=eq.${organizerId}&select=*&order=created_at.desc`) || [];
}
async function saveResponse(tripId, name, selections) {
  return sbFetch("responses", { method: "POST", body: JSON.stringify({ trip_id: tripId, name, selections }) });
}
async function getResponses(tripId) {
  return await sbFetch(`responses?trip_id=eq.${tripId}&select=*&order=created_at.asc`) || [];
}
async function setFinalDate(tripId, finalDate, finalTime) {
  return sbFetch(`trips?id=eq.${tripId}`, { method: "PATCH", body: JSON.stringify({ final_date: finalDate, final_time: finalTime }), headers: { "Prefer": "return=representation" } });
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@400;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#ff2d55;font-family:'Nunito',sans-serif;}
  .page{min-height:100vh;background:linear-gradient(160deg,#ff2d55 0%,#ff6a00 50%,#ffcc00 100%);display:flex;flex-direction:column;align-items:center;padding:0 16px 60px;}
  .hero{width:100%;max-width:560px;text-align:center;padding:32px 0 20px;}
  .logo{font-family:'Lilita One',cursive;font-size:clamp(32px,8vw,52px);color:#fff;text-shadow:3px 3px 0 rgba(0,0,0,0.15);line-height:1;}
  .logo span{color:#ffcc00;-webkit-text-stroke:1.5px #ff6a00;}
  .hero-sub{font-size:14px;color:rgba(255,255,255,0.85);font-weight:600;margin-top:6px;}
  .card{background:#fff;border-radius:24px;padding:28px 24px;width:100%;max-width:560px;box-shadow:0 16px 48px rgba(255,45,85,0.25);position:relative;overflow:hidden;margin-bottom:12px;}
  .card::before{content:'';position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#ff2d55,#ff6a00,#ffcc00,#ff6a00,#ff2d55);background-size:200% 100%;animation:shimmer 3s linear infinite;}
  @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
  .badge{display:inline-flex;align-items:center;gap:5px;background:#fff3f5;border:1.5px solid #ffb3c1;color:#ff2d55;font-weight:800;font-size:10px;letter-spacing:2px;padding:4px 12px;border-radius:20px;margin-bottom:12px;text-transform:uppercase;}
  .card-title{font-family:'Lilita One',cursive;font-size:22px;color:#1a1a1a;margin-bottom:2px;}
  .card-sub{font-size:13px;color:#888;font-weight:600;margin-bottom:20px;}
  .label{display:block;font-size:10px;font-weight:800;letter-spacing:2px;color:#ff6a00;text-transform:uppercase;margin-bottom:6px;}
  .input{width:100%;border:2px solid #ffe0e6;border-radius:12px;padding:11px 14px;font-size:14px;font-family:'Nunito',sans-serif;font-weight:600;color:#1a1a1a;margin-bottom:16px;outline:none;transition:border-color .2s;background:#fff;}
  .input:focus{border-color:#ff2d55;}
  .btn-primary{width:100%;background:linear-gradient(135deg,#ff2d55,#ff6a00);border:none;border-radius:14px;padding:15px;color:#fff;font-size:15px;font-family:'Lilita One',cursive;letter-spacing:1px;cursor:pointer;box-shadow:0 6px 20px rgba(255,45,85,0.35);transition:transform .15s;margin-top:4px;}
  .btn-primary:hover{transform:translateY(-2px);}
  .btn-primary:disabled{opacity:0.6;transform:none;cursor:not-allowed;}
  .btn-secondary{width:100%;background:transparent;border:2px solid #ffe0e6;border-radius:14px;padding:13px;color:#ff6a00;font-size:14px;font-family:'Nunito',sans-serif;font-weight:800;cursor:pointer;transition:border-color .2s;margin-top:8px;}
  .btn-secondary:hover{border-color:#ff2d55;}
  .btn-small{background:linear-gradient(135deg,#ff2d55,#ff6a00);border:none;color:#fff;border-radius:10px;padding:10px 16px;font-family:'Nunito',sans-serif;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap;}
  .error{color:#ff2d55;font-size:13px;font-weight:700;margin:4px 0 10px;}
  .row{display:flex;gap:10px;align-items:center;margin-bottom:10px;}
  .chip-list{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;}
  .chip{display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#fff3f5,#fff8e1);border:1.5px solid #ffcc00;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:700;color:#ff6a00;}
  .chip-x{background:none;border:none;color:#ff2d55;cursor:pointer;font-size:15px;padding:0;line-height:1;font-weight:900;}
  .divider{height:1px;background:#f5f5f5;margin:16px 0;}
  .event-card{border:2px solid #ffe0e6;border-radius:16px;padding:16px;margin-bottom:10px;background:#fff;}
  .event-card:hover{border-color:#ffcc00;}
  .event-card-title{font-family:'Lilita One',cursive;font-size:17px;color:#1a1a1a;margin-bottom:4px;}
  .event-card-sub{font-size:12px;color:#aaa;font-weight:600;margin-bottom:10px;}
  .event-card-actions{display:flex;gap:8px;flex-wrap:wrap;}
  .btn-copy{background:#fff3f5;border:1.5px solid #ffb3c1;color:#ff2d55;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;}
  .btn-results{background:linear-gradient(135deg,#ff2d55,#ff6a00);border:none;color:#fff;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;}
  .final-badge{background:linear-gradient(135deg,#ffcc00,#ff6a00);color:#fff;font-size:10px;font-weight:900;padding:3px 10px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;display:inline-block;margin-bottom:8px;}
  .date-block{border:2px solid #ffe0e6;border-radius:14px;padding:14px;margin-bottom:10px;}
  .date-block.sel{border-color:#ffcc00;background:#fffdf0;}
  .date-block-title{font-size:14px;font-weight:800;color:#1a1a1a;margin-bottom:8px;}
  .time-row{display:flex;flex-wrap:wrap;gap:8px;}
  .time-btn{background:#f9f9f9;border:2px solid #eee;border-radius:10px;padding:8px 14px;color:#aaa;font-size:12px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;}
  .time-btn.active{background:linear-gradient(135deg,#ff2d55,#ff6a00);border-color:transparent;color:#fff;box-shadow:0 4px 12px rgba(255,45,85,0.3);}
  .result-row{border:2px solid #ffe0e6;border-radius:14px;padding:14px 16px;margin-bottom:10px;background:#fff;}
  .result-row.best{border-color:#ffcc00;background:linear-gradient(135deg,#fffdf0,#fff8f0);}
  .result-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px;}
  .result-date{font-weight:800;font-size:14px;color:#1a1a1a;}
  .best-tag{background:linear-gradient(135deg,#ffcc00,#ff6a00);color:#fff;font-size:9px;font-weight:900;letter-spacing:2px;padding:3px 10px;border-radius:20px;text-transform:uppercase;}
  .count{font-size:12px;font-weight:700;color:#ff6a00;background:#fff3e0;border-radius:20px;padding:3px 10px;}
  .people{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}
  .person{background:#fff3f5;border:1.5px solid #ffb3c1;border-radius:20px;padding:4px 10px;font-size:12px;font-weight:700;color:#ff2d55;}
  .person-time{color:#ff9a00;font-weight:600;}
  .link-box{background:#fff8f0;border:2px dashed #ffcc00;border-radius:14px;padding:14px;margin-bottom:16px;}
  .link-row{display:flex;gap:8px;align-items:center;margin-top:8px;}
  .link-text{flex:1;font-size:11px;font-weight:700;color:#555;word-break:break-all;background:#fff;border:1.5px solid #ffe0e6;border-radius:10px;padding:9px 12px;}
  .copied{color:#ff6a00;font-size:12px;font-weight:700;text-align:center;margin-top:6px;}
  .welcome{font-family:'Lilita One',cursive;font-size:20px;color:#1a1a1a;margin-bottom:16px;}
  .empty{text-align:center;color:#ccc;font-size:13px;font-weight:700;padding:20px 0;}
  .photo-card-wrap{background:linear-gradient(135deg,#ff2d55,#ff6a00,#ffcc00);border-radius:20px;padding:3px;margin:16px 0;}
  .photo-card{background:#fff;border-radius:18px;padding:28px;text-align:center;}
  .photo-card-emoji{font-size:48px;margin-bottom:10px;}
  .photo-card-event{font-family:'Lilita One',cursive;font-size:26px;color:#ff2d55;margin-bottom:6px;}
  .photo-card-date{font-size:18px;font-weight:800;color:#1a1a1a;margin-bottom:4px;}
  .photo-card-time{font-size:15px;font-weight:700;color:#ff6a00;margin-bottom:6px;}
  .photo-card-detail{font-size:13px;font-weight:600;color:#888;margin-bottom:3px;}
  .photo-card-watermark{font-size:10px;color:#ddd;font-weight:700;margin-top:14px;letter-spacing:2px;}
  .btn-download{width:100%;background:linear-gradient(135deg,#ffcc00,#ff6a00);border:none;border-radius:14px;padding:14px;color:#fff;font-size:14px;font-family:'Lilita One',cursive;letter-spacing:1px;cursor:pointer;margin-top:8px;}
  input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(40%) sepia(80%) saturate(500%) hue-rotate(320deg);cursor:pointer;}
  input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(40%) sepia(80%) saturate(500%) hue-rotate(320deg);cursor:pointer;}
`;

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) { setError("Enter your name!"); setLoading(false); return; }
        const user = await signUp(email.trim(), password, name.trim());
        onAuth(user);
      } else {
        const user = await signIn(email.trim(), password);
        onAuth(user);
      }
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="badge">🔐 {mode === "login" ? "Welcome back" : "Join meHourly"}</div>
      <h2 className="card-title">{mode === "login" ? "Log in" : "Create account"}</h2>
      <p className="card-sub">{mode === "login" ? "Log in to manage your events." : "Sign up to start organising."}</p>
      {mode === "signup" && <>
        <label className="label">Your name</label>
        <input className="input" placeholder="e.g. Kibdiyah" value={name} onChange={e=>setName(e.target.value)} />
      </>}
      <label className="label">Email</label>
      <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
      <label className="label">Password</label>
      <input className="input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <p className="error">⚠ {error}</p>}
      <button className="btn-primary" onClick={submit} disabled={loading}>{loading ? "..." : mode === "login" ? "Log in" : "Sign up"}</button>
      <button className="btn-secondary" onClick={()=>{ setMode(mode==="login"?"signup":"login"); setError(""); }}>
        {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
      </button>
    </div>
  );
}

function Dashboard({ organizer, onCreateEvent, onViewResults, onLogout }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    getOrganizerTrips(organizer.id).then(t => { setTrips(t); setLoading(false); });
  }, [organizer.id]);

  const copy = (trip) => {
    const url = `${window.location.origin}${window.location.pathname}#guest_${trip.id}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(trip.id); setTimeout(()=>setCopied(null),2000); });
  };

  return (
    <div className="card">
      <div className="welcome">👋 Hey, {organizer.name}!</div>
      <p style={{fontSize:13,color:"#aaa",fontWeight:600,marginBottom:20}}>Here are your events</p>
      {loading && <div className="empty">Loading your events…</div>}
      {!loading && trips.length === 0 && <div className="empty">No events yet — create your first one! 🎉</div>}
      {trips.map(t => (
        <div key={t.id} className="event-card">
          {t.final_date && <div className="final-badge">✅ Date decided</div>}
          <div className="event-card-title">🎡 {t.event_name}</div>
          <div className="event-card-sub">{t.dates?.length} possible date{t.dates?.length !== 1 ? "s" : ""} · {t.time_slots?.length} time slot{t.time_slots?.length !== 1 ? "s" : ""}</div>
          <div className="event-card-actions">
            <button className="btn-copy" onClick={()=>copy(t)}>{copied===t.id ? "✓ Copied!" : "📋 Copy link"}</button>
            <button className="btn-results" onClick={()=>onViewResults(t)}>📊 See results</button>
          </div>
        </div>
      ))}
      <div className="divider" />
      <button className="btn-primary" onClick={onCreateEvent}>+ Create new event</button>
      <button className="btn-secondary" onClick={onLogout}>Log out</button>
    </div>
  );
}

function CreateEvent({ organizer, onDone, onBack }) {
  const [eventName, setEventName] = useState("");
  const [dates, setDates] = useState([]);
  const [pickingDate, setPickingDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [pickingTime, setPickingTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addDate = () => {
    if (!pickingDate) { setError("Pick a date!"); return; }
    if (dates.includes(pickingDate)) { setError("Already added!"); return; }
    setDates([...dates, pickingDate].sort());
    setPickingDate(""); setError("");
  };

  const addTime = () => {
    if (!pickingTime) { setError("Enter a time!"); return; }
    if (timeSlots.includes(pickingTime)) { setError("Already added!"); return; }
    setTimeSlots([...timeSlots, pickingTime]);
    setPickingTime(""); setError("");
  };

  const launch = async () => {
    if (!eventName.trim()) { setError("Give your event a name!"); return; }
    if (dates.length < 1) { setError("Add at least one date!"); return; }
    if (timeSlots.length < 1) { setError("Add at least one time slot!"); return; }
    setLoading(true);
    try {
      const id = genId();
      const trip = { id, eventName: eventName.trim(), dates, timeSlots, organizerId: organizer.id };
      await createTrip(trip);
      onDone({ id, event_name: eventName.trim(), dates, time_slots: timeSlots });
    } catch(e) { setError("Failed to create. Try again."); }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="badge">🎡 New event</div>
      <h2 className="card-title">Create event</h2>
      <p className="card-sub">Set your event name, possible dates and time slots.</p>
      <label className="label">Event name</label>
      <input className="input" value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. Thorpe Park Squad" />
      <label className="label">Possible dates</label>
      <div className="row">
        <input type="date" className="input" style={{flex:1,marginBottom:0}} value={pickingDate} min={getTodayStr()} onChange={e=>setPickingDate(e.target.value)} />
        <button className="btn-small" onClick={addDate}>+ Add</button>
      </div>
      {dates.length > 0 && (
        <div className="chip-list" style={{marginTop:8}}>
          {dates.map(d => <div key={d} className="chip">📅 {formatDate(d)}<button className="chip-x" onClick={()=>setDates(dates.filter(x=>x!==d))}>×</button></div>)}
        </div>
      )}
      <label className="label" style={{marginTop:8}}>Time slots guests can pick from</label>
      <div className="row">
        <input type="time" className="input" style={{flex:1,marginBottom:0}} value={pickingTime} onChange={e=>setPickingTime(e.target.value)} />
        <button className="btn-small" onClick={addTime}>+ Add</button>
      </div>
      {timeSlots.length > 0 && (
        <div className="chip-list" style={{marginTop:8}}>
          {timeSlots.map(t => <div key={t} className="chip">⏰ {t}<button className="chip-x" onClick={()=>setTimeSlots(timeSlots.filter(x=>x!==t))}>×</button></div>)}
        </div>
      )}
      {error && <p className="error">⚠ {error}</p>}
      <button className="btn-primary" onClick={launch} disabled={loading}>{loading ? "Creating…" : "Create & get link 🔗"}</button>
      <button className="btn-secondary" onClick={onBack}>← Back</button>
    </div>
  );
}

function ShareCard({ trip, onViewResults, onBack }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${window.location.pathname}#guest_${trip.id}`;
  const copy = () => { navigator.clipboard.writeText(shareUrl).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500); }); };
  return (
    <div className="card">
      <div className="badge">🔗 Share</div>
      <h2 className="card-title">{trip.event_name}</h2>
      <p className="card-sub">Send this link to your crew — no sign up needed for them!</p>
      <div className="link-box">
        <div className="label">📎 Shareable link</div>
        <div className="link-row">
          <div className="link-text">{shareUrl}</div>
          <button className="btn-small" onClick={copy}>Copy</button>
        </div>
        {copied && <div className="copied">✓ Copied!</div>}
      </div>
      <button className="btn-primary" onClick={onViewResults}>📊 View results</button>
      <button className="btn-secondary" onClick={onBack}>← Dashboard</button>
    </div>
  );
}

function GuestForm({ trip }) {
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
    try { await saveResponse(trip.id, name.trim(), selections); setDone(true); }
    catch(e) { setError("Couldn't save. Try again."); }
    setLoading(false);
  };

  if (done) return (
    <div className="card" style={{textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:12}}>🎉</div>
      <h2 className="card-title">You're in!</h2>
      <p className="card-sub" style={{marginBottom:0}}>The organiser will let you know the final date!</p>
    </div>
  );

  const timeSlots = trip.time_slots || [];

  return (
    <div className="card">
      <div className="badge">🎟 Availability</div>
      <h2 className="card-title">{trip.event_name}</h2>
      <p className="card-sub">Pick your time for each date you can make it.</p>
      <label className="label">Your name</label>
      <input className="input" placeholder="e.g. Jordan" value={name} onChange={e=>setName(e.target.value)} />
      <label className="label">Dates & time</label>
      <div style={{marginBottom:20}}>
        {trip.dates.map(date => (
          <div key={date} className={`date-block${selections[date]?" sel":""}`}>
            <div className="date-block-title">📅 {formatDate(date)}</div>
            <div className="time-row">
              {timeSlots.map(t => (
                <button key={t} className={`time-btn${selections[date]===t?" active":""}`} onClick={()=>toggle(date,t)}>{t}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="error">⚠ {error}</p>}
      <button className="btn-primary" onClick={submit} disabled={loading}>{loading?"Saving…":"I'm in! ✓"}</button>
    </div>
  );
}

function Results({ trip, onBack }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinal, setSelectedFinal] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [venue, setVenue] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [showCard, setShowCard] = useState(false);
  const [finalSet, setFinalSet] = useState(trip.final_date || null);
  const [finalTime, setFinalTime] = useState(trip.final_time || "");
  const [cardVenue, setCardVenue] = useState("");
  const [cardDressCode, setCardDressCode] = useState("");
  const [cardDisclaimer, setCardDisclaimer] = useState("");

  const fetchData = async () => {
    try { const data = await getResponses(trip.id); setResponses(data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); const iv = setInterval(fetchData,5000); return ()=>clearInterval(iv); }, [trip.id]);

  const summary = (trip.dates||[]).map(date => {
    const avail = responses.filter(r => {
      const sel = typeof r.selections === "string" ? JSON.parse(r.selections) : r.selections;
      return sel[date];
    });
    return { date, count: avail.length, people: avail.map(r => { const sel = typeof r.selections==="string"?JSON.parse(r.selections):r.selections; return {name:r.name,time:sel[date]}; }) };
  }).sort((a,b)=>b.count-a.count);

  const max = summary[0]?.count||0;
  const timeSlots = trip.time_slots || [];

  const confirmFinal = async () => {
    if (!selectedFinal) return;
    try { await setFinalDate(trip.id, selectedFinal, selectedTime); } catch(e) {}
    setFinalSet(selectedFinal);
    setFinalTime(selectedTime);
    setCardVenue(venue);
    setCardDressCode(dressCode);
    setCardDisclaimer(disclaimer);
    setShowCard(true);
  };

  return (
    <div className="card">
      <div className="badge">📊 Results</div>
      <h2 className="card-title">{trip.event_name}</h2>
      <p className="card-sub">{responses.length} {responses.length===1?"person":"people"} responded · live</p>
      <div className="divider" />
      {loading && <div className="empty">Loading…</div>}
      {summary.map(({date,count,people})=>(
        <div key={date} className={`result-row${count===max&&max>0?" best":""}`}>
          <div className="result-top">
            <span className="result-date">🗓 {formatDate(date)}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {count===max&&max>0&&<span className="best-tag">⭐ BEST</span>}
              <span className="count">{count}/{responses.length} free</span>
            </div>
          </div>
          <div className="people">
            {people.map(p=><span key={p.name} className="person">{p.name} <span className="person-time">at {p.time}</span></span>)}
          </div>
        </div>
      ))}

      <div className="divider" />

      {showCard ? (
        <>
          <div className="badge" style={{marginBottom:12}}>🎉 It's happening!</div>
          <div className="photo-card-wrap">
            <div className="photo-card">
              <div className="photo-card-emoji">🎡</div>
              <div className="photo-card-event">{trip.event_name}</div>
              <div className="photo-card-date">📅 {formatDate(finalSet)}</div>
              {finalTime && <div className="photo-card-time">⏰ {finalTime}</div>}
              {cardVenue && <div className="photo-card-detail">📍 {cardVenue}</div>}
              {cardDressCode && <div className="photo-card-detail">👗 {cardDressCode}</div>}
              {cardDisclaimer && <div className="photo-card-detail">📝 {cardDisclaimer}</div>}
              <div className="photo-card-watermark">MADE WITH MEHOURLY</div>
            </div>
          </div>
          <p style={{fontSize:12,color:"#aaa",fontWeight:600,textAlign:"center",marginBottom:12}}>Screenshot & share with your crew! 📲</p>
          <button className="btn-secondary" onClick={onBack}>← Back to dashboard</button>
        </>
      ) : (
        <>
          {!finalSet ? (
            <>
              <div className="badge" style={{marginBottom:12}}>🗓 Pick final date</div>
              <label className="label">Choose the date</label>
              <div className="chip-list">
                {(trip.dates||[]).map(d=>(
                  <button key={d} onClick={()=>setSelectedFinal(d)} style={{background:selectedFinal===d?"linear-gradient(135deg,#ff2d55,#ff6a00)":"#f9f9f9",color:selectedFinal===d?"#fff":"#888",border:selectedFinal===d?"none":"2px solid #eee",borderRadius:10,padding:"8px 14px",fontFamily:"Nunito",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                    📅 {formatDate(d)}
                  </button>
                ))}
              </div>
              {selectedFinal && <>
                <label className="label">Choose the time</label>
                <div className="chip-list">
                  {timeSlots.map(t=>(
                    <button key={t} onClick={()=>setSelectedTime(t)} style={{background:selectedTime===t?"linear-gradient(135deg,#ff2d55,#ff6a00)":"#f9f9f9",color:selectedTime===t?"#fff":"#888",border:selectedTime===t?"none":"2px solid #eee",borderRadius:10,padding:"8px 14px",fontFamily:"Nunito",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                      ⏰ {t}
                    </button>
                  ))}
                </div>
                <label className="label">Venue (optional)</label>
                <input className="input" placeholder="e.g. Thorpe Park, Surrey" value={venue} onChange={e=>setVenue(e.target.value)} />
                <label className="label">Dress code (optional)</label>
                <input className="input" placeholder="e.g. Smart casual" value={dressCode} onChange={e=>setDressCode(e.target.value)} />
                <label className="label">Extra info (optional)</label>
                <input className="input" placeholder="e.g. Bring ID, tickets on the door" value={disclaimer} onChange={e=>setDisclaimer(e.target.value)} />
                <button className="btn-primary" onClick={confirmFinal}>🎉 Confirm & generate card</button>
              </>}
            </>
          ) : (
            <div style={{background:"#fff3f5",border:"1.5px solid #ffb3c1",borderRadius:14,padding:14,marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:14,color:"#ff2d55",marginBottom:4}}>✅ Final date: {formatDate(finalSet)}</div>
              {finalTime && <div style={{fontSize:13,color:"#ff6a00",fontWeight:700}}>⏰ {finalTime}</div>}
            </div>
          )}
          <button className="btn-secondary" onClick={onBack}>← Back to dashboard</button>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith("guest_")) {
      const tripId = hash.slice(6);
      getTrip(tripId).then(t => {
        if (t) { setTrip(t); setPhase("guest"); }
        else setPhase("auth");
      });
      return;
    }
    const saved = localStorage.getItem("mehourly_organizer");
    if (saved) { setOrganizer(JSON.parse(saved)); setPhase("dashboard"); return; }
    setPhase("auth");
  }, []);

  const handleAuth = (user) => {
    localStorage.setItem("mehourly_organizer", JSON.stringify(user));
    setOrganizer(user);
    setPhase("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("mehourly_organizer");
    setOrganizer(null);
    setPhase("auth");
  };

  return (
    <>
      <style>{css}</style>
      <div className="page">
        <div className="hero">
          <div className="logo"><span>me</span>Hourly</div>
          <p className="hero-sub">Plan together. Show up together. 🎡</p>
        </div>
        {phase===null && <div style={{color:"#fff",fontWeight:700}}>Loading…</div>}
        {phase==="auth" && <AuthScreen onAuth={handleAuth} />}
        {phase==="dashboard" && organizer && <Dashboard organizer={organizer} onCreateEvent={()=>setPhase("create")} onViewResults={t=>{setTrip(t);setPhase("results");}} onLogout={handleLogout} />}
        {phase==="create" && organizer && <CreateEvent organizer={organizer} onDone={t=>{setTrip(t);setPhase("share");}} onBack={()=>setPhase("dashboard")} />}
        {phase==="share" && trip && <ShareCard trip={trip} onViewResults={()=>setPhase("results")} onBack={()=>setPhase("dashboard")} />}
        {phase==="guest" && trip && <GuestForm trip={trip} />}
        {phase==="results" && trip && <Results trip={trip} onBack={()=>setPhase("dashboard")} />}
      </div>
    </>
  );
}
