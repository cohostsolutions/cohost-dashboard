import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600&display=swap";
document.head.appendChild(fontLink);

// ── Brand ─────────────────────────────────────────────────────────────────────
const B = {
  crimson:      "#7A1C2E",
  crimsonDark:  "#5C1220",
  crimsonLight: "#9B2540",
  crimsonBg:    "#F9F0F2",
  gold:         "#A0823A",
  goldLight:    "#C8A96E",
  goldPale:     "#F5EDD8",
  goldDark:     "#7A6020",
  bg:           "#FAF8F5",
  surface:      "#FFFFFF",
  card:         "#FFFFFF",
  border:       "#EDE8E0",
  borderDark:   "#D6CFC4",
  text:         "#1A1410",
  textMid:      "#4A4238",
  textMuted:    "#8A7E72",
  textLight:    "#B8AFA4",
  green:        "#2E7D52",
  greenBg:      "#EBF7F1",
  red:          "#C0392B",
  redBg:        "#FDECEA",
  yellow:       "#B7860B",
  yellowBg:     "#FEF8E7",
  blue:         "#1D5FA8",
  blueBg:       "#EBF2FC",
};

// ── Users — managed in App state ─────────────────────────────────────────────
const INITIAL_USERS = [
  { id:"mgr1", name:"Alex Reyes",   role:"manager",      username:"alex",  password:"cohost2026", avatar:"AR", commissionRate:null },
  { id:"own1", name:"Marco Santos", role:"owner",        username:"marco", password:"owner2026",  avatar:"MS", commissionRate:18   },
  { id:"res1", name:"Jess Lim",     role:"reservations", username:"jess",  password:"res2026",    avatar:"JL", commissionRate:null },
  { id:"hk1",  name:"Rosa Cruz",    role:"housekeeping", username:"rosa",  password:"clean2026",  avatar:"RC", commissionRate:null },
];

const ROLES = {
  manager:      { label:"Property Manager", color:B.gold,    bg:B.goldPale,    icon:"✦", access:"Full Access" },
  owner:        { label:"Property Owner",   color:B.crimson, bg:B.crimsonBg,   icon:"⌂", access:"Owner View" },
  reservations: { label:"Reservations",     color:B.blue,    bg:B.blueBg,      icon:"◈", access:"Bookings" },
  housekeeping: { label:"Housekeeping",     color:B.green,   bg:B.greenBg,     icon:"❋", access:"Operations" },
};

// ── Expense Categories ────────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  { id:"utilities",    label:"Utilities",          icon:"⚡", color:B.blue,    bg:B.blueBg },
  { id:"maintenance",  label:"Maintenance & Repairs", icon:"🔧", color:B.yellow,  bg:B.yellowBg },
  { id:"housekeeping", label:"Housekeeping",        icon:"🧹", color:B.green,   bg:B.greenBg },
  { id:"supplies",     label:"Supplies",            icon:"🛒", color:B.gold,    bg:B.goldPale },
  { id:"insurance",    label:"Insurance",           icon:"🛡", color:B.crimson, bg:B.crimsonBg },
  { id:"platform",     label:"Platform Fees",       icon:"📡", color:B.textMid, bg:B.border },
  { id:"other",        label:"Other",               icon:"📎", color:B.textMuted, bg:B.bg },
];

const getCat = (id) => EXPENSE_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[6];

// ── Commission Config (editable in settings) ──────────────────────────────────
const DEFAULT_COMMISSION = {
  base: "net",           // "gross" | "net"
  rate: 20,              // %
  platformFeeBearer: "owner", // "owner" | "shared"
  byOwner: {},           // { ownerId: rate }
  byPlatform: {},        // { platform: rate } — override per platform
};

// ── Initial Expenses ──────────────────────────────────────────────────────────
const INITIAL_EXPENSES = [
  { id:"e1",  date:"2026-03-01", unit:"All Units",        name:"Meralco Electric Bill",    category:"utilities",    amount:8500,  bearer:"owner",  paidBy:"Owner"  },
  { id:"e2",  date:"2026-03-01", unit:"All Units",        name:"Water Bill – MCWD",         category:"utilities",    amount:2200,  bearer:"owner",  paidBy:"Owner"  },
  { id:"e3",  date:"2026-03-03", unit:"Unit 1 – Deluxe",  name:"AC Unit Repair",            category:"maintenance",  amount:3500,  bearer:"shared", paidBy:"PM"     },
  { id:"e4",  date:"2026-03-05", unit:"All Units",        name:"Converge WiFi Monthly",     category:"utilities",    amount:1800,  bearer:"shared", paidBy:"PM"     },
  { id:"e5",  date:"2026-03-07", unit:"Unit 3 – Suite",   name:"Post-checkout Deep Clean",  category:"housekeeping", amount:800,   bearer:"owner",  paidBy:"PM"     },
  { id:"e6",  date:"2026-03-08", unit:"Unit 2 – Studio",  name:"Toiletries Restock",        category:"supplies",     amount:650,   bearer:"shared", paidBy:"PM"     },
  { id:"e7",  date:"2026-03-10", unit:"All Units",        name:"Bathroom Supplies Set",     category:"supplies",     amount:1750,  bearer:"shared", paidBy:"PM"     },
  { id:"e8",  date:"2026-03-12", unit:"Unit 4 – Standard",name:"Plumbing – Sink Fix",       category:"maintenance",  amount:1500,  bearer:"owner",  paidBy:"Owner"  },
  { id:"e9",  date:"2026-03-15", unit:"All Units",        name:"Property Insurance Mar",    category:"insurance",    amount:4200,  bearer:"owner",  paidBy:"Owner"  },
  { id:"e10", date:"2026-03-20", unit:"Unit 1 – Deluxe",  name:"New Bed Sheet Set x2",      category:"supplies",     amount:1800,  bearer:"shared", paidBy:"PM"     },
];

// ── Bookings ──────────────────────────────────────────────────────────────────
const PLATFORM_COLORS = { Airbnb:"#FF385C", Agoda:"#E31837", "Booking.com":"#003B95", Direct:B.green };
const STATUS_STYLE = {
  "Confirmed":   { bg:B.blueBg,    text:B.blue,    border:"#BDD3F5" },
  "Checked In":  { bg:B.greenBg,   text:B.green,   border:"#B6E4CE" },
  "Checked Out": { bg:"#F3F2F0",   text:B.textMuted, border:B.border },
  "Pending":     { bg:B.yellowBg,  text:B.yellow,  border:"#F5DFA0" },
  "Cancelled":   { bg:B.redBg,     text:B.red,     border:"#F5C6C2" },
};

const BOOKINGS = [
  { id:"BK-001", guest:"Maria Santos",    contact:"+63 917 123 4567", platform:"Airbnb",      unit:"Unit 1 – Deluxe",   checkin:"2026-03-08", checkout:"2026-03-11", nights:3, guests:2, rate:2800, total:8400,  deposit:8400,  balance:0,    status:"Checked In",  channel:"Airbnb App",   notes:"Late check-in requested" },
  { id:"BK-002", guest:"John Reyes",      contact:"+63 918 234 5678", platform:"Direct",      unit:"Unit 2 – Studio",   checkin:"2026-03-10", checkout:"2026-03-13", nights:3, guests:1, rate:1800, total:5400,  deposit:2700,  balance:2700, status:"Confirmed",   channel:"WhatsApp",     notes:"" },
  { id:"BK-003", guest:"Anna Lim",        contact:"+63 919 345 6789", platform:"Booking.com", unit:"Unit 3 – Suite",    checkin:"2026-03-12", checkout:"2026-03-15", nights:3, guests:4, rate:3500, total:10500, deposit:10500, balance:0,    status:"Confirmed",   channel:"Booking.com",  notes:"Extra bed needed" },
  { id:"BK-004", guest:"Carlo Mendoza",   contact:"+63 920 456 7890", platform:"Agoda",       unit:"Unit 4 – Standard", checkin:"2026-03-05", checkout:"2026-03-08", nights:3, guests:2, rate:1600, total:4800,  deposit:4800,  balance:0,    status:"Checked Out", channel:"Agoda App",    notes:"" },
  { id:"BK-005", guest:"Sofia Cruz",      contact:"+63 921 567 8901", platform:"Airbnb",      unit:"Unit 2 – Studio",   checkin:"2026-03-15", checkout:"2026-03-18", nights:3, guests:2, rate:1800, total:5400,  deposit:0,     balance:5400, status:"Pending",     channel:"Airbnb App",   notes:"Awaiting payment" },
  { id:"BK-006", guest:"Miguel Torres",   contact:"+63 922 678 9012", platform:"Direct",      unit:"Unit 1 – Deluxe",   checkin:"2026-03-18", checkout:"2026-03-22", nights:4, guests:3, rate:2800, total:11200, deposit:5600,  balance:5600, status:"Confirmed",   channel:"Messenger",    notes:"" },
  { id:"BK-007", guest:"Grace Tan",       contact:"+63 923 789 0123", platform:"Agoda",       unit:"Unit 3 – Suite",    checkin:"2026-02-20", checkout:"2026-02-23", nights:3, guests:2, rate:3500, total:10500, deposit:10500, balance:0,    status:"Checked Out", channel:"Agoda App",    notes:"" },
  { id:"BK-008", guest:"Paolo Ramos",     contact:"+63 924 890 1234", platform:"Airbnb",      unit:"Unit 4 – Standard", checkin:"2026-03-20", checkout:"2026-03-24", nights:4, guests:2, rate:1600, total:6400,  deposit:6400,  balance:0,    status:"Confirmed",   channel:"Airbnb App",   notes:"" },
  { id:"BK-009", guest:"Isabel Flores",   contact:"+63 925 901 2345", platform:"Booking.com", unit:"Unit 1 – Deluxe",   checkin:"2026-02-10", checkout:"2026-02-14", nights:4, guests:2, rate:2800, total:11200, deposit:11200, balance:0,    status:"Checked Out", channel:"Booking.com",  notes:"" },
  { id:"BK-010", guest:"Ramon Dela Cruz", contact:"+63 926 012 3456", platform:"Direct",      unit:"Unit 3 – Suite",    checkin:"2026-03-25", checkout:"2026-03-28", nights:3, guests:5, rate:3500, total:10500, deposit:3500,  balance:7000, status:"Confirmed",   channel:"Instagram",    notes:"Birthday celebration" },
];

const monthlyRevenue = [
  { month:"Oct", revenue:28400 }, { month:"Nov", revenue:34200 },
  { month:"Dec", revenue:52800 }, { month:"Jan", revenue:38600 },
  { month:"Feb", revenue:41200 }, { month:"Mar", revenue:29800 },
];

const today = "2026-03-10";
const fmt = n => "₱" + Number(n).toLocaleString();

// ── Shared UI Components ──────────────────────────────────────────────────────
const F = { display:"Playfair Display, Georgia, serif", body:"Nunito, sans-serif" };

function Card({ children, style = {} }) {
  return <div style={{ background:B.card, border:`1px solid ${B.border}`, borderRadius:16, ...style }}>{children}</div>;
}

function Badge({ label, style = {}, color, bg, border }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, fontFamily:F.body, padding:"3px 10px",
      borderRadius:20, color, background:bg, border:`1px solid ${border || color+"44"}`, ...style }}>
      {label}
    </span>
  );
}

function KpiCard({ label, value, sub, valueColor, icon, trend }) {
  return (
    <Card style={{ padding:"20px 22px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:14, right:16, fontSize:26, opacity:0.07, fontFamily:F.body }}>{icon}</div>
      <div style={{ fontSize:11, fontFamily:"monospace", letterSpacing:1.2, textTransform:"uppercase",
        color:B.textMuted, marginBottom:10 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, fontFamily:F.body, color:valueColor||B.text,
        letterSpacing:-0.5, marginBottom:3 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:B.textMuted, fontFamily:F.body }}>{sub}</div>}
    </Card>
  );
}

function SectionHead({ title, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
      <div style={{ fontSize:12, fontFamily:"monospace", letterSpacing:1.5, textTransform:"uppercase",
        color:B.textMuted, paddingBottom:8, borderBottom:`2px solid ${B.goldLight}`, paddingRight:16 }}>
        {title}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE["Confirmed"];
  return <Badge label={status} color={s.text} bg={s.bg} border={s.border} />;
}

function PlatformBadge({ platform }) {
  const c = PLATFORM_COLORS[platform] || B.textMid;
  return <Badge label={platform} color={c} bg={c+"18"} border={c+"44"} />;
}

function Input({ label, value, onChange, type="text", placeholder="" }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:12, fontFamily:F.body, fontWeight:600, color:B.textMid, marginBottom:5 }}>{label}</div>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", background:B.bg, border:`1px solid ${B.border}`, borderRadius:10,
          padding:"10px 14px", fontSize:14, fontFamily:F.body, color:B.text, outline:"none",
          boxSizing:"border-box", transition:"border 0.15s" }}
        onFocus={e=>e.target.style.borderColor=B.gold}
        onBlur={e=>e.target.style.borderColor=B.border}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:12, fontFamily:F.body, fontWeight:600, color:B.textMid, marginBottom:5 }}>{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", background:B.bg, border:`1px solid ${B.border}`, borderRadius:10,
          padding:"10px 14px", fontSize:14, fontFamily:F.body, color:B.text, outline:"none",
          boxSizing:"border-box", cursor:"pointer" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant="primary", small }) {
  const styles = {
    primary: { background:`linear-gradient(135deg, ${B.gold}, ${B.goldDark})`, color:"#fff", border:"none" },
    crimson: { background:`linear-gradient(135deg, ${B.crimson}, ${B.crimsonDark})`, color:"#fff", border:"none" },
    ghost:   { background:"transparent", color:B.textMid, border:`1px solid ${B.border}` },
    danger:  { background:B.redBg, color:B.red, border:`1px solid ${B.red}44` },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant], borderRadius:10, padding: small ? "6px 14px" : "10px 20px",
      fontSize: small ? 12 : 14, fontFamily:F.body, fontWeight:600, cursor:"pointer",
      transition:"opacity 0.15s"
    }} onMouseEnter={e=>e.target.style.opacity="0.85"} onMouseLeave={e=>e.target.style.opacity="1"}>
      {children}
    </button>
  );
}

// ── Logo SVG (flower approximation using the brand colors) ────────────────────
function CohostLogo({ size = 36 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.22,
      background:`linear-gradient(135deg, ${B.gold}, ${B.goldDark})`,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*0.65} height={size*0.65} viewBox="0 0 40 40" fill="none">
        <ellipse cx="20" cy="11" rx="5" ry="10" fill="rgba(255,255,255,0.9)" transform="rotate(0 20 20)" />
        <ellipse cx="20" cy="11" rx="5" ry="10" fill="rgba(255,255,255,0.75)" transform="rotate(60 20 20)" />
        <ellipse cx="20" cy="11" rx="5" ry="10" fill="rgba(255,255,255,0.75)" transform="rotate(120 20 20)" />
        <ellipse cx="20" cy="11" rx="5" ry="10" fill="rgba(255,255,255,0.65)" transform="rotate(180 20 20)" />
        <ellipse cx="20" cy="11" rx="5" ry="10" fill="rgba(255,255,255,0.65)" transform="rotate(240 20 20)" />
        <ellipse cx="20" cy="11" rx="5" ry="10" fill="rgba(255,255,255,0.65)" transform="rotate(300 20 20)" />
        <circle cx="20" cy="20" r="4" fill="rgba(255,255,255,0.95)" />
      </svg>
    </div>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, users }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = () => {
    if (!username || !password) { setError("Please enter your username and password."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (user) { onLogin(user); }
      else { setError("Incorrect username or password. Please try again."); setLoading(false); }
    }, 600);
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, #FAF8F5 0%, #F0EAE2 100%)`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:24, fontFamily:F.body }}>

      {/* Logo & Brand */}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:12 }}>
          <CohostLogo size={52} />
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:26, fontWeight:600, fontFamily:F.display, color:B.text, lineHeight:1.1 }}>
              Co-Host <span style={{ color:B.crimson }}>Solutions</span>
            </div>
            <div style={{ fontSize:12, color:B.textMuted, fontFamily:F.body, marginTop:2 }}>
              Property Management Platform
            </div>
          </div>
        </div>
        <div style={{ display:"inline-block", background:B.crimson, color:"#fff",
          fontSize:10, fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase",
          padding:"4px 16px", borderRadius:20 }}>
          Optimized Hosting · Elevated Stays · Maximum Bookings
        </div>
      </div>

      {/* Login Card */}
      <Card style={{ width:"100%", maxWidth:420, padding:"36px 40px", boxShadow:"0 8px 40px rgba(0,0,0,0.10)" }}>
        <div style={{ fontSize:20, fontWeight:600, fontFamily:F.display, color:B.text, marginBottom:6 }}>
          Welcome back
        </div>
        <div style={{ fontSize:13, color:B.textMuted, marginBottom:28, fontFamily:F.body }}>
          Sign in to access your dashboard
        </div>

        <Input label="Username" value={username} onChange={setUsername} placeholder="Enter your username" />
        <Input label="Password" value={password} onChange={v => { setPassword(v); setError(""); }}
          type="password" placeholder="Enter your password" />

        {error && (
          <div style={{ background:B.redBg, border:`1px solid ${B.red}44`, borderRadius:10,
            padding:"10px 14px", fontSize:13, color:B.red, marginBottom:16, fontFamily:F.body }}>
            ⚠ {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          style={{ width:"100%", background:`linear-gradient(135deg, ${B.crimson}, ${B.crimsonDark})`,
            color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:15,
            fontFamily:F.body, fontWeight:700, cursor:"pointer", transition:"opacity 0.15s",
            opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in…" : "Sign In →"}
        </button>

        <div style={{ marginTop:24, padding:"16px 0 0", borderTop:`1px solid ${B.border}` }}>
          <div style={{ fontSize:11, color:B.textLight, fontFamily:"monospace", marginBottom:8, textAlign:"center" }}>
            DEMO ACCOUNTS
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {users.map(u => (
              <button key={u.id} onClick={() => { setUsername(u.username); setPassword(u.password); setError(""); }}
                style={{ background:B.bg, border:`1px solid ${B.border}`, borderRadius:8,
                  padding:"7px 10px", cursor:"pointer", textAlign:"left", transition:"border 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=B.goldLight}
                onMouseLeave={e=>e.currentTarget.style.borderColor=B.border}>
                <div style={{ fontSize:12, fontWeight:700, color:B.text, fontFamily:F.body }}>
                  {ROLES[u.role].icon} {u.name}
                </div>
                <div style={{ fontSize:10, color:B.textMuted, fontFamily:"monospace" }}>
                  {u.username} / {u.password}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ marginTop:24, fontSize:11, color:B.textLight, fontFamily:"monospace" }}>
        CDO Stays & Condos by Coco · Powered by Co-Host Solutions
      </div>
    </div>
  );
}

// ── COMMISSION SETTINGS PANEL ─────────────────────────────────────────────────
function CommissionSettings({ config, onChange, users = INITIAL_USERS }) {
  const update = (key, val) => onChange({ ...config, [key]: val });
  const owners = users.filter(u => u.role === "owner");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Card style={{ padding:24 }}>
        <SectionHead title="Commission Rate & Base" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:B.textMid, marginBottom:8, fontFamily:F.body }}>
              Commission Rate (%)
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <input type="number" min={0} max={100} value={config.rate}
                onChange={e => update("rate", Number(e.target.value))}
                style={{ width:90, background:B.goldPale, border:`2px solid ${B.gold}`,
                  borderRadius:10, padding:"10px 14px", fontSize:22, fontWeight:700,
                  fontFamily:F.body, color:B.goldDark, outline:"none", textAlign:"center" }} />
              <span style={{ fontSize:22, color:B.gold, fontWeight:700, fontFamily:F.body }}>%</span>
            </div>
            <div style={{ fontSize:11, color:B.textMuted, marginTop:6, fontFamily:F.body }}>
              Owner receives {100 - config.rate}%
            </div>
          </div>
          <Select label="Calculate commission based on"
            value={config.base}
            onChange={v => update("base", v)}
            options={[
              { value:"gross", label:"Gross Revenue (before expenses)" },
              { value:"net",   label:"Net Revenue (after platform fees)" },
              { value:"net_exp", label:"Net Revenue (after fees + expenses)" },
            ]} />
        </div>

        <Select label="Platform fees are absorbed by"
          value={config.platformFeeBearer}
          onChange={v => update("platformFeeBearer", v)}
          options={[
            { value:"owner",  label:"Property Owner only" },
            { value:"shared", label:"Shared 50/50 between PM and Owner" },
            { value:"pm",     label:"Property Manager only" },
          ]} />

        {/* Live preview */}
        <div style={{ background:B.goldPale, border:`1px solid ${B.goldLight}`, borderRadius:12, padding:"16px 18px" }}>
          <div style={{ fontSize:11, fontFamily:"monospace", letterSpacing:1, textTransform:"uppercase", color:B.gold, marginBottom:10 }}>
            Live Preview — ₱10,000 booking example
          </div>
          {(() => {
            const gross = 10000;
            const fee = 1500;
            const exp = 2000;
            const base = config.base === "gross" ? gross : config.base === "net" ? gross - fee : gross - fee - exp;
            const pm = base * config.rate / 100;
            const owner = base - pm;
            return (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  ["Gross Revenue", fmt(gross), B.text],
                  ["Platform Fee (15%)", "−"+fmt(fee), B.red],
                  config.base !== "gross" && ["Net Revenue", fmt(gross-fee), B.text],
                  config.base === "net_exp" && ["Expenses (est.)", "−"+fmt(exp), B.red],
                  ["Commission Base", fmt(base), B.gold],
                  ["Your Commission ("+config.rate+"%)", fmt(Math.round(pm)), B.crimson],
                  ["Owner Payout ("+(100-config.rate)+"%)", fmt(Math.round(owner)), B.green],
                ].filter(Boolean).map(([lbl, val, color], i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontFamily:F.body,
                    borderTop: i >= 4 ? `1px solid ${B.goldLight}` : "none", paddingTop: i >= 4 ? 6 : 0,
                    marginTop: i >= 4 ? 2 : 0 }}>
                    <span style={{ color:B.textMid }}>{lbl}</span>
                    <span style={{ fontWeight:700, color }}>{val}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </Card>

      <Card style={{ padding:24 }}>
        <SectionHead title="Per-Owner Rate Overrides (optional)" />
        <div style={{ fontSize:13, color:B.textMuted, marginBottom:16, fontFamily:F.body }}>
          Set a different commission rate for specific property owners. Leave blank to use the default rate above.
        </div>
        {owners.length === 0 && (
          <div style={{ fontSize:13, color:B.textMuted, fontFamily:F.body }}>No owners added yet. Add an owner in User Management above.</div>
        )}
        {owners.map(owner => (
          <div key={owner.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12,
            background:B.bg, border:`1px solid ${B.border}`, borderRadius:10, padding:"12px 16px" }}>
            <div style={{ width:36, height:36, borderRadius:8, background:B.crimsonBg, border:`1px solid ${B.crimson}33`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:B.crimson }}>
              {owner.avatar}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:B.text, fontFamily:F.body }}>{owner.name}</div>
              <div style={{ fontSize:11, color:B.textMuted, fontFamily:F.body }}>@{owner.username}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <input type="number" min={0} max={100}
                value={config.byOwner[owner.id] ?? ""}
                placeholder={config.rate}
                onChange={e => update("byOwner", { ...config.byOwner, [owner.id]: e.target.value === "" ? undefined : Number(e.target.value) })}
                style={{ width:70, background:B.goldPale, border:`1px solid ${B.gold}`, borderRadius:8,
                  padding:"6px 10px", fontSize:16, fontWeight:700, color:B.goldDark, outline:"none", textAlign:"center", fontFamily:F.body }} />
              <span style={{ fontSize:14, color:B.gold, fontWeight:700 }}>%</span>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ padding:24 }}>
        <SectionHead title="Platform Fee Rates" />
        {[["Airbnb","3"],["Agoda","15"],["Booking.com","15"],["Direct","0"]].map(([plat, def]) => (
          <div key={plat} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 0", borderBottom:`1px solid ${B.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:PLATFORM_COLORS[plat] }} />
              <span style={{ fontSize:13, fontFamily:F.body, fontWeight:600, color:B.text }}>{plat}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <input type="number" min={0} max={100}
                value={config.byPlatform[plat] ?? def}
                onChange={e => update("byPlatform", { ...config.byPlatform, [plat]: Number(e.target.value) })}
                style={{ width:65, background:B.bg, border:`1px solid ${B.border}`, borderRadius:8,
                  padding:"6px 10px", fontSize:14, fontWeight:700, color:B.text, outline:"none", textAlign:"center", fontFamily:F.body }} />
              <span style={{ fontSize:13, color:B.textMuted }}>%</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── EXPENSES PANEL ────────────────────────────────────────────────────────────
function ExpensesPanel({ expenses, setExpenses, role }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date:"2026-03-10", unit:"All Units", name:"", category:"utilities", amount:"", bearer:"owner", paidBy:"Owner" });

  const totalOwner  = expenses.reduce((s,e) => s + (e.bearer==="owner"  ? e.amount : e.bearer==="shared" ? e.amount*0.5 : 0), 0);
  const totalShared = expenses.reduce((s,e) => s + (e.bearer==="shared" ? e.amount*0.5 : 0), 0);
  const totalPM     = expenses.reduce((s,e) => s + (e.bearer==="pm"     ? e.amount : e.bearer==="shared" ? e.amount*0.5 : 0), 0);

  const addExpense = () => {
    if (!form.name || !form.amount) return;
    setExpenses(prev => [...prev, { ...form, id:"e"+Date.now(), amount:Number(form.amount) }]);
    setForm({ date:"2026-03-10", unit:"All Units", name:"", category:"utilities", amount:"", bearer:"owner", paidBy:"Owner" });
    setShowAdd(false);
  };

  const delExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        <KpiCard label="Owner Bears" value={fmt(totalOwner+totalOwner)} sub="Deducted from owner payout" valueColor={B.red} icon="💸" />
        <KpiCard label="Shared (Your Half)" value={fmt(totalPM)} sub="PM's share of shared costs" valueColor={B.yellow} icon="⚖" />
        <KpiCard label="Total Expenses" value={fmt(expenses.reduce((s,e)=>s+e.amount,0))} sub="All expenses this month" valueColor={B.text} icon="📋" />
      </div>

      {/* Category breakdown */}
      <Card style={{ padding:20 }}>
        <SectionHead title="By Category" />
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {EXPENSE_CATEGORIES.map(cat => {
            const total = expenses.filter(e=>e.category===cat.id).reduce((s,e)=>s+e.amount,0);
            if (!total) return null;
            return (
              <div key={cat.id} style={{ background:cat.bg, border:`1px solid ${cat.color}44`,
                borderRadius:10, padding:"10px 14px", minWidth:130 }}>
                <div style={{ fontSize:16, marginBottom:4 }}>{cat.icon}</div>
                <div style={{ fontSize:11, color:cat.color, fontWeight:700, fontFamily:F.body }}>{cat.label}</div>
                <div style={{ fontSize:16, fontWeight:700, color:B.text, fontFamily:F.body }}>{fmt(total)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Expense list */}
      <Card style={{ padding:20 }}>
        <SectionHead title="All Expenses"
          action={role === "manager" && <Btn small onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "+ Add Expense"}</Btn>} />

        {showAdd && (
          <div style={{ background:B.goldPale, border:`1px solid ${B.goldLight}`, borderRadius:12,
            padding:"18px 20px", marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:B.goldDark, fontFamily:F.body, marginBottom:14 }}>
              New Expense
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="Expense Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Meralco Bill" />
              <Input label="Amount (₱)" value={form.amount} onChange={v=>setForm(f=>({...f,amount:v}))} placeholder="0" type="number" />
              <Select label="Category" value={form.category} onChange={v=>setForm(f=>({...f,category:v}))}
                options={EXPENSE_CATEGORIES.map(c=>({value:c.id,label:c.icon+" "+c.label}))} />
              <Select label="Who Bears?" value={form.bearer} onChange={v=>setForm(f=>({...f,bearer:v}))}
                options={[{value:"owner",label:"Owner only"},{value:"shared",label:"Shared (50/50)"},{value:"pm",label:"PM only"}]} />
              <Input label="Unit" value={form.unit} onChange={v=>setForm(f=>({...f,unit:v}))} placeholder="e.g. Unit 1 or All Units" />
              <Input label="Date" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date" />
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <Btn onClick={addExpense}>Save Expense</Btn>
              <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            </div>
          </div>
        )}

        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${B.border}` }}>
              {["Date","Name","Category","Unit","Amount","Bearer","Paid By", role==="manager"?"":""].filter(h=>h!==undefined).map(h=>(
                <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:10, fontFamily:"monospace",
                  letterSpacing:1, textTransform:"uppercase", color:B.textMuted, fontWeight:400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e,i) => {
              const cat = getCat(e.category);
              return (
                <tr key={e.id} style={{ borderBottom:`1px solid ${B.border}`,
                  background: i%2===0 ? B.bg+"66" : "transparent" }}>
                  <td style={{ padding:"10px 12px", color:B.textMuted, fontFamily:"monospace", fontSize:12 }}>{e.date}</td>
                  <td style={{ padding:"10px 12px", color:B.text, fontWeight:600, fontFamily:F.body }}>{e.name}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ background:cat.bg, color:cat.color, border:`1px solid ${cat.color}44`,
                      borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700, fontFamily:F.body }}>
                      {cat.icon} {cat.label}
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px", color:B.textMuted, fontSize:12, fontFamily:F.body }}>{e.unit}</td>
                  <td style={{ padding:"10px 12px", color:B.text, fontWeight:700, textAlign:"right", fontFamily:F.body }}>{fmt(e.amount)}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <Badge label={e.bearer==="owner"?"Owner":e.bearer==="shared"?"Shared":"PM"}
                      color={e.bearer==="owner"?B.blue:e.bearer==="shared"?B.yellow:B.gold}
                      bg={e.bearer==="owner"?B.blueBg:e.bearer==="shared"?B.yellowBg:B.goldPale}
                      border={e.bearer==="owner"?"#BDD3F5":e.bearer==="shared"?"#F5DFA0":"#D4B876"} />
                  </td>
                  <td style={{ padding:"10px 12px", color:B.textMuted, fontSize:12, fontFamily:F.body }}>{e.paidBy}</td>
                  {role === "manager" && (
                    <td style={{ padding:"10px 12px" }}>
                      <button onClick={()=>delExpense(e.id)}
                        style={{ background:"transparent", border:"none", color:B.textLight,
                          cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── MANAGER VIEW ──────────────────────────────────────────────────────────────
function ManagerView({ expenses, setExpenses, commission, setCommission, users, setUsers }) {
  const [tab, setTab] = useState("overview");
  const [selBk, setSelBk] = useState(null);
  // user management state
  const [editUser, setEditUser]   = useState(null);
  const [newUser,  setNewUser]    = useState({ name:"", role:"reservations", username:"", password:"", commissionRate:"" });
  const [showAdd,  setShowAdd]    = useState(false);
  const [pwVisible, setPwVisible] = useState({});

  const gross = BOOKINGS.filter(r=>r.status!=="Cancelled").reduce((s,r)=>s+r.total,0);
  const platformFees = BOOKINGS.filter(r=>r.status!=="Cancelled").reduce((s,r)=>{
    const rate = (commission.byPlatform[r.platform] ?? (r.platform==="Airbnb"?3:r.platform==="Direct"?0:15)) / 100;
    return s + r.total * rate;
  }, 0);
  const totalExp = expenses.reduce((s,e)=>s+e.amount,0);
  const base = commission.base==="gross" ? gross : commission.base==="net" ? gross-platformFees : gross-platformFees-totalExp;
  const pmCommission = base * commission.rate / 100;
  const ownerPayout  = base - pmCommission;
  const outstanding  = BOOKINGS.reduce((s,r)=>s+r.balance,0);
  const active       = BOOKINGS.filter(r=>["Confirmed","Checked In"].includes(r.status)).length;

  const tabs = [["overview","Overview"],["bookings","Reservations"],["expenses","Expenses"],["financials","Financials"],["settings","⚙ Settings"]];

  return (
    <div>
      <div style={{ display:"flex", gap:2, marginBottom:28, borderBottom:`2px solid ${B.border}` }}>
        {tabs.map(([key,lbl]) => (
          <button key={key} onClick={()=>setTab(key)} style={{
            background:"transparent", border:"none",
            color: tab===key ? B.crimson : B.textMuted,
            borderBottom: tab===key ? `3px solid ${B.crimson}` : "3px solid transparent",
            padding:"10px 18px", cursor:"pointer", fontSize:13, fontFamily:F.body, fontWeight:600,
            marginBottom:-2, transition:"all 0.15s"
          }}>{lbl}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:12 }}>
            <KpiCard label="Gross Revenue" value={fmt(gross)} sub="All active bookings" valueColor={B.text} icon="₱" />
            <KpiCard label="Your Commission" value={fmt(Math.round(pmCommission))} sub={`${commission.rate}% of ${commission.base==="gross"?"gross":"net"}`} valueColor={B.gold} icon="✦" />
            <KpiCard label="Owner Payout" value={fmt(Math.round(ownerPayout))} sub={`${100-commission.rate}% to owner`} valueColor={B.crimson} icon="⌂" />
            <KpiCard label="Outstanding" value={fmt(outstanding)} sub="Balance due from guests" valueColor={B.yellow} icon="⏳" />
            <KpiCard label="Active Bookings" value={active} sub={`${BOOKINGS.filter(r=>r.status==="Checked In").length} checked in now`} valueColor={B.blue} icon="🏠" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16 }}>
            <Card style={{ padding:20 }}>
              <SectionHead title="Monthly Revenue" />
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={monthlyRevenue} barSize={26}>
                  <XAxis dataKey="month" tick={{ fill:B.textMuted, fontSize:11, fontFamily:F.body }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background:B.card, border:`1px solid ${B.border}`, borderRadius:10, fontFamily:F.body, fontSize:12 }}
                    formatter={v => fmt(v)} labelStyle={{ color:B.textMid }} />
                  <Bar dataKey="revenue" fill={B.gold} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{ padding:20 }}>
              <SectionHead title="Bookings by Platform" />
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <PieChart width={110} height={110}>
                  <Pie data={[{name:"Airbnb",value:24200},{name:"Direct",value:27100},{name:"Booking.com",value:21700},{name:"Agoda",value:15300}]}
                    dataKey="value" cx={50} cy={50} innerRadius={28} outerRadius={52} strokeWidth={2} stroke={B.bg}>
                    {["Airbnb","Direct","Booking.com","Agoda"].map((p,i) => <Cell key={i} fill={PLATFORM_COLORS[p]} />)}
                  </Pie>
                </PieChart>
                <div style={{ flex:1 }}>
                  {[["Airbnb",24200,4],["Direct",27100,3],["Booking.com",21700,2],["Agoda",15300,3]].map(([p,v,c])=>(
                    <div key={p} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:PLATFORM_COLORS[p] }} />
                        <span style={{ fontSize:12, color:B.textMid, fontFamily:F.body }}>{p}</span>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:12, fontWeight:700, color:B.text, fontFamily:F.body }}>{fmt(v)}</div>
                        <div style={{ fontSize:10, color:B.textMuted, fontFamily:F.body }}>{c} bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          <Card style={{ padding:20 }}>
            <SectionHead title="Unit Occupancy — March 2026" />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {[["Unit 1",78],["Unit 2",65],["Unit 3",82],["Unit 4",71]].map(([u,pct],i)=>(
                <div key={u} style={{ textAlign:"center" }}>
                  <div style={{ position:"relative", width:76, height:76, margin:"0 auto 8px" }}>
                    <svg width="76" height="76" viewBox="0 0 76 76">
                      <circle cx="38" cy="38" r="30" fill="none" stroke={B.border} strokeWidth="7" />
                      <circle cx="38" cy="38" r="30" fill="none"
                        stroke={[B.gold,B.crimson,B.green,B.blue][i]} strokeWidth="7"
                        strokeDasharray={`${2*Math.PI*30*pct/100} ${2*Math.PI*30}`}
                        strokeLinecap="round" transform="rotate(-90 38 38)" />
                    </svg>
                    <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
                      fontSize:14, fontWeight:800, color:B.text, fontFamily:F.body }}>{pct}%</div>
                  </div>
                  <div style={{ fontSize:12, color:B.textMuted, fontFamily:F.body }}>{u}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "bookings" && (
        <div style={{ display:"grid", gridTemplateColumns: selBk ? "1fr 300px" : "1fr", gap:16 }}>
          <Card style={{ overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, fontFamily:F.body }}>
                <thead>
                  <tr style={{ borderBottom:`2px solid ${B.border}`, background:B.bg }}>
                    {["ID","Guest","Unit","Check-in","Check-out","Total","Balance","Platform","Status"].map(h=>(
                      <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:10,
                        fontFamily:"monospace", letterSpacing:1, color:B.textMuted, fontWeight:400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BOOKINGS.map(r=>(
                    <tr key={r.id} onClick={()=>setSelBk(selBk===r.id?null:r.id)}
                      style={{ borderBottom:`1px solid ${B.border}`, cursor:"pointer",
                        background: selBk===r.id ? B.goldPale : "transparent",
                        transition:"background 0.1s" }}>
                      <td style={{ padding:"11px 14px", color:B.textMuted, fontFamily:"monospace", fontSize:11 }}>{r.id}</td>
                      <td style={{ padding:"11px 14px", color:B.text, fontWeight:700 }}>{r.guest}</td>
                      <td style={{ padding:"11px 14px", color:B.textMid, fontSize:12 }}>{r.unit.split("–")[0]}</td>
                      <td style={{ padding:"11px 14px", color:B.textMuted, fontFamily:"monospace", fontSize:12 }}>{r.checkin}</td>
                      <td style={{ padding:"11px 14px", color:B.textMuted, fontFamily:"monospace", fontSize:12 }}>{r.checkout}</td>
                      <td style={{ padding:"11px 14px", color:B.text, fontWeight:700 }}>{fmt(r.total)}</td>
                      <td style={{ padding:"11px 14px", color:r.balance>0?B.yellow:B.green, fontWeight:700 }}>{r.balance>0?fmt(r.balance):"Paid ✓"}</td>
                      <td style={{ padding:"11px 14px" }}><PlatformBadge platform={r.platform} /></td>
                      <td style={{ padding:"11px 14px" }}><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {selBk && (() => {
            const r = BOOKINGS.find(x=>x.id===selBk);
            return (
              <Card style={{ padding:22, alignSelf:"start" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:11, fontFamily:"monospace", color:B.textMuted }}>{r.id}</div>
                    <div style={{ fontSize:18, fontWeight:700, color:B.text, fontFamily:F.display, marginTop:3 }}>{r.guest}</div>
                  </div>
                  <button onClick={()=>setSelBk(null)} style={{ background:B.bg, border:`1px solid ${B.border}`,
                    color:B.textMuted, borderRadius:8, width:30, height:30, cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                  <PlatformBadge platform={r.platform} /><StatusBadge status={r.status} />
                </div>
                {[["Unit",r.unit],["Contact",r.contact],["Channel",r.channel],["Check-in",r.checkin],["Check-out",r.checkout],["Nights",r.nights+"n"],["Guests",r.guests+" pax"],["Rate/Night",fmt(r.rate)],["Total",fmt(r.total)],["Deposit",fmt(r.deposit)],["Balance",r.balance>0?fmt(r.balance)+" due":"Fully Paid ✓"]].map(([l,v])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${B.border}`, fontSize:13, fontFamily:F.body }}>
                    <span style={{ color:B.textMuted }}>{l}</span>
                    <span style={{ color: l==="Balance"&&r.balance===0?B.green:l==="Balance"?B.yellow:B.text, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                {r.notes && <div style={{ marginTop:12, background:B.yellowBg, border:`1px solid ${B.yellow}44`,
                  borderRadius:10, padding:"10px 12px", fontSize:12, color:B.textMid, fontFamily:F.body }}>📝 {r.notes}</div>}
              </Card>
            );
          })()}
        </div>
      )}

      {tab === "expenses" && <ExpensesPanel expenses={expenses} setExpenses={setExpenses} role="manager" />}

      {tab === "financials" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card style={{ padding:24 }}>
            <SectionHead title="Commission Waterfall" />
            {[
              ["Gross Revenue", fmt(gross), B.text, false],
              ["Platform Fees", "−"+fmt(Math.round(platformFees)), B.red, false],
              ["Net Revenue (after fees)", fmt(Math.round(gross-platformFees)), B.text, true],
              ["Total Expenses", "−"+fmt(totalExp), B.red, false],
              ["Commission Base ("+commission.base+")", fmt(Math.round(base)), B.gold, true],
              ["Your Commission ("+commission.rate+"%)", fmt(Math.round(pmCommission)), B.gold, false],
              ["Owner Payout ("+(100-commission.rate)+"%)", fmt(Math.round(ownerPayout)), B.crimson, false],
            ].map(([lbl,val,color,sep],i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                padding: sep ? "12px 0 8px" : "9px 0",
                borderTop: sep ? `2px solid ${B.border}` : "none",
                borderBottom:`1px solid ${B.border}`, fontFamily:F.body }}>
                <span style={{ fontSize:13, color:sep?B.text:B.textMid, fontWeight:sep?700:400 }}>{lbl}</span>
                <span style={{ fontSize:13, color, fontWeight:700 }}>{val}</span>
              </div>
            ))}
          </Card>
          <Card style={{ padding:24 }}>
            <SectionHead title="Expenses Summary" />
            <ExpensesPanel expenses={expenses} setExpenses={setExpenses} role="view" />
          </Card>
        </div>
      )}

      {tab === "settings" && (
        <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

          {/* Commission Settings */}
          <div>
            <div style={{ fontSize:22, fontWeight:600, fontFamily:F.display, color:B.text, marginBottom:4 }}>Commission Settings</div>
            <div style={{ fontSize:13, color:B.textMuted, fontFamily:F.body, marginBottom:20 }}>
              Configure how your commission is calculated per owner. Changes apply instantly.
            </div>
            <CommissionSettings config={commission} onChange={setCommission} users={users} />
          </div>

          {/* User Management */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ fontSize:22, fontWeight:600, fontFamily:F.display, color:B.text }}>Team & User Management</div>
              <Btn small onClick={() => { setShowAdd(v=>!v); setEditUser(null); }}>
                {showAdd ? "Cancel" : "+ Add User"}
              </Btn>
            </div>
            <div style={{ fontSize:13, color:B.textMuted, fontFamily:F.body, marginBottom:20 }}>
              Manage who can log in and what they can see. Only managers can access this panel.
            </div>

            {/* Add user form */}
            {showAdd && (
              <Card style={{ padding:22, marginBottom:16, border:`1px solid ${B.goldLight}` }}>
                <div style={{ fontSize:14, fontWeight:700, color:B.goldDark, fontFamily:F.body, marginBottom:16 }}>New User</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Input label="Full Name" value={newUser.name} onChange={v=>setNewUser(u=>({...u,name:v}))} placeholder="e.g. Maria Santos" />
                  <Select label="Role" value={newUser.role} onChange={v=>setNewUser(u=>({...u,role:v}))}
                    options={Object.entries(ROLES).map(([k,r])=>({ value:k, label:r.icon+" "+r.label }))} />
                  <Input label="Username" value={newUser.username} onChange={v=>setNewUser(u=>({...u,username:v}))} placeholder="e.g. maria" />
                  <Input label="Password" value={newUser.password} onChange={v=>setNewUser(u=>({...u,password:v}))} placeholder="Set a password" type="password" />
                  {newUser.role === "owner" && (
                    <div>
                      <Input label="Commission Rate (%) — leave blank for default" value={newUser.commissionRate}
                        onChange={v=>setNewUser(u=>({...u,commissionRate:v}))} placeholder={`Default: ${commission.rate}%`} type="number" />
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:10, marginTop:4 }}>
                  <Btn onClick={() => {
                    if (!newUser.name || !newUser.username || !newUser.password) return;
                    const initials = newUser.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
                    setUsers(prev => [...prev, {
                      ...newUser, id:"u"+Date.now(), avatar:initials,
                      commissionRate: newUser.commissionRate ? Number(newUser.commissionRate) : null
                    }]);
                    setNewUser({ name:"", role:"reservations", username:"", password:"", commissionRate:"" });
                    setShowAdd(false);
                  }}>Save User</Btn>
                  <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
                </div>
              </Card>
            )}

            {/* User list */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {users.map(u => {
                const role = ROLES[u.role];
                const isEdit = editUser?.id === u.id;
                return (
                  <Card key={u.id} style={{ padding:"16px 20px", border: isEdit ? `1px solid ${B.gold}` : `1px solid ${B.border}` }}>
                    {!isEdit ? (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                          <div style={{ width:42, height:42, borderRadius:10, background:role.bg,
                            border:`1px solid ${role.color}33`, display:"flex", alignItems:"center",
                            justifyContent:"center", fontSize:14, fontWeight:800, color:role.color, fontFamily:F.body }}>
                            {u.avatar}
                          </div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700, color:B.text, fontFamily:F.body }}>{u.name}</div>
                            <div style={{ fontSize:12, color:B.textMuted, fontFamily:F.body, marginTop:1 }}>
                              @{u.username} · {role.label}
                              {u.role === "owner" && u.commissionRate != null &&
                                <span style={{ marginLeft:8, background:B.goldPale, color:B.goldDark,
                                  border:`1px solid ${B.goldLight}`, borderRadius:10, padding:"1px 8px",
                                  fontSize:11, fontWeight:700 }}>
                                  {u.commissionRate}% commission
                                </span>
                              }
                              {u.role === "owner" && u.commissionRate == null &&
                                <span style={{ marginLeft:8, color:B.textLight, fontSize:11 }}>
                                  default {commission.rate}%
                                </span>
                              }
                            </div>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <Badge label={role.access} color={role.color} bg={role.bg} />
                          <Btn small variant="ghost" onClick={()=>setEditUser({...u})}>Edit</Btn>
                          {u.role !== "manager" &&
                            <Btn small variant="danger" onClick={()=>setUsers(prev=>prev.filter(x=>x.id!==u.id))}>Remove</Btn>
                          }
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:B.goldDark, fontFamily:F.body, marginBottom:14 }}>
                          Editing: {u.name}
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                          <Input label="Full Name" value={editUser.name} onChange={v=>setEditUser(e=>({...e,name:v}))} />
                          <Select label="Role" value={editUser.role} onChange={v=>setEditUser(e=>({...e,role:v}))}
                            options={Object.entries(ROLES).map(([k,r])=>({value:k,label:r.icon+" "+r.label}))} />
                          <Input label="Username" value={editUser.username} onChange={v=>setEditUser(e=>({...e,username:v}))} />
                          <Input label="New Password (leave blank to keep)" value={editUser.newPassword||""} type="password"
                            onChange={v=>setEditUser(e=>({...e,newPassword:v}))} placeholder="Leave blank to keep current" />
                          {editUser.role === "owner" && (
                            <Input label={`Commission Rate (%) — default is ${commission.rate}%`}
                              value={editUser.commissionRate ?? ""} type="number"
                              onChange={v=>setEditUser(e=>({...e,commissionRate:v===""?null:Number(v)}))}
                              placeholder={`${commission.rate}`} />
                          )}
                        </div>
                        <div style={{ display:"flex", gap:10, marginTop:4 }}>
                          <Btn onClick={() => {
                            setUsers(prev => prev.map(x => x.id === editUser.id ? {
                              ...editUser,
                              password: editUser.newPassword || editUser.password,
                              avatar: editUser.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
                            } : x));
                            setEditUser(null);
                          }}>Save Changes</Btn>
                          <Btn variant="ghost" onClick={()=>setEditUser(null)}>Cancel</Btn>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── OWNER VIEW ────────────────────────────────────────────────────────────────
function OwnerView({ expenses, commission, ownerRate }) {
  const rate = ownerRate ?? commission.rate;
  const gross = BOOKINGS.filter(r=>r.status!=="Cancelled"&&r.checkin>="2026-03-01").reduce((s,r)=>s+r.total,0);
  const platformFees = BOOKINGS.filter(r=>r.status!=="Cancelled"&&r.checkin>="2026-03-01").reduce((s,r)=>{
    const feeRate = (commission.byPlatform[r.platform] ?? (r.platform==="Airbnb"?3:r.platform==="Direct"?0:15))/100;
    return s + r.total*feeRate;
  },0);
  const ownerExpenses = expenses.reduce((s,e)=>s+(e.bearer==="owner"?e.amount:e.bearer==="shared"?e.amount*0.5:0),0);
  const base = commission.base==="gross"?gross:commission.base==="net"?gross-platformFees:gross-platformFees-ownerExpenses;
  const pmCut = base*rate/100;
  const ownerPayout = base-pmCut;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:12 }}>
        <KpiCard label="Gross Revenue" value={fmt(gross)} sub="All bookings this month" valueColor={B.text} icon="₱" />
        <KpiCard label="Platform Fees" value={"−"+fmt(Math.round(platformFees))} sub="OTA commissions" valueColor={B.red} icon="%" />
        <KpiCard label="Your Expenses" value={"−"+fmt(Math.round(ownerExpenses))} sub="Your share only" valueColor={B.yellow} icon="💸" />
        <KpiCard label="PM Commission" value={"−"+fmt(Math.round(pmCut))} sub={`${rate}% to manager`} valueColor={B.textMuted} icon="✦" />
        <KpiCard label="Your Payout" value={fmt(Math.round(ownerPayout))} sub="Net earnings this month" valueColor={B.crimson} icon="⌂" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:16 }}>
        <Card style={{ padding:20 }}>
          <SectionHead title="Revenue Trend" />
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={monthlyRevenue} barSize={22}>
              <XAxis dataKey="month" tick={{ fill:B.textMuted, fontSize:11, fontFamily:F.body }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background:B.card, border:`1px solid ${B.border}`, borderRadius:10, fontFamily:F.body, fontSize:12 }}
                formatter={v=>fmt(v)} />
              <Bar dataKey="revenue" fill={B.crimson} radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ padding:20 }}>
          <SectionHead title="Occupancy" />
          {[["Unit 1",78],["Unit 2",65],["Unit 3",82],["Unit 4",71]].map(([u,p],i)=>(
            <div key={u} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:B.textMid, fontFamily:F.body }}>{u}</span>
                <span style={{ fontSize:12, fontWeight:700, color:B.text, fontFamily:F.body }}>{p}%</span>
              </div>
              <div style={{ background:B.border, borderRadius:4, height:6 }}>
                <div style={{ height:6, borderRadius:4, background:[B.gold,B.crimson,B.green,B.blue][i], width:`${p}%`, transition:"width 0.5s" }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ padding:20 }}>
        <SectionHead title="Your Reservations — March 2026" />
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, fontFamily:F.body }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${B.border}`, background:B.bg }}>
              {["Guest","Unit","Dates","Gross","Fee","Net","Status"].map(h=>(
                <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:10, fontFamily:"monospace", letterSpacing:1, color:B.textMuted, fontWeight:400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOOKINGS.filter(r=>r.checkin>="2026-03-01"&&r.status!=="Cancelled").map((r,i)=>{
              const feeRate = (commission.byPlatform[r.platform] ?? (r.platform==="Airbnb"?3:r.platform==="Direct"?0:15))/100;
              const fee = r.total*feeRate;
              return (
                <tr key={r.id} style={{ borderBottom:`1px solid ${B.border}`, background:i%2===0?B.bg+"55":"transparent" }}>
                  <td style={{ padding:"10px 14px", fontWeight:700, color:B.text }}>{r.guest}</td>
                  <td style={{ padding:"10px 14px", color:B.textMid, fontSize:12 }}>{r.unit.split("–")[0]}</td>
                  <td style={{ padding:"10px 14px", color:B.textMuted, fontFamily:"monospace", fontSize:12 }}>{r.checkin.slice(5)} → {r.checkout.slice(5)}</td>
                  <td style={{ padding:"10px 14px", fontWeight:700, color:B.text }}>{fmt(r.total)}</td>
                  <td style={{ padding:"10px 14px", color:B.red }}>{fee>0?"−"+fmt(Math.round(fee)):"—"}</td>
                  <td style={{ padding:"10px 14px", fontWeight:700, color:B.green }}>{fmt(Math.round(r.total-fee))}</td>
                  <td style={{ padding:"10px 14px" }}><StatusBadge status={r.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card style={{ padding:20 }}>
        <SectionHead title="Your Expense Share" />
        {expenses.filter(e=>e.bearer!=="pm").map((e,i)=>{
          const cat = getCat(e.category);
          const yourShare = e.bearer==="owner"?e.amount:e.amount*0.5;
          return (
            <div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 0", borderBottom:`1px solid ${B.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:B.text, fontFamily:F.body }}>{e.name}</div>
                  <div style={{ fontSize:11, color:B.textMuted, fontFamily:F.body }}>{cat.label} · {e.unit}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:14, fontWeight:700, color:B.text, fontFamily:F.body }}>{fmt(yourShare)}</div>
                <Badge label={e.bearer==="shared"?"Your 50%":"Full Amount"}
                  color={e.bearer==="shared"?B.yellow:B.blue}
                  bg={e.bearer==="shared"?B.yellowBg:B.blueBg} />
              </div>
            </div>
          );
        })}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", fontFamily:F.body }}>
          <span style={{ fontWeight:700, fontSize:14, color:B.text }}>Total Your Share</span>
          <span style={{ fontWeight:800, fontSize:18, color:B.red }}>{fmt(Math.round(ownerExpenses))}</span>
        </div>
      </Card>
    </div>
  );
}

// ── RESERVATIONS VIEW ─────────────────────────────────────────────────────────
function ReservationsView() {
  const [sel, setSel] = useState(null);
  const pending    = BOOKINGS.filter(r=>r.status==="Pending");
  const todayIn    = BOOKINGS.filter(r=>r.checkin===today);
  const todayOut   = BOOKINGS.filter(r=>r.checkout===today);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <KpiCard label="Pending" value={pending.length} sub="Need follow-up" valueColor={B.yellow} icon="⏳" />
        <KpiCard label="Checked In" value={BOOKINGS.filter(r=>r.status==="Checked In").length} sub="Currently occupied" valueColor={B.green} icon="✓" />
        <KpiCard label="Arrivals Today" value={todayIn.length} sub="Check-ins today" valueColor={B.blue} icon="→" />
        <KpiCard label="Departures Today" value={todayOut.length} sub="Check-outs today" valueColor={B.textMuted} icon="←" />
      </div>

      {pending.length > 0 && (
        <Card style={{ padding:20, border:`1px solid ${B.yellow}66`, background:B.yellowBg }}>
          <SectionHead title="⚠ Pending — Action Required" />
          {pending.map(r=>(
            <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 0", borderBottom:`1px solid ${B.yellow}44` }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:B.text, fontFamily:F.body }}>{r.guest}</div>
                <div style={{ fontSize:12, color:B.textMid, fontFamily:F.body }}>{r.unit} · {r.channel} · {r.checkin}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:14, fontWeight:700, color:B.yellow, fontFamily:F.body }}>{fmt(r.total)} due</div>
                <div style={{ fontSize:11, color:B.textMuted, fontFamily:F.body }}>{r.contact}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:sel?"1fr 300px":"1fr", gap:16 }}>
        <Card style={{ overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, fontFamily:F.body }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${B.border}`, background:B.bg }}>
                {["ID","Guest","Contact","Platform","Unit","Check-in","Check-out","Pax","Balance","Status"].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, fontFamily:"monospace", letterSpacing:1, color:B.textMuted, fontWeight:400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BOOKINGS.map(r=>(
                <tr key={r.id} onClick={()=>setSel(sel===r.id?null:r.id)}
                  style={{ borderBottom:`1px solid ${B.border}`, cursor:"pointer",
                    background:sel===r.id?B.goldPale:"transparent", transition:"background 0.1s" }}>
                  <td style={{ padding:"10px 14px", color:B.textMuted, fontFamily:"monospace", fontSize:11 }}>{r.id}</td>
                  <td style={{ padding:"10px 14px", fontWeight:700, color:B.text }}>{r.guest}</td>
                  <td style={{ padding:"10px 14px", color:B.textMid, fontSize:12 }}>{r.contact}</td>
                  <td style={{ padding:"10px 14px" }}><PlatformBadge platform={r.platform} /></td>
                  <td style={{ padding:"10px 14px", color:B.textMid, fontSize:12 }}>{r.unit.split("–")[0]}</td>
                  <td style={{ padding:"10px 14px", color:B.textMuted, fontFamily:"monospace", fontSize:12 }}>{r.checkin}</td>
                  <td style={{ padding:"10px 14px", color:B.textMuted, fontFamily:"monospace", fontSize:12 }}>{r.checkout}</td>
                  <td style={{ padding:"10px 14px", color:B.textMuted, textAlign:"center" }}>{r.guests}</td>
                  <td style={{ padding:"10px 14px", fontWeight:700, color:r.balance>0?B.yellow:B.green }}>{r.balance>0?fmt(r.balance):"Paid"}</td>
                  <td style={{ padding:"10px 14px" }}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {sel && (() => {
          const r = BOOKINGS.find(x=>x.id===sel);
          return (
            <Card style={{ padding:22, alignSelf:"start" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ fontSize:17, fontWeight:700, fontFamily:F.display, color:B.text }}>{r.guest}</div>
                <button onClick={()=>setSel(null)} style={{ background:B.bg, border:`1px solid ${B.border}`, color:B.textMuted, borderRadius:8, width:30, height:30, cursor:"pointer" }}>×</button>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                <PlatformBadge platform={r.platform} /><StatusBadge status={r.status} />
              </div>
              {[["Contact",r.contact],["Channel",r.channel],["Unit",r.unit],["Check-in",r.checkin],["Check-out",r.checkout],["Duration",r.nights+"n · "+r.guests+" pax"],["Balance",r.balance>0?fmt(r.balance)+" DUE":"Paid ✓"]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${B.border}`, fontSize:13, fontFamily:F.body }}>
                  <span style={{ color:B.textMuted }}>{l}</span>
                  <span style={{ fontWeight:600, color:l==="Balance"&&r.balance===0?B.green:l==="Balance"?B.yellow:B.text }}>{v}</span>
                </div>
              ))}
              {r.notes && <div style={{ marginTop:12, background:B.yellowBg, borderRadius:10, padding:"9px 12px", fontSize:12, color:B.textMid, fontFamily:F.body }}>📝 {r.notes}</div>}
            </Card>
          );
        })()}
      </div>
    </div>
  );
}

// ── HOUSEKEEPING VIEW ─────────────────────────────────────────────────────────
function HousekeepingView() {
  const [sched, setSched] = useState([
    { date:"Mar 10", unit:"Unit 4 – Standard", type:"checkout", guest:"Carlo Mendoza",  guests:2, done:false, note:"" },
    { date:"Mar 10", unit:"Unit 2 – Studio",   type:"checkin",  guest:"John Reyes",     guests:1, done:false, note:"" },
    { date:"Mar 11", unit:"Unit 1 – Deluxe",   type:"checkout", guest:"Maria Santos",   guests:2, done:false, note:"Late check-in guest" },
    { date:"Mar 12", unit:"Unit 3 – Suite",    type:"checkin",  guest:"Anna Lim",       guests:4, done:false, note:"Extra bed needed" },
    { date:"Mar 13", unit:"Unit 2 – Studio",   type:"checkout", guest:"John Reyes",     guests:1, done:false, note:"" },
    { date:"Mar 15", unit:"Unit 3 – Suite",    type:"checkout", guest:"Anna Lim",       guests:4, done:false, note:"" },
    { date:"Mar 15", unit:"Unit 2 – Studio",   type:"checkin",  guest:"Sofia Cruz",     guests:2, done:false, note:"" },
  ]);

  const toggle = i => setSched(s => s.map((x,j) => j===i ? {...x,done:!x.done} : x));
  const checkouts = BOOKINGS.filter(r=>r.checkout===today);
  const checkins  = BOOKINGS.filter(r=>r.checkin===today);
  const occupied  = BOOKINGS.filter(r=>r.checkin<today&&r.checkout>today&&r.status!=="Cancelled");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card style={{ padding:"16px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:700, fontFamily:F.display, color:B.text }}>Tuesday, March 10 — Today</div>
          <div style={{ fontSize:12, color:B.textMuted, fontFamily:F.body }}>CDO Vacation Units</div>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {[[checkouts.length,"Check-outs",B.red],[checkins.length,"Check-ins",B.green],[occupied.length,"Occupied",B.gold]].map(([n,l,c])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:800, color:c, fontFamily:F.body }}>{n}</div>
              <div style={{ fontSize:11, color:B.textMuted, fontFamily:"monospace" }}>{l}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        {[
          { title:"Check-outs — Clean Now", items:checkouts, color:B.red, bg:B.redBg, action:"🧹 Clean" },
          { title:"Check-ins — Prepare", items:checkins, color:B.green, bg:B.greenBg, action:"✨ Prepare" },
          { title:"Occupied — Do Not Disturb", items:occupied, color:B.gold, bg:B.goldPale, action:"—" },
        ].map(({title,items,color,bg,action})=>(
          <Card key={title} style={{ padding:18, border:`1px solid ${color}33` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:color }} />
              <span style={{ fontSize:11, fontFamily:"monospace", letterSpacing:1, textTransform:"uppercase", color:B.textMuted }}>{title}</span>
              <span style={{ background:color+"22", color, borderRadius:20, padding:"1px 9px", fontSize:11, fontWeight:700, fontFamily:F.body }}>{items.length}</span>
            </div>
            {items.length===0 && <div style={{ fontSize:13, color:B.textLight, fontFamily:F.body }}>None today</div>}
            {items.map((r,i)=>(
              <div key={i} style={{ background:bg, border:`1px solid ${color}22`, borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
                <div style={{ fontSize:13, fontWeight:700, color:B.text, fontFamily:F.body }}>{r.unit}</div>
                <div style={{ fontSize:12, color:B.textMid, fontFamily:F.body, marginTop:2 }}>{r.guest} · {r.guests} pax</div>
                {r.notes && <div style={{ fontSize:11, color:B.yellow, fontFamily:F.body, marginTop:4 }}>⚠ {r.notes}</div>}
                {action !== "—" && <div style={{ marginTop:8, fontSize:11, fontWeight:700, color, fontFamily:F.body }}>{action}</div>}
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Card style={{ padding:20 }}>
        <SectionHead title="7-Day Turnover Schedule" />
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, fontFamily:F.body }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${B.border}`, background:B.bg }}>
              {["Date","Unit","Type","Guest","Pax","Note","Status","Action"].map(h=>(
                <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:10, fontFamily:"monospace", letterSpacing:1, color:B.textMuted, fontWeight:400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sched.map((item,idx)=>(
              <tr key={idx} style={{ borderBottom:`1px solid ${B.border}`, opacity:item.done?0.45:1 }}>
                <td style={{ padding:"10px 14px", color:B.textMuted, fontFamily:"monospace", fontSize:12 }}>{item.date}</td>
                <td style={{ padding:"10px 14px", color:B.text, fontWeight:600 }}>{item.unit.split("–")[0]}</td>
                <td style={{ padding:"10px 14px" }}>
                  <Badge label={item.type==="checkout"?"⬆ Check-out":"⬇ Check-in"}
                    color={item.type==="checkout"?B.red:B.green}
                    bg={item.type==="checkout"?B.redBg:B.greenBg}
                    border={item.type==="checkout"?"#F5C6C2":"#B6E4CE"} />
                </td>
                <td style={{ padding:"10px 14px", color:B.textMid }}>{item.guest}</td>
                <td style={{ padding:"10px 14px", color:B.textMuted, textAlign:"center" }}>{item.guests}</td>
                <td style={{ padding:"10px 14px", color:B.yellow, fontSize:12 }}>{item.note||"—"}</td>
                <td style={{ padding:"10px 14px" }}>
                  <Badge label={item.done?"✓ Done":"Pending"}
                    color={item.done?B.green:B.yellow}
                    bg={item.done?B.greenBg:B.yellowBg}
                    border={item.done?"#B6E4CE":"#F5DFA0"} />
                </td>
                <td style={{ padding:"10px 14px" }}>
                  <button onClick={()=>toggle(idx)} style={{
                    background:item.done?B.greenBg:B.bg, border:`1px solid ${item.done?B.green:B.border}`,
                    color:item.done?B.green:B.textMid, borderRadius:8, padding:"5px 14px",
                    cursor:"pointer", fontSize:12, fontFamily:F.body, fontWeight:600, transition:"all 0.15s"
                  }}>{item.done?"Undo":"Mark Done"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]             = useState(null);
  const [users, setUsers]           = useState(INITIAL_USERS);
  const [expenses, setExpenses]     = useState(INITIAL_EXPENSES);
  const [commission, setCommission] = useState(DEFAULT_COMMISSION);

  // resolve effective commission rate for a given user
  const effectiveRate = (u) => (u?.commissionRate != null ? u.commissionRate : commission.rate);

  if (!user) return <LoginScreen onLogin={setUser} users={users} />;

  // re-lookup user from live users list so edits apply immediately
  const liveUser = users.find(u => u.id === user.id) || user;
  const role = ROLES[liveUser.role];
  const pending = BOOKINGS.filter(r=>r.status==="Pending").length;

  const VIEW = {
    manager:      <ManagerView expenses={expenses} setExpenses={setExpenses} commission={commission} setCommission={setCommission} users={users} setUsers={setUsers} />,
    owner:        <OwnerView expenses={expenses} commission={commission} ownerRate={effectiveRate(liveUser)} />,
    reservations: <ReservationsView />,
    housekeeping: <HousekeepingView />,
  };

  const PAGE_TITLE = { manager:"Operations Overview", owner:"Your Property Report", reservations:"Bookings & Guests", housekeeping:"Daily Operations" };

  return (
    <div style={{ minHeight:"100vh", background:B.bg, fontFamily:F.body, color:B.text }}>
      {/* Top Bar */}
      <div style={{ background:B.surface, borderBottom:`1px solid ${B.border}`, padding:"0 28px",
        height:58, display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <CohostLogo size={34} />
          <div>
            <div style={{ fontSize:16, fontWeight:700, fontFamily:F.display, color:B.text, lineHeight:1 }}>
              Co-Host <span style={{ color:B.crimson }}>Solutions</span>
            </div>
            <div style={{ fontSize:10, color:B.textMuted, fontFamily:"monospace", letterSpacing:1 }}>CDO Vacation Units</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {pending>0 && liveUser.role!=="housekeeping" && (
            <div style={{ background:B.yellowBg, border:`1px solid ${B.yellow}66`, borderRadius:20,
              padding:"4px 12px", fontSize:11, color:B.yellow, fontWeight:700, fontFamily:F.body }}>
              {pending} pending
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:B.bg,
            border:`1px solid ${B.border}`, borderRadius:20, padding:"5px 14px 5px 8px" }}>
            <div style={{ width:26, height:26, borderRadius:8, background:role.bg,
              border:`1px solid ${role.color}33`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:13, fontWeight:800, color:role.color }}>
              {liveUser.avatar}
            </div>
            <span style={{ fontSize:13, fontWeight:600, color:B.text }}>{liveUser.name}</span>
            <span style={{ fontSize:10, background:role.bg,
              color:role.color, padding:"2px 7px", borderRadius:10, fontWeight:700 }}>{role.access}</span>
          </div>
          <button onClick={()=>setUser(null)} style={{ background:"transparent", border:`1px solid ${B.border}`,
            color:B.textMuted, borderRadius:10, padding:"6px 14px", cursor:"pointer", fontSize:12,
            fontFamily:F.body, fontWeight:600 }}>Sign out</button>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ background:B.surface, borderBottom:`1px solid ${B.border}`, padding:"22px 28px 0" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", paddingBottom:18 }}>
            <div>
              <div style={{ fontSize:11, fontFamily:"monospace", letterSpacing:1.5,
                color:role.color, textTransform:"uppercase", marginBottom:6 }}>
                {role.icon}  {role.label}
              </div>
              <h1 style={{ margin:0, fontSize:26, fontWeight:600, fontFamily:F.display, color:B.text, letterSpacing:-0.3 }}>
                {PAGE_TITLE[liveUser.role]}
              </h1>
              <div style={{ fontSize:12, color:B.textMuted, fontFamily:F.body, marginTop:4 }}>
                March 2026 · 4 properties
              </div>
            </div>
            <div style={{ fontSize:11, color:B.textLight, fontFamily:"monospace", paddingBottom:4 }}>
              Synced · Mar 10, 2026
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:"28px", maxWidth:1200, margin:"0 auto" }}>
        {VIEW[liveUser.role]}
      </div>

      <div style={{ textAlign:"center", padding:"20px", fontSize:11, color:B.textLight, fontFamily:"monospace",
        borderTop:`1px solid ${B.border}` }}>
        Co-Host Solutions · Optimized Hosting · Elevated Stays · Maximum Bookings
      </div>
    </div>
  );
}
