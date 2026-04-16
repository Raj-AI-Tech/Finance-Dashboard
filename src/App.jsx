import { useState, useEffect, useMemo } from "react";

const SEED_TRANSACTIONS = [
  { id: "1",  type: "income",  category: "Salary",        title: "Monthly Salary",     amount: 85000, date: "2026-04-01", note: "April salary credit" },
  { id: "2",  type: "income",  category: "Freelance",     title: "UI Design Project",  amount: 18000, date: "2026-04-05", note: "Fintech dashboard" },
  { id: "3",  type: "expense", category: "Food",          title: "Grocery Run",        amount: 3200,  date: "2026-04-06", note: "Weekly groceries" },
  { id: "4",  type: "expense", category: "Transport",     title: "Uber Rides",         amount: 1100,  date: "2026-04-07", note: "" },
  { id: "5",  type: "expense", category: "Utilities",     title: "Electricity Bill",   amount: 2400,  date: "2026-04-08", note: "March bill" },
  { id: "6",  type: "income",  category: "Investment",    title: "Dividend Payout",    amount: 5500,  date: "2026-04-09", note: "Quarterly dividend" },
  { id: "7",  type: "expense", category: "Shopping",      title: "Clothing",           amount: 4200,  date: "2026-04-10", note: "Summer wardrobe" },
  { id: "8",  type: "expense", category: "Health",        title: "Gym Membership",     amount: 2000,  date: "2026-04-11", note: "Monthly fee" },
  { id: "9",  type: "expense", category: "Entertainment", title: "OTT Subscriptions",  amount: 899,   date: "2026-04-12", note: "" },
  { id: "10", type: "income",  category: "Freelance",     title: "Content Writing",    amount: 7500,  date: "2026-04-13", note: "Blog series" },
  { id: "11", type: "expense", category: "Food",          title: "Restaurant Dinner",  amount: 1850,  date: "2026-04-13", note: "Anniversary dinner" },
  { id: "12", type: "expense", category: "Transport",     title: "Fuel",               amount: 2200,  date: "2026-03-28", note: "" },
  { id: "13", type: "income",  category: "Salary",        title: "March Salary",       amount: 85000, date: "2026-03-01", note: "" },
  { id: "14", type: "expense", category: "Rent",          title: "House Rent",         amount: 22000, date: "2026-03-05", note: "March rent" },
  { id: "15", type: "expense", category: "Education",     title: "Online Course",      amount: 3999,  date: "2026-03-15", note: "React Advanced" },
];

const EXPENSE_CATEGORIES = ["Food","Transport","Utilities","Shopping","Health","Entertainment","Rent","Education","Travel","Other"];
const INCOME_CATEGORIES  = ["Salary","Freelance","Investment","Business","Gift","Other"];
const FILTER_OPTIONS     = ["Daily","Weekly","Monthly","All Time"];

const CAT = {
  Food:          { hue: "#D95F43", light: "#FCF0EC", dark: "#8A3321", abbr: "FD" },
  Transport:     { hue: "#6B5BC4", light: "#EEEAFC", dark: "#3A2E7A", abbr: "TR" },
  Utilities:     { hue: "#2F8FC4", light: "#E5F3FC", dark: "#14547A", abbr: "UT" },
  Shopping:      { hue: "#C44F8F", light: "#FCE8F4", dark: "#7A2455", abbr: "SH" },
  Health:        { hue: "#2BA86A", light: "#E4F7ED", dark: "#145C37", abbr: "HT" },
  Entertainment: { hue: "#C48A24", light: "#FBF4E3", dark: "#7A5210", abbr: "EN" },
  Rent:          { hue: "#5B6EC4", light: "#EAECFC", dark: "#2C3A7A", abbr: "RN" },
  Education:     { hue: "#22A8AA", light: "#E3F7F7", dark: "#106567", abbr: "ED" },
  Travel:        { hue: "#C44057", light: "#FCE8EC", dark: "#7A1F2D", abbr: "TV" },
  Salary:        { hue: "#2BAA5E", light: "#E4F7ED", dark: "#145C31", abbr: "SL" },
  Freelance:     { hue: "#8A5CC4", light: "#F0EAFC", dark: "#4C2C7A", abbr: "FL" },
  Investment:    { hue: "#2294B4", light: "#E3F4FA", dark: "#105A6E", abbr: "IN" },
  Business:      { hue: "#6AA426", light: "#EEF7E2", dark: "#376212", abbr: "BZ" },
  Gift:          { hue: "#C47830", light: "#FAEEE3", dark: "#7A4410", abbr: "GF" },
  Other:         { hue: "#7A8799", light: "#EDF0F3", dark: "#3D4450", abbr: "OT" },
};

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function getDateRange(filter) {
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (filter === "Daily")   return { start: today, end: now };
  if (filter === "Weekly")  { const s = new Date(today); s.setDate(today.getDate()-6); return { start: s, end: now }; }
  if (filter === "Monthly") return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
  return { start: new Date("2000-01-01"), end: now };
}
function formatINR(n) {
  return new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(n);
}
function formatDate(s) {
  return new Date(s).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}


// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ transactions, filter }) {
  const bars = useMemo(() => {
    const now = new Date();
    let labels = [], groups = {};
    if (filter === "Daily") {
      for (let i=6;i>=0;i--) {
        const d=new Date(now); d.setDate(d.getDate()-i);
        const key=d.toISOString().slice(0,10);
        labels.push({ key, label: d.toLocaleDateString("en-IN",{weekday:"short"}) });
        groups[key]={income:0,expense:0};
      }
    } else if (filter === "Weekly") {
      for (let i=3;i>=0;i--) {
        const d=new Date(now); d.setDate(d.getDate()-i*7);
        const ws=new Date(d); ws.setDate(d.getDate()-d.getDay());
        const key=ws.toISOString().slice(0,10);
        labels.push({ key, label:`W${4-i}` });
        groups[key]={income:0,expense:0};
      }
    } else if (filter === "Monthly") {
      for (let i=5;i>=0;i--) {
        const d=new Date(now.getFullYear(), now.getMonth()-i, 1);
        const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        labels.push({ key, label: d.toLocaleDateString("en-IN",{month:"short"}) });
        groups[key]={income:0,expense:0};
      }
    } else {
      for (let i=4;i>=0;i--) {
        const key=String(now.getFullYear()-i);
        labels.push({ key, label:key });
        groups[key]={income:0,expense:0};
      }
    }
    transactions.forEach(t => {
      const d=new Date(t.date); let key;
      if (filter==="Daily") key=t.date;
      else if (filter==="Weekly") { const ws=new Date(d); ws.setDate(d.getDate()-d.getDay()); key=ws.toISOString().slice(0,10); }
      else if (filter==="Monthly") key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      else key=String(d.getFullYear());
      if (groups[key]!==undefined) groups[key][t.type]+=t.amount;
    });
    return labels.map(({key,label})=>({label,...groups[key]}));
  }, [transactions, filter]);

  const maxVal = Math.max(...bars.flatMap(b=>[b.income,b.expense]),1);
  const H=150, barW=16, gGap=6, gap=18;
  const W = bars.length*(barW*2+gGap+gap)+gap;

  return (
    <div className="et-chart-scroll">
      <svg viewBox={`0 0 ${Math.max(W,320)} ${H+36}`} style={{width:"100%",minWidth:280,fontFamily:"Sora,sans-serif"}}>
        {[0,0.25,0.5,0.75,1].map(v=>(
          <line key={v} x1={0} y1={H-v*H} x2={W} y2={H-v*H}
            stroke="#C8BCA8" strokeWidth="1" strokeDasharray="3 4" />
        ))}
        {bars.map((b,i)=>{
          const x=gap+i*(barW*2+gGap+gap);
          const ih=(b.income/maxVal)*(H-4);
          const eh=(b.expense/maxVal)*(H-4);
          return (
            <g key={i}>
              <rect x={x} y={H-ih} width={barW} height={Math.max(ih,3)} rx="5" fill="#2BAA5E" opacity="0.82"/>
              <rect x={x+barW+gGap} y={H-eh} width={barW} height={Math.max(eh,3)} rx="5" fill="#D95F43" opacity="0.82"/>
              <text x={x+barW+gGap/2} y={H+17} textAnchor="middle" fill="#8A8077" fontSize="10" fontFamily="Sora,sans-serif">{b.label}</text>
            </g>
          );
        })}
        <g transform={`translate(6,${H+25})`}>
          <rect width="8" height="8" rx="2" fill="#2BAA5E"/>
          <text x="12" y="8" fill="#574F44" fontSize="10" fontFamily="Sora,sans-serif">Income</text>
          <rect x="62" width="8" height="8" rx="2" fill="#D95F43"/>
          <text x="74" y="8" fill="#574F44" fontSize="10" fontFamily="Sora,sans-serif">Expense</text>
        </g>
      </svg>
    </div>
  );
}

// ── Breakdown ─────────────────────────────────────────────────────────────────
function Breakdown({ transactions }) {
  const data = useMemo(()=>{
    const map={};
    transactions.filter(t=>t.type==="expense").forEach(t=>{ map[t.category]=(map[t.category]||0)+t.amount; });
    const arr=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,7);
    const total=arr.reduce((s,[,v])=>s+v,0)||1;
    return arr.map(([cat,val])=>({cat,val,pct:val/total}));
  },[transactions]);

  if (!data.length) return <p style={{color:"var(--ink-3)",fontSize:12,textAlign:"center",padding:"32px 0"}}>No expense data in range</p>;
  return (
    <div className="et-breakdown">
      {data.map(({cat,val,pct})=>{
        const m=CAT[cat]||CAT.Other;
        return (
          <div key={cat} className="et-br-row">
            <div className="et-br-dot" style={{background:m.hue}}/>
            <span className="et-br-name">{cat}</span>
            <div className="et-br-track"><div className="et-br-fill" style={{width:`${pct*100}%`,background:m.hue}}/></div>
            <span className="et-br-amt">{formatINR(val)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ editData, onClose, onSave }) {
  const init = editData || { type:"expense", category:"Food", title:"", amount:"", date:new Date().toISOString().slice(0,10), note:"" };
  const [form, setForm] = useState(init);
  const cats = form.type==="income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  function set(k,v){ setForm(f=>{ const n={...f,[k]:v}; if(k==="type") n.category=v==="income"?"Salary":"Food"; return n; }); }
  function submit(){
    if(!form.title.trim()||!form.amount||!form.date) return;
    onSave({...form, amount:parseFloat(form.amount), id:form.id||generateId()});
    onClose();
  }
  return (
    <div className="et-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="et-modal">
        <div className="et-modal-hdr">
          <h2 className="et-modal-title">{editData?"Edit Transaction":"New Transaction"}</h2>
          <button onClick={onClose} className="et-icon-btn" style={{width:32,height:32,borderRadius:9,background:"var(--clay-2)"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="et-type-toggle">
          {["income","expense"].map(t=>(
            <button key={t} className={`et-type-btn ${t} ${form.type===t?"active":""}`} onClick={()=>set("type",t)}>{t}</button>
          ))}
        </div>
        <div className="et-field-row">
          <div className="et-field">
            <label>{form.type==="income"?"Source":"Title"}</label>
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Salary" />
          </div>
          <div className="et-field">
            <label>Amount (INR)</label>
            <input type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="0" min="0" />
          </div>
        </div>
        <div className="et-field-row">
          <div className="et-field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} />
          </div>
          <div className="et-field">
            <label>Category</label>
            <select value={form.category} onChange={e=>set("category",e.target.value)}>
              {cats.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="et-field">
          <label>Note (optional)</label>
          <input value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Add a note..." />
        </div>
        <button className="et-btn et-btn-primary" style={{width:"100%",justifyContent:"center",padding:"11px"}} onClick={submit}>
          {editData?"Save Changes":"Add Transaction"}
        </button>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ onCancel, onConfirm }) {
  return (
    <div className="et-overlay" onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div className="et-modal" style={{maxWidth:340}}>
        <div style={{textAlign:"center",padding:"6px 0 20px"}}>
          <div style={{width:52,height:52,borderRadius:16,background:"var(--red-l)",border:"2px solid #F5CAC0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"3px 3px 0 rgba(217,95,67,0.12)"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#923F28" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
          <h3 style={{fontSize:16,fontWeight:700,color:"var(--ink)",marginBottom:7}}>Delete Transaction?</h3>
          <p style={{fontSize:12,color:"var(--ink-3)"}}>This action cannot be undone.</p>
        </div>
        <div style={{display:"flex",gap:9}}>
          <button className="et-btn et-btn-ghost" style={{flex:1,justifyContent:"center"}} onClick={onCancel}>Cancel</button>
          <button className="et-btn et-btn-danger" style={{flex:1,justifyContent:"center"}} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState(()=>{
    try { const s=localStorage.getItem("et_clay"); return s?JSON.parse(s):SEED_TRANSACTIONS; } catch { return SEED_TRANSACTIONS; }
  });
  const [filter,setFilter]     = useState("Monthly");
  const [showModal,setShowModal] = useState(false);
  const [editData,setEditData]   = useState(null);
  const [search,setSearch]       = useState("");
  const [delId,setDelId]         = useState(null);
  const [activeNav,setActiveNav] = useState(0);

  useEffect(()=>{ try { localStorage.setItem("et_clay",JSON.stringify(transactions)); } catch {} },[transactions]);

  const filtered = useMemo(()=>{
    const {start,end}=getDateRange(filter);
    return transactions.filter(t=>{
      const d=new Date(t.date);
      return d>=start&&d<=end&&(!search||t.title.toLowerCase().includes(search.toLowerCase())||t.category.toLowerCase().includes(search.toLowerCase()));
    }).sort((a,b)=>new Date(b.date)-new Date(a.date));
  },[transactions,filter,search]);

  const totalIncome  = useMemo(()=>filtered.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),[filtered]);
  const totalExpense = useMemo(()=>filtered.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),[filtered]);
  const balance = totalIncome - totalExpense;

  function saveTransaction(tx) {
    setTransactions(prev=>{ const e=prev.find(t=>t.id===tx.id); return e?prev.map(t=>t.id===tx.id?tx:t):[tx,...prev]; });
  }
  function deleteTransaction(id){ setTransactions(prev=>prev.filter(t=>t.id!==id)); setDelId(null); }

  function exportCSV() {
    const rows=[["Date","Type","Category","Title","Amount","Note"],...transactions.map(t=>[t.date,t.type,t.category,`"${t.title}"`,t.amount,`"${t.note||""}"`])];
    const blob=new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="transactions.csv"; a.click();
  }

  const navDefs = [
    { label:"Dashboard", d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { label:"Analytics",  d:"M18 20V10M12 20V4M6 20v-6" },
    { label:"Wallets",    d:"M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" },
    { label:"Settings",   d:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" },
  ];

  return (
    <>
      <div className="et-app">

        {/* Main */}
        <main className="et-main">
          {/* Top bar */}
          <div className="et-topbar">
            <div className="et-topbar-title">
              <h1>Finance Tracker</h1>
              <p>Personal expense management dashboard</p>
            </div>
            <div className="et-topbar-right">
              <div className="et-filter-row">
                {FILTER_OPTIONS.map(f=>(
                  <button key={f} className={`et-filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f}</button>
                ))}
              </div>
              <button className="et-btn et-btn-ghost" onClick={exportCSV}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export
              </button>
              <button className="et-btn et-btn-primary" onClick={()=>{ setEditData(null); setShowModal(true); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Transaction
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="et-stats">
            <div className="et-stat balance">
              <div className="et-stat-label">Net Balance</div>
              <div className="et-stat-val">{formatINR(Math.abs(balance))}</div>
              <div className="et-stat-sub">{balance>=0?"Healthy surplus · "+filter.toLowerCase():"Spending exceeds income"}</div>
            </div>
            <div className="et-stat income">
              <div className="et-stat-label">Total Income</div>
              <div className="et-stat-val">{formatINR(totalIncome)}</div>
              <div className="et-stat-sub">{filtered.filter(t=>t.type==="income").length} transactions</div>
            </div>
            <div className="et-stat expense">
              <div className="et-stat-label">Total Expenses</div>
              <div className="et-stat-val">{formatINR(totalExpense)}</div>
              <div className="et-stat-sub">{filtered.filter(t=>t.type==="expense").length} transactions</div>
            </div>
          </div>

          {/* Chart + Breakdown */}
          <div className="et-two">
            <div className="et-card">
              <p className="et-sec-label">Income vs Expenses</p>
              <BarChart transactions={transactions} filter={filter} />
            </div>
            <div className="et-card">
              <p className="et-sec-label">Spend by Category</p>
              <Breakdown transactions={filtered} />
            </div>
          </div>

          {/* Transactions */}
          <div className="et-card">
            <div className="et-txn-hdr">
              <div className="et-txn-hdr-left">
                <span className="et-txn-title">Transactions</span>
                <span className="et-badge">{filtered.length}</span>
              </div>
              <div className="et-search">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8077" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="et-search-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." />
              </div>
            </div>

            <div className="et-txn-scroll">
              {filtered.length===0 ? (
                <div className="et-empty">
                  <div className="et-empty-ico">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A8077" strokeWidth="1.5">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  </div>
                  <h3>No transactions found</h3>
                  <p>Try changing the filter or add a new entry</p>
                </div>
              ) : (
                <div className="et-txn-list">
                  {filtered.map(tx=>{
                    const m=CAT[tx.category]||CAT.Other;
                    const isInc=tx.type==="income";
                    return (
                      <div key={tx.id} className="et-txn">
                        <div className="et-txn-av" style={{background:m.light,color:m.hue,borderColor:m.hue+"35"}}>{m.abbr}</div>
                        <div className="et-txn-info">
                          <div className="et-txn-name">{tx.title}</div>
                          <div className="et-txn-meta">
                            <span className="et-txn-date">{formatDate(tx.date)}</span>
                            <span className="et-txn-pill" style={{background:m.light,color:m.hue}}>{tx.category}</span>
                            {tx.note&&<span className="et-txn-note">· {tx.note}</span>}
                          </div>
                        </div>
                        <span className={`et-txn-amt ${isInc?"inc":"exp"}`}>{isInc?"+":"−"}{formatINR(tx.amount)}</span>
                        <div className="et-txn-acts">
                          <button className="et-icon-btn" title="Edit" onClick={()=>{setEditData(tx);setShowModal(true);}}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="et-icon-btn del" title="Delete" onClick={()=>setDelId(tx.id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showModal && <Modal editData={editData} onClose={()=>{setShowModal(false);setEditData(null);}} onSave={saveTransaction}/>}
      {delId && <DeleteConfirm onCancel={()=>setDelId(null)} onConfirm={()=>deleteTransaction(delId)}/>}
    </>
  );
}