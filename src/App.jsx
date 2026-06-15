import { useState, useEffect, useMemo, useCallback } from "react";

function computeSSS(s) {
  const salary = Math.min(Math.max(s, 4250), 29750);
  const step = Math.round((salary - 4250) / 500);
  return Math.min(Math.round((180 + step * 22.5) * 100) / 100, 1350);
}
function computePhilHealth(s) {
  const msc = Math.min(Math.max(s, 10000), 100000);
  return Math.round(msc * 0.025 * 100) / 100;
}
function computeHDMF(s) {
  if (s <= 1500) return Math.round(s * 0.01 * 100) / 100;
  return Math.min(Math.round(s * 0.02 * 100) / 100, 200);
}
function computeWithholdingTax(s) {
  const sss = computeSSS(s), phic = computePhilHealth(s), hdmf = computeHDMF(s);
  const taxable = s - sss - phic - hdmf;
  let tax = 0;
  if (taxable <= 20833) tax = 0;
  else if (taxable <= 33333) tax = (taxable - 20833) * 0.20;
  else if (taxable <= 66667) tax = 2500 + (taxable - 33333) * 0.25;
  else if (taxable <= 166667) tax = 10833 + (taxable - 66667) * 0.30;
  else if (taxable <= 666667) tax = 40833 + (taxable - 166667) * 0.32;
  else tax = 200833 + (taxable - 666667) * 0.35;
  return { sss, phic, hdmf, tax: Math.round(tax * 100) / 100, taxable, net: Math.round((taxable - tax) * 100) / 100 };
}

const CATS = [
  { v:"food", l:"Food & Groceries", i:"🛒" }, { v:"dining", l:"Dining Out", i:"🍽️" },
  { v:"transport", l:"Transport / Fuel", i:"🚗" }, { v:"utilities", l:"Utilities", i:"💡" },
  { v:"rent", l:"Rent / Housing", i:"🏠" }, { v:"health", l:"Health & Wellness", i:"🏥" },
  { v:"fitness", l:"Gym & Fitness", i:"💪" }, { v:"travel", l:"Travel & Vacations", i:"✈️" },
  { v:"entertainment", l:"Entertainment", i:"🎬" }, { v:"shopping", l:"Shopping", i:"🛍️" },
  { v:"date", l:"Date Nights", i:"🌙" }, { v:"home", l:"Home Improvement", i:"🔧" },
  { v:"savings", l:"Savings / Investment", i:"🏦" }, { v:"load", l:"Mobile / Internet", i:"📱" },
  { v:"pets", l:"Pets", i:"🐾" }, { v:"other", l:"Other", i:"📌" },
];
const CAT_COLORS = {
  food:"#0D9E80", dining:"#D94F4F", transport:"#4F54D4", utilities:"#38BDF8",
  rent:"#818CF8", health:"#4ADE80", fitness:"#34D399", travel:"#60A5FA",
  entertainment:"#F472B6", shopping:"#FB923C", date:"#E879F9", home:"#A16207",
  savings:"#2DD4BF", load:"#94A3B8", pets:"#FDBA74", other:"#6B7280",
};
const INCOME_TYPES = [
  { v:"salary", l:"💼 Salary (Employment)" }, { v:"freelance", l:"💻 Freelance / Sideline" },
  { v:"business", l:"🏪 Business Income" }, { v:"rental", l:"🏘️ Rental Income" },
  { v:"investment", l:"📈 Stocks / Dividends" }, { v:"uitf", l:"📊 UITF / Mutual Fund" },
  { v:"crypto", l:"🪙 Crypto / Digital Assets" }, { v:"commission", l:"🤝 Commission / Bonus" },
  { v:"royalty", l:"🎨 Royalties / Licensing" }, { v:"pension", l:"🎖️ Pension / Retirement" },
  { v:"remittance", l:"💸 Remittance" }, { v:"other", l:"📌 Other" },
];
const PAY_METHODS = ["Cash", "GCash", "Maya", "Bank Transfer"];

const INIT_CARDS = [
  { id:"cc1", name:"BPI Amore", bank:"BPI", limit:50000, statementBalance:8420, outstandingBalance:8420, cutDay:28, dueDay:22, color:"#D94F4F" },
  { id:"cc2", name:"BDO Cashback", bank:"BDO", limit:80000, statementBalance:15300, outstandingBalance:15300, cutDay:5, dueDay:25, color:"#C97A0A" },
  { id:"cc3", name:"Metrobank Rewards", bank:"Metrobank", limit:60000, statementBalance:3900, outstandingBalance:3900, cutDay:15, dueDay:10, color:"#4F54D4" },
];
const INIT_INCOME_SOURCES = [
  { id:"s1", desc:"Freelance Project", expectedAmt:8000, type:"freelance", earner:"You", notes:"Monthly web project" },
  { id:"s2", desc:"Rental Income (Unit)", expectedAmt:12000, type:"rental", earner:"Joint", notes:"Unit 4B monthly rent" },
  { id:"s3", desc:"Stock Dividends", expectedAmt:3500, type:"investment", earner:"Partner", notes:"REIT quarterly dividends" },
];
const INIT_RECEIVED_INCOME = [
  { id:"i1", desc:"June Salary", amount:65000, date:"2025-06-01", type:"salary", earner:"You", via:"Bank Transfer" },
  { id:"i2", desc:"June Salary", amount:52000, date:"2025-06-01", type:"salary", earner:"Partner", via:"Bank Transfer" },
  { id:"i3", desc:"Freelance – Jun", amount:7800, date:"2025-06-05", type:"freelance", earner:"You", via:"GCash" },
  { id:"i4", desc:"Rental Jun", amount:12000, date:"2025-06-03", type:"rental", earner:"Joint", via:"Bank Transfer" },
];
const INIT_EXPENSES = [
  { id:"e1", desc:"S&R Membership", amount:3850, date:"2025-06-02", cat:"food", via:"BPI Amore", earner:"Joint" },
  { id:"e2", desc:"Meralco Bill", amount:3200, date:"2025-06-03", cat:"utilities", via:"GCash", earner:"Joint" },
  { id:"e3", desc:"Draft Restaurant", amount:2800, date:"2025-06-04", cat:"date", via:"BPI Amore", earner:"You" },
  { id:"e4", desc:"Grab Ride", amount:280, date:"2025-06-05", cat:"transport", via:"GCash", earner:"Partner" },
  { id:"e5", desc:"Netflix + Spotify", amount:899, date:"2025-06-01", cat:"entertainment", via:"BPI Amore", earner:"Joint" },
  { id:"e6", desc:"Zalora Haul", amount:3600, date:"2025-06-06", cat:"shopping", via:"BDO Cashback", earner:"Partner" },
  { id:"e7", desc:"Globe Postpaid ×2", amount:1998, date:"2025-06-01", cat:"load", via:"Bank Transfer", earner:"Joint" },
  { id:"e8", desc:"CrossFit Monthly", amount:2800, date:"2025-06-01", cat:"fitness", via:"Metrobank Rewards", earner:"You" },
  { id:"e9", desc:"Boracay Deposit", amount:5000, date:"2025-06-07", cat:"travel", via:"BDO Cashback", earner:"Joint" },
];
const INIT_BILLS = [
  { id:"b1", name:"Condo Rent", amount:22000, dueDay:5, paid:true, cat:"rent" },
  { id:"b2", name:"Meralco", amount:3200, dueDay:10, paid:false, cat:"utilities" },
  { id:"b3", name:"Globe / PLDT", amount:1998, dueDay:12, paid:true, cat:"load" },
  { id:"b4", name:"Condo Association Dues", amount:3500, dueDay:15, paid:false, cat:"home" },
  { id:"b5", name:"Maynilad Water", amount:580, dueDay:18, paid:false, cat:"utilities" },
  { id:"b6", name:"Pag-IBIG Housing Loan", amount:7800, dueDay:20, paid:false, cat:"rent" },
  { id:"b7", name:"Car Loan (both)", amount:18000, dueDay:7, paid:true, cat:"transport" },
];
const INIT_BUDGETS = {
  food:8000, dining:5000, transport:4000, travel:10000, entertainment:3000,
  shopping:6000, fitness:5000, date:4000, home:5000, load:2500,
};

const peso = (n, d=0) => isNaN(n)||n==null ? "₱0" : (n<0?"-":"")+"₱"+Math.abs(n).toLocaleString("en-PH",{minimumFractionDigits:d,maximumFractionDigits:d});
const pesoF = n => peso(n, 2);
const today = () => new Date().toISOString().split("T")[0];
const DAY = 9;
const catInfo = v => CATS.find(c=>c.v===v) || { v, l:v, i:"📌" };

function Ring({ pct, color, size=76, stroke=7 }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r;
  const [ap,setAp]=useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setAp(Math.min(pct,100)),120); return()=>clearTimeout(t); },[pct]);
  const dc=pct>100?"#D94F4F":color;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#DDD8CE" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dc} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-ap/100)}
        style={{transition:"stroke-dashoffset .9s cubic-bezier(.4,0,.2,1),stroke .3s"}}/>
    </svg>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#F5F0E8",borderRadius:16,padding:26,width:"100%",maxWidth:440,border:"1px solid #C8C2B6",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.18)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h3 style={{color:"#1C1917",fontSize:17,fontWeight:700,margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#78716C",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Inp({ label, ...p }) {
  return (
    <div style={{marginBottom:13}}>
      {label && <label style={{display:"block",color:"#78716C",fontSize:10,marginBottom:5,textTransform:"uppercase",letterSpacing:".07em"}}>{label}</label>}
      <input {...p} style={{width:"100%",background:"#EDE8DE",border:"1px solid #C8C2B6",borderRadius:8,padding:"9px 12px",color:"#1C1917",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",...p.style}}/>
    </div>
  );
}
function Sel({ label, children, ...p }) {
  return (
    <div style={{marginBottom:13}}>
      {label && <label style={{display:"block",color:"#78716C",fontSize:10,marginBottom:5,textTransform:"uppercase",letterSpacing:".07em"}}>{label}</label>}
      <select {...p} style={{width:"100%",background:"#EDE8DE",border:"1px solid #C8C2B6",borderRadius:8,padding:"9px 12px",color:"#1C1917",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",...p.style}}>{children}</select>
    </div>
  );
}
function Btn({ variant="primary", style:s, ...p }) {
  const V={
    primary:{background:"#0D9E80",color:"#fff",border:"none",fontWeight:700},
    ghost:{background:"transparent",color:"#57534E",border:"1px solid #C8C2B6"},
    amber:{background:"#C97A0A18",color:"#C97A0A",border:"1px solid #C97A0A40"},
    danger:{background:"#D94F4F18",color:"#D94F4F",border:"1px solid #D94F4F40"},
  };
  return <button {...p} style={{padding:"9px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"inherit",transition:"opacity .15s",...V[variant],...s}}/>;
}
function Tag({ color, children }) {
  return <span style={{fontSize:10,background:color+"22",color,borderRadius:5,padding:"2px 7px",fontWeight:700,letterSpacing:".04em",whiteSpace:"nowrap"}}>{children}</span>;
}
function MatchPreview({ amount, type, earner, incomeSources }) {
  if (!amount || +amount <= 0) return null;
  const rt = type || "salary", re = earner || "You";
  const preview = incomeSources.find(src => {
    const diff = Math.abs(+amount - src.expectedAmt) / (src.expectedAmt || 1);
    return src.type===rt && (src.earner===re||src.earner==="Joint"||re==="Joint") && diff<=0.10;
  });
  if (preview) return (
    <div style={{background:"#0D9E8012",border:"1px solid #0D9E8040",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#0D6B55",marginBottom:12}}>
      ✅ Matches <strong>{preview.desc}</strong> — {pesoF(preview.expectedAmt)} expected · {Math.round(Math.abs(+amount-preview.expectedAmt)/(preview.expectedAmt||1)*100)}% variance
    </div>
  );
  if (rt !== "salary") return (
    <div style={{background:"#C97A0A12",border:"1px solid #C97A0A30",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#7A4A00",marginBottom:12}}>
      ⚠️ No matching income source found. Add one in Income Analysis.
    </div>
  );
  return null;
}

export default function App() {
  const [tab, setTab] = useState("overview");
  const [incomeSources, setIncomeSources] = useState(INIT_INCOME_SOURCES);
  const [receivedIncome, setReceivedIncome] = useState(INIT_RECEIVED_INCOME);
  const [expenses, setExpenses] = useState(INIT_EXPENSES);
  const [bills, setBills] = useState(INIT_BILLS);
  const [cards, setCards] = useState(INIT_CARDS);
  const [budgets, setBudgets] = useState(INIT_BUDGETS);
  const [partnerNames, setPartnerNames] = useState({ you:"You", partner:"Partner" });
  const [salaries, setSalaries] = useState({ you:65000, partner:52000 });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const ff = (k,v) => setForm(x=>({...x,[k]:v}));
  const closeModal = () => { setModal(null); setForm({}); };

  const totalIncome   = useMemo(()=>receivedIncome.reduce((s,i)=>s+i.amount,0),[receivedIncome]);
  const totalExpenses = useMemo(()=>expenses.reduce((s,e)=>s+e.amount,0),[expenses]);
  const totalBills    = useMemo(()=>bills.reduce((s,b)=>s+b.amount,0),[bills]);
  const paidBills     = useMemo(()=>bills.filter(b=>b.paid).reduce((s,b)=>s+b.amount,0),[bills]);
  const unpaidBills   = totalBills - paidBills;
  const netCash       = totalIncome - totalExpenses - paidBills;

  const ccCharges = useMemo(()=>{
    const m={}; cards.forEach(c=>{m[c.id]=0;});
    expenses.forEach(e=>{ const c=cards.find(x=>x.name===e.via); if(c) m[c.id]=(m[c.id]||0)+e.amount; });
    return m;
  },[expenses,cards]);

  const availableCredit = useMemo(()=>cards.reduce((s,c)=>s+Math.max(0,c.limit-c.outstandingBalance-(ccCharges[c.id]||0)),0),[cards,ccCharges]);
  const totalHeadroom   = netCash + availableCredit;
  const spendByCat      = useMemo(()=>expenses.reduce((a,e)=>{a[e.cat]=(a[e.cat]||0)+e.amount;return a;},{}),[expenses]);
  const totalExpectedOther = useMemo(()=>incomeSources.reduce((s,x)=>s+x.expectedAmt,0),[incomeSources]);

  const matchSource = useCallback((rx)=>incomeSources.find(src=>{
    const diff=Math.abs(rx.amount-src.expectedAmt)/(src.expectedAmt||1);
    return src.type===rx.type&&(src.earner===rx.earner||src.earner==="Joint"||rx.earner==="Joint")&&diff<=0.10;
  })||null,[incomeSources]);

  const dedYou  = useMemo(()=>computeWithholdingTax(salaries.you),[salaries.you]);
  const dedPart = useMemo(()=>computeWithholdingTax(salaries.partner),[salaries.partner]);
  const combinedNet = dedYou.net + dedPart.net;
  const totalDed    = (dedYou.sss+dedYou.phic+dedYou.hdmf+dedYou.tax)+(dedPart.sss+dedPart.phic+dedPart.hdmf+dedPart.tax);

  const upcoming = useMemo(()=>{
    const b=bills.filter(x=>!x.paid&&x.dueDay>=DAY).map(x=>({key:x.id,name:x.name,amount:x.amount,dueDay:x.dueDay,type:"bill"}));
    const c=cards.map(x=>({key:x.id,name:x.name+" (min.)",amount:Math.max((x.statementBalance+(ccCharges[x.id]||0))*0.03,500),dueDay:x.dueDay,type:"cc"})).filter(x=>x.dueDay>=DAY);
    return [...b,...c].sort((a,z)=>a.dueDay-z.dueDay);
  },[bills,cards,ccCharges]);

  const addReceivedIncome = () => {
    if(!form.desc||!form.amount) return;
    setReceivedIncome(x=>[...x,{id:"i"+Date.now(),desc:form.desc,amount:+form.amount,date:form.date||today(),type:form.type||"salary",earner:form.earner||"You",via:form.via||"Bank Transfer"}]);
    closeModal();
  };
  const addIncomeSource = () => {
    if(!form.desc||!form.expectedAmt) return;
    setIncomeSources(x=>[...x,{id:"s"+Date.now(),desc:form.desc,expectedAmt:+form.expectedAmt,type:form.type||"freelance",earner:form.earner||"You",notes:form.notes||""}]);
    closeModal();
  };
  const addExpense = () => {
    if(!form.desc||!form.amount) return;
    const exp={id:"e"+Date.now(),desc:form.desc,amount:+form.amount,date:form.date||today(),cat:form.cat||"other",via:form.via||"Cash",earner:form.earner||"You"};
    setExpenses(x=>[...x,exp]);
    const card=cards.find(c=>c.name===form.via);
    if(card) setCards(cs=>cs.map(c=>c.id===card.id?{...c,outstandingBalance:c.outstandingBalance+exp.amount}:c));
    closeModal();
  };
  const delExpense = id => {
    const exp=expenses.find(e=>e.id===id);
    if(exp){const card=cards.find(c=>c.name===exp.via);if(card)setCards(cs=>cs.map(c=>c.id===card.id?{...c,outstandingBalance:Math.max(0,c.outstandingBalance-exp.amount)}:c));}
    setExpenses(x=>x.filter(e=>e.id!==id));
  };
  const addBill = () => {
    if(!form.name||!form.amount) return;
    setBills(x=>[...x,{id:"b"+Date.now(),name:form.name,amount:+form.amount,dueDay:+form.dueDay||15,paid:false,cat:form.cat||"utilities"}]);
    closeModal();
  };
  const addCard = () => {
    if(!form.name||!form.limit) return;
    const pal=["#0D9E80","#F472B6","#B45309","#E879F9","#4ADE80"];
    setCards(x=>[...x,{id:"cc"+Date.now(),name:form.name,bank:form.bank||"",limit:+form.limit,statementBalance:+form.stmtBal||0,outstandingBalance:+form.stmtBal||0,cutDay:+form.cutDay||25,dueDay:+form.dueDay||20,color:pal[x.length%pal.length]}]);
    closeModal();
  };
  const toggleBill = id => setBills(x=>x.map(b=>b.id===id?{...b,paid:!b.paid}:b));

  const TABS=[
    {id:"overview",icon:"◈",label:"Overview"},{id:"transactions",icon:"⇅",label:"Transactions"},
    {id:"bills",icon:"📋",label:"Bills"},{id:"credit",icon:"💳",label:"Credit Cards"},
    {id:"budget",icon:"⬡",label:"Budget"},{id:"analysis",icon:"📊",label:"Income Analysis"},
  ];

  const CSS=`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#F5F0E8;font-family:'Inter',sans-serif;color:#1C1917;min-height:100vh}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#F5F0E8}::-webkit-scrollbar-thumb{background:#C8C2B6;border-radius:3px}
    input::placeholder,textarea::placeholder{color:#A89E94}
    select option{background:#F5F0E8}
    input[type=number]::-webkit-inner-spin-button{opacity:.4}
    button:hover{opacity:.82}
  `;

  const earnerColor = e => e==="Joint"?"#38BDF8":e==="Partner"?"#F472B6":"#0D9E80";

  return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",minHeight:"100vh"}}>

        {/* ── SIDEBAR ── */}
        <aside style={{width:214,background:"#EAE4D8",borderRight:"1px solid #DDD8CE",display:"flex",flexDirection:"column",padding:"22px 0",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
          <div style={{padding:"0 18px 22px"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#0D9E80,#0066FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#fff",fontFamily:"Plus Jakarta Sans"}}>₱</div>
              <div>
                <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:15,color:"#1C1917",letterSpacing:"-0.02em"}}>PesoTrack</div>
                <div style={{fontSize:10,color:"#78716C"}}>DINK Edition · Jun 2025</div>
              </div>
            </div>
          </div>
          <nav style={{flex:1,padding:"0 10px"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 10px",borderRadius:8,border:"none",cursor:"pointer",background:tab===t.id?"#DDD8CE":"transparent",color:tab===t.id?"#1C1917":"#78716C",fontFamily:"Inter",fontSize:13,fontWeight:tab===t.id?600:400,marginBottom:2,textAlign:"left",transition:"all .15s",borderLeft:tab===t.id?"2px solid #0D9E80":"2px solid transparent"}}>
                <span style={{fontSize:15,width:20,textAlign:"center"}}>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
          <div style={{padding:"14px 18px",borderTop:"1px solid #DDD8CE"}}>
            <div style={{fontSize:10,color:"#78716C",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Household Net Cash</div>
            <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:24,letterSpacing:"-0.03em",color:netCash>=0?"#0D9E80":"#D94F4F"}}>{netCash<0&&"−"}{peso(netCash)}</div>
            <div style={{fontSize:10,color:"#78716C",marginTop:2}}>after expenses & bills</div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{flex:1,padding:26,overflowY:"auto",minWidth:0}}>

          {/* ════ OVERVIEW ════ */}
          {tab==="overview" && (
            <div>
              <div style={{marginBottom:24}}>
                <h1 style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:26,letterSpacing:"-0.02em",marginBottom:3}}>Good day, {partnerNames.you} & {partnerNames.partner} 💑</h1>
                <p style={{color:"#78716C",fontSize:13}}>Your household financial snapshot · June 2025</p>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:13,marginBottom:20}}>
                {[
                  {label:"Combined Income", val:peso(totalIncome), sub:`${receivedIncome.length} entries`, color:"#0D9E80"},
                  {label:"Total Expenses",  val:peso(totalExpenses), sub:`${expenses.length} transactions`, color:"#D94F4F"},
                  {label:"Bills Remaining", val:peso(unpaidBills), sub:`${bills.filter(b=>!b.paid).length} unpaid`, color:"#C97A0A"},
                  {label:"Net Take-Home",   val:peso(combinedNet), sub:"combined after deductions", color:"#4F54D4"},
                ].map(k=>(
                  <div key={k.label} style={{background:"#FDFAF5",borderRadius:13,padding:"17px 18px",border:"1px solid #DDD8CE"}}>
                    <div style={{fontSize:10,color:"#78716C",textTransform:"uppercase",letterSpacing:".06em",marginBottom:7}}>{k.label}</div>
                    <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:24,color:k.color,letterSpacing:"-0.02em",lineHeight:1}}>{k.val}</div>
                    <div style={{fontSize:11,color:"#78716C",marginTop:5}}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Financial Headroom */}
              <div style={{background:"linear-gradient(135deg,#EAE4D8 0%,#EBE5D9 50%,#E8E2D6 100%)",borderRadius:16,padding:"22px 26px",border:"1px solid #D0CABC",marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16,marginBottom:20}}>
                  <div>
                    <div style={{fontSize:11,color:"#7A736A",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>💡 FINANCIAL HEADROOM FOR UNPLANNED EXPENSES</div>
                    <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:34,color:totalHeadroom>0?"#0D9E80":"#D94F4F",letterSpacing:"-0.03em",lineHeight:1}}>{totalHeadroom<0&&"−"}{peso(totalHeadroom)}</div>
                    <div style={{fontSize:12,color:"#78716C",marginTop:6}}>Net cash + available credit — what you can safely spend right now</div>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {totalHeadroom>50000 && <Tag color="#0D9E80">✅ HEALTHY BUFFER</Tag>}
                    {totalHeadroom>0&&totalHeadroom<=50000 && <Tag color="#C97A0A">⚠️ WATCH SPENDING</Tag>}
                    {totalHeadroom<=0 && <Tag color="#D94F4F">🚨 OVER BUDGET</Tag>}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
                  <div style={{background:"rgba(255,255,255,.55)",borderRadius:12,padding:"14px 16px",border:"1px solid #D0CABC"}}>
                    <div style={{fontSize:10,color:"#7A736A",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>NET CASH POSITION</div>
                    <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:22,color:netCash>=0?"#0D9E80":"#D94F4F",letterSpacing:"-0.02em",marginBottom:10}}>{netCash<0&&"−"}{peso(netCash)}</div>
                    {[{label:"Combined Income",val:totalIncome,color:"#0D9E80",sign:"+"},{label:"Total Expenses",val:totalExpenses,color:"#D94F4F",sign:"−"},{label:"Bills Paid",val:paidBills,color:"#C97A0A",sign:"−"}].map(r=>(
                      <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #D8D2C8"}}>
                        <span style={{fontSize:11,color:"#78716C"}}>{r.label}</span>
                        <span style={{fontSize:11,fontWeight:600,color:r.color}}>{r.sign}{peso(r.val)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"rgba(255,255,255,.55)",borderRadius:12,padding:"14px 16px",border:"1px solid #D0CABC"}}>
                    <div style={{fontSize:10,color:"#7A736A",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>AVAILABLE CREDIT</div>
                    <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:22,color:"#4F54D4",letterSpacing:"-0.02em",marginBottom:10}}>{peso(availableCredit)}</div>
                    {cards.map(c=>{
                      const used=c.outstandingBalance+(ccCharges[c.id]||0);
                      const avail=Math.max(0,c.limit-used);
                      const pct=Math.round((used/c.limit)*100);
                      return (
                        <div key={c.id} style={{marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:11,color:"#78716C"}}>{c.name}</span>
                            <span style={{fontSize:11,fontWeight:600,color:c.color}}>{peso(avail)} free</span>
                          </div>
                          <div style={{height:4,background:"#DDD8CE",borderRadius:2,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:c.color,borderRadius:2,transition:"width .8s"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:11,color:"#78716C"}}>Headroom meter</span>
                    <span style={{fontSize:11,color:"#78716C"}}>{peso(netCash)} / {peso(totalIncome)} income</span>
                  </div>
                  <div style={{height:8,background:"#D8D2C8",borderRadius:4,overflow:"hidden",display:"flex"}}>
                    <div style={{height:"100%",width:`${Math.max(0,Math.min((paidBills/totalIncome)*100,100))}%`,background:"#C97A0A",transition:"width .8s"}}/>
                    <div style={{height:"100%",width:`${Math.max(0,Math.min((totalExpenses/totalIncome)*100,100))}%`,background:"#D94F4F",transition:"width .8s"}}/>
                    <div style={{height:"100%",flex:1,background:"#0D9E8022",minWidth:4}}/>
                  </div>
                  <div style={{display:"flex",gap:14,marginTop:6}}>
                    {[{c:"#C97A0A",l:"Bills Paid"},{c:"#D94F4F",l:"Expenses"},{c:"#0D9E80",l:"Free Cash"}].map(x=>(
                      <div key={x.l} style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:8,height:8,borderRadius:2,background:x.c}}/>
                        <span style={{fontSize:10,color:"#78716C"}}>{x.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <div style={{background:"#FDFAF5",borderRadius:13,padding:"18px 20px",border:"1px solid #DDD8CE"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#78716C",textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>CREDIT CARD TOTALS</div>
                  {cards.map(c=>{
                    const newChg=ccCharges[c.id]||0, total=c.statementBalance+newChg;
                    const util=Math.round((total/c.limit)*100);
                    const sc=util>80?"#D94F4F":util>50?"#C97A0A":c.color;
                    return (
                      <div key={c.id} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <div><span style={{fontSize:13,fontWeight:600}}>{c.name}</span><span style={{fontSize:10,color:"#78716C",marginLeft:6}}>Due Jun {c.dueDay}</span></div>
                          <div style={{textAlign:"right"}}><span style={{fontSize:14,fontWeight:700,color:sc,fontFamily:"Plus Jakarta Sans"}}>{peso(total)}</span>{newChg>0&&<span style={{fontSize:10,color:"#C97A0A",marginLeft:5}}>+{peso(newChg)}</span>}</div>
                        </div>
                        <div style={{height:5,background:"#DDD8CE",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(util,100)}%`,background:`linear-gradient(90deg,${c.color},${sc})`,borderRadius:3,transition:"width .8s"}}/>
                        </div>
                        <div style={{fontSize:10,color:"#78716C",marginTop:2}}>{util}% used · {peso(Math.max(0,c.limit-total))} available</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{background:"#FDFAF5",borderRadius:13,padding:"18px 20px",border:"1px solid #DDD8CE"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#78716C",textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>UPCOMING PAYMENTS</div>
                  {upcoming.length===0&&<div style={{color:"#78716C",fontSize:13}}>All clear! 🎉</div>}
                  {upcoming.slice(0,7).map(u=>(
                    <div key={u.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #DDD8CE55"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:14}}>{u.type==="cc"?"💳":"📋"}</span>
                        <div><div style={{fontSize:12,fontWeight:600}}>{u.name}</div><div style={{fontSize:10,color:"#78716C"}}>Due Jun {u.dueDay}</div></div>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:"#C97A0A"}}>{pesoF(u.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:"#FDFAF5",borderRadius:13,padding:"18px 20px",border:"1px solid #DDD8CE"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#78716C",textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>SPENDING BY CATEGORY</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 24px"}}>
                  {Object.entries(spendByCat).sort((a,z)=>z[1]-a[1]).map(([cat,amt])=>{
                    const ci=catInfo(cat);
                    return (
                      <div key={cat} style={{marginBottom:6}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:12,color:"#57534E"}}>{ci.i} {ci.l}</span>
                          <span style={{fontSize:12,fontWeight:600}}>{peso(amt)}</span>
                        </div>
                        <div style={{height:4,background:"#DDD8CE",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min((amt/totalExpenses)*100,100)}%`,background:CAT_COLORS[cat]||"#6B7280",borderRadius:2,transition:"width .8s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════ TRANSACTIONS ════ */}
          {tab==="transactions" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
                <div>
                  <h1 style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:24,letterSpacing:"-0.02em",marginBottom:3}}>Transactions</h1>
                  <p style={{color:"#78716C",fontSize:13}}>Record income received & expenses. Income is matched against your expected sources.</p>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn variant="ghost" onClick={()=>setModal("addReceivedIncome")}>+ Income Received</Btn>
                  <Btn onClick={()=>setModal("addExpense")}>+ Expense</Btn>
                </div>
              </div>

              <div style={{marginBottom:24}}>
                <div style={{fontSize:11,fontWeight:700,color:"#78716C",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>INCOME RECEIVED — <span style={{color:"#0D9E80"}}>{peso(totalIncome)}</span></div>
                {receivedIncome.length===0&&(
                  <div style={{background:"#FDFAF5",borderRadius:11,border:"1px dashed #DDD8CE",padding:"20px 18px",textAlign:"center",color:"#78716C",fontSize:13}}>No income recorded yet. Click <strong>+ Income Received</strong> to log what you received.</div>
                )}
                <div style={{display:"grid",gap:8}}>
                  {receivedIncome.map(i=>{
                    const matched=matchSource(i);
                    return (
                      <div key={i.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 18px",background:"#FDFAF5",borderRadius:11,border:"1px solid",borderColor:matched?"#0D9E8055":"#DDD8CE"}}>
                        <div style={{width:36,height:36,borderRadius:9,background:"#0D9E8022",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>💰</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:14}}>{i.desc}</div>
                          <div style={{fontSize:11,color:"#78716C"}}>{i.date} · {INCOME_TYPES.find(t=>t.v===i.type)?.l||i.type}</div>
                          {matched&&(
                            <div style={{fontSize:10,color:"#0D9E80",marginTop:3}}>
                              ✅ Matches <strong>{matched.desc}</strong> — {pesoF(matched.expectedAmt)} expected · {Math.round(Math.abs(i.amount-matched.expectedAmt)/(matched.expectedAmt||1)*100)}% variance
                            </div>
                          )}
                          {!matched&&i.type!=="salary"&&(
                            <div style={{fontSize:10,color:"#C97A0A",marginTop:3}}>⚠️ No matching income source found in Income Analysis</div>
                          )}
                        </div>
                        <Tag color={earnerColor(i.earner)}>{i.earner}</Tag>
                        <Tag color="#78716C">{i.via}</Tag>
                        <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:17,color:"#0D9E80",minWidth:88,textAlign:"right"}}>+{peso(i.amount)}</div>
                        <button onClick={()=>setReceivedIncome(x=>x.filter(e=>e.id!==i.id))} style={{background:"none",border:"none",color:"#78716C",cursor:"pointer",fontSize:15,padding:"0 2px",marginTop:2}}>🗑</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#78716C",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>EXPENSES — <span style={{color:"#D94F4F"}}>{peso(totalExpenses)}</span></div>
                <div style={{display:"grid",gap:8}}>
                  {expenses.map(e=>{
                    const ci=catInfo(e.cat), isCC=cards.some(c=>c.name===e.via);
                    return (
                      <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",background:"#FDFAF5",borderRadius:11,border:"1px solid #DDD8CE"}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:CAT_COLORS[e.cat]||"#6B7280",flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:14}}>{e.desc}</div>
                          <div style={{fontSize:11,color:"#78716C"}}>{e.date} · {ci.i} {ci.l}</div>
                        </div>
                        <Tag color={earnerColor(e.earner)}>{e.earner}</Tag>
                        <Tag color={isCC?"#4F54D4":"#78716C"}>{e.via}</Tag>
                        <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:17,color:"#D94F4F",minWidth:88,textAlign:"right"}}>−{peso(e.amount)}</div>
                        <button onClick={()=>delExpense(e.id)} style={{background:"none",border:"none",color:"#78716C",cursor:"pointer",fontSize:15,padding:"0 2px"}}>🗑</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════ BILLS ════ */}
          {tab==="bills" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <div>
                  <h1 style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:24,letterSpacing:"-0.02em",marginBottom:3}}>Monthly Bills</h1>
                  <p style={{color:"#78716C",fontSize:13}}><span style={{color:"#0D9E80"}}>{peso(paidBills)} paid</span> · <span style={{color:"#C97A0A"}}>{peso(unpaidBills)} remaining</span> · <span style={{color:"#1C1917"}}>{peso(totalBills)} total</span></p>
                </div>
                <Btn onClick={()=>setModal("addBill")}>+ Add Bill</Btn>
              </div>
              <div style={{background:"#FDFAF5",borderRadius:10,padding:"11px 18px",border:"1px solid #DDD8CE",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
                <div style={{flex:1,height:7,background:"#DDD8CE",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${totalBills>0?(paidBills/totalBills)*100:0}%`,background:"linear-gradient(90deg,#0D9E80,#0066FF)",borderRadius:4,transition:"width .7s"}}/>
                </div>
                <span style={{fontSize:12,color:"#78716C",flexShrink:0}}>{totalBills>0?Math.round((paidBills/totalBills)*100):0}% paid</span>
              </div>
              <div style={{display:"grid",gap:9}}>
                {[...bills].sort((a,b)=>a.dueDay-b.dueDay).map(b=>{
                  const overdue=!b.paid&&b.dueDay<DAY, soon=!b.paid&&b.dueDay>=DAY&&b.dueDay<=DAY+4;
                  const ci=catInfo(b.cat);
                  return (
                    <div key={b.id} style={{display:"flex",alignItems:"center",gap:13,padding:"14px 18px",background:"#FDFAF5",borderRadius:11,border:"1px solid",borderColor:b.paid?"#0D9E8033":overdue?"#D94F4F55":soon?"#C97A0A33":"#DDD8CE"}}>
                      <button onClick={()=>toggleBill(b.id)} style={{width:22,height:22,borderRadius:6,border:"2px solid",borderColor:b.paid?"#0D9E80":"#C8C2B6",background:b.paid?"#0D9E80":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>{b.paid?"✓":""}</button>
                      <span style={{fontSize:18,flexShrink:0}}>{ci.i}</span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:14,textDecoration:b.paid?"line-through":"none",color:b.paid?"#78716C":"#1C1917"}}>{b.name}</div>
                        <div style={{fontSize:11,color:"#78716C"}}>Due Jun {b.dueDay} · {ci.l}</div>
                      </div>
                      {overdue&&<Tag color="#D94F4F">OVERDUE</Tag>}
                      {soon&&<Tag color="#C97A0A">DUE SOON</Tag>}
                      <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:18,color:b.paid?"#78716C":"#C97A0A"}}>{peso(b.amount)}</div>
                      <button onClick={()=>setBills(x=>x.filter(bb=>bb.id!==b.id))} style={{background:"none",border:"none",color:"#78716C",cursor:"pointer",fontSize:15,padding:"0 2px"}}>🗑</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ CREDIT CARDS ════ */}
          {tab==="credit" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
                <div>
                  <h1 style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:24,letterSpacing:"-0.02em",marginBottom:3}}>Credit Cards</h1>
                  <p style={{color:"#78716C",fontSize:13}}>Statement balances, new charges & due dates.</p>
                </div>
                <Btn onClick={()=>setModal("addCard")}>+ Add Card</Btn>
              </div>
              <div style={{display:"grid",gap:18}}>
                {cards.map(c=>{
                  const newChg=ccCharges[c.id]||0, totalOwed=c.statementBalance+newChg;
                  const util=Math.round((totalOwed/c.limit)*100);
                  const sc=util>80?"#D94F4F":util>50?"#C97A0A":c.color;
                  const minPay=Math.max(totalOwed*0.03,500);
                  const cardExp=expenses.filter(e=>e.via===c.name);
                  return (
                    <div key={c.id} style={{background:"#FDFAF5",borderRadius:16,border:`1px solid ${c.color}44`,overflow:"hidden"}}>
                      <div style={{padding:"20px 24px",borderBottom:"1px solid #DDD8CE",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:22}}>💳</span>
                          <div>
                            <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:16}}>{c.name}</div>
                            <div style={{fontSize:11,color:"#78716C"}}>{c.bank} · Limit {peso(c.limit)}</div>
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:10,color:"#78716C",marginBottom:2}}>TOTAL OWED</div>
                          <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:28,color:sc,letterSpacing:"-0.02em"}}>{peso(totalOwed)}</div>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"14px 24px",gap:12,borderBottom:"1px solid #DDD8CE"}}>
                        {[{l:"Statement Bal.",v:peso(c.statementBalance),c:"#1C1917"},{l:"New Charges",v:peso(newChg),c:"#C97A0A"},{l:"Min. Pay (3%)",v:peso(minPay),c:"#D94F4F"},{l:"Cut-off Day",v:`Jun ${c.cutDay}`,c:"#4F54D4"}].map(s=>(
                          <div key={s.l}>
                            <div style={{fontSize:10,color:"#78716C",marginBottom:3,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
                            <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:700,fontSize:14,color:s.c}}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{padding:"14px 24px",borderBottom:"1px solid #DDD8CE"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <span style={{fontSize:11,color:"#78716C"}}>Utilization</span>
                          <span style={{fontSize:11,fontWeight:700,color:sc}}>{util}%</span>
                        </div>
                        <div style={{height:7,background:"#DDD8CE",borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(util,100)}%`,background:`linear-gradient(90deg,${c.color},${sc})`,borderRadius:4,transition:"width .8s"}}/>
                        </div>
                        {util>70&&<div style={{fontSize:11,color:"#C97A0A",marginTop:5}}>⚠️ High utilization may affect credit score</div>}
                      </div>
                      <div style={{padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                        <div style={{fontSize:12,color:"#78716C"}}>Payment due: <span style={{color:"#C97A0A",fontWeight:600}}>June {c.dueDay}</span></div>
                        <div style={{display:"flex",gap:8}}>
                          <button style={{background:"none",border:"1px solid #C8C2B6",color:"#57534E",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}
                            onClick={()=>{const a=prompt("Record payment amount (₱):"); if(a&&+a>0)setCards(cs=>cs.map(x=>x.id===c.id?{...x,statementBalance:Math.max(0,x.statementBalance-+a),outstandingBalance:Math.max(0,x.outstandingBalance-+a)}:x));}}>
                            Record Payment
                          </button>
                          <button onClick={()=>setCards(cs=>cs.filter(x=>x.id!==c.id))} style={{background:"#D94F4F11",border:"1px solid #D94F4F33",color:"#D94F4F",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Remove</button>
                        </div>
                      </div>
                      {cardExp.length>0&&(
                        <div style={{padding:"0 24px 16px"}}>
                          <div style={{fontSize:10,color:"#78716C",textTransform:"uppercase",letterSpacing:".06em",marginBottom:7}}>CHARGES THIS MONTH</div>
                          {cardExp.map(e=>(
                            <div key={e.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:"1px solid #DDD8CE30"}}>
                              <span style={{color:"#57534E"}}>{e.date} · {e.desc}</span>
                              <span style={{fontWeight:600,color:"#D94F4F"}}>−{pesoF(e.amount)}</span>
                            </div>
                          ))}
                          <div style={{display:"flex",justifyContent:"flex-end",paddingTop:8}}>
                            <span style={{fontSize:13,fontWeight:700,color:"#C97A0A"}}>Total: −{pesoF(cardExp.reduce((s,e)=>s+e.amount,0))}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ BUDGET ════ */}
          {tab==="budget" && (
            <div>
              <div style={{marginBottom:22}}>
                <h1 style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:24,letterSpacing:"-0.02em",marginBottom:3}}>Budget Tracker</h1>
                <p style={{color:"#78716C",fontSize:13}}>DINK household budgets. Rings fill as you spend.</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
                {Object.entries(budgets).map(([cat,limit])=>{
                  const spent=spendByCat[cat]||0, pct=(spent/limit)*100, isOver=spent>limit;
                  const ci=catInfo(cat), ringColor=isOver?"#D94F4F":CAT_COLORS[cat]||"#0D9E80";
                  return (
                    <div key={cat} style={{background:"#FDFAF5",borderRadius:14,padding:18,border:"1px solid #DDD8CE"}}>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <div style={{position:"relative",width:76,height:76,flexShrink:0}}>
                          <Ring pct={pct} color={ringColor}/>
                          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                            <span style={{fontSize:16}}>{ci.i}</span>
                            <span style={{fontSize:9,color:ringColor,fontWeight:700}}>{Math.round(pct)}%</span>
                          </div>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{ci.l}</div>
                          <div style={{fontSize:13,color:isOver?"#D94F4F":"#0D9E80",fontWeight:600}}>{peso(spent)} <span style={{color:"#78716C",fontWeight:400}}>/ {peso(limit)}</span></div>
                          <div style={{fontSize:10,color:isOver?"#D94F4F":"#78716C",marginTop:2}}>{isOver?`Over by ${peso(spent-limit)}`:`${peso(limit-spent)} remaining`}</div>
                          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:8}}>
                            <span style={{fontSize:10,color:"#78716C"}}>Limit:</span>
                            <input type="number" value={limit} onChange={e=>setBudgets(x=>({...x,[cat]:+e.target.value||0}))} style={{width:80,background:"#EDE8DE",border:"1px solid #C8C2B6",borderRadius:6,padding:"4px 8px",color:"#1C1917",fontSize:11,outline:"none",fontFamily:"inherit"}}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ INCOME ANALYSIS ════ */}
          {tab==="analysis" && (
            <div>
              <div style={{marginBottom:22}}>
                <h1 style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:24,letterSpacing:"-0.02em",marginBottom:3}}>Income Analysis</h1>
                <p style={{color:"#78716C",fontSize:13}}>SSS, PhilHealth, Pag-IBIG & BIR withholding — TRAIN Law 2024. Two-earner household view.</p>
              </div>

              <div style={{background:"#FDFAF5",borderRadius:13,padding:"16px 20px",border:"1px solid #DDD8CE",marginBottom:18,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#78716C",flexShrink:0}}>Customize earner names:</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#0D9E80"}}>Earner 1:</span>
                  <input value={partnerNames.you} onChange={e=>setPartnerNames(x=>({...x,you:e.target.value}))} style={{width:110,background:"#EDE8DE",border:"1px solid #C8C2B6",borderRadius:7,padding:"6px 10px",color:"#1C1917",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#F472B6"}}>Earner 2:</span>
                  <input value={partnerNames.partner} onChange={e=>setPartnerNames(x=>({...x,partner:e.target.value}))} style={{width:110,background:"#EDE8DE",border:"1px solid #C8C2B6",borderRadius:7,padding:"6px 10px",color:"#1C1917",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
                </div>
              </div>

              <div style={{background:"linear-gradient(135deg,#EDE7DB,#E4DED2)",borderRadius:13,padding:"20px 24px",border:"1px solid #C0BAB0",marginBottom:18,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:16}}>
                {[
                  {l:"Combined Gross",       v:pesoF(salaries.you+salaries.partner), c:"#1C1917"},
                  {l:"Total Deductions",     v:pesoF(totalDed),                      c:"#D94F4F"},
                  {l:"Combined Net Pay",     v:pesoF(combinedNet),                   c:"#0D9E80"},
                  {l:"Other (Expected)",     v:pesoF(totalExpectedOther),            c:"#C97A0A"},
                  {l:"Total Received",       v:pesoF(totalIncome),                   c:"#4F54D4"},
                ].map(s=>(
                  <div key={s.l}>
                    <div style={{fontSize:10,color:"#78716C",marginBottom:3,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
                    <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:17,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
                {[
                  {name:partnerNames.you, salary:salaries.you, ded:dedYou, color:"#0D9E80", key:"you"},
                  {name:partnerNames.partner, salary:salaries.partner, ded:dedPart, color:"#F472B6", key:"partner"},
                ].map(e=>(
                  <div key={e.key} style={{background:"#FDFAF5",borderRadius:14,padding:"20px 22px",border:`1px solid ${e.color}33`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                      <div>
                        <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:16,color:e.color}}>{e.name}</div>
                        <div style={{fontSize:11,color:"#78716C",marginTop:2}}>Monthly Basic Salary</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:800,fontSize:22,color:e.color}}>{pesoF(e.ded.net)}</div>
                        <div style={{fontSize:10,color:"#78716C"}}>net take-home</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                      <span style={{fontSize:13,color:"#78716C"}}>₱</span>
                      <input type="number" value={e.salary} onChange={ev=>setSalaries(x=>({...x,[e.key]:+ev.target.value||0}))} style={{flex:1,background:"#EDE8DE",border:"1px solid #C8C2B6",borderRadius:8,padding:"9px 12px",color:"#1C1917",fontSize:16,fontWeight:700,outline:"none",fontFamily:"Plus Jakarta Sans"}}/>
                    </div>
                    {[
                      {l:"Gross Salary",v:e.salary,c:"#1C1917",pct:100},
                      {l:"SSS",v:e.ded.sss,c:"#4F54D4",pct:(e.ded.sss/e.salary)*100},
                      {l:"PhilHealth",v:e.ded.phic,c:"#F472B6",pct:(e.ded.phic/e.salary)*100},
                      {l:"Pag-IBIG",v:e.ded.hdmf,c:"#B45309",pct:(e.ded.hdmf/e.salary)*100},
                      {l:"W/Tax (BIR)",v:e.ded.tax,c:"#D94F4F",pct:(e.ded.tax/e.salary)*100},
                    ].map((row,i)=>(
                      <div key={row.l} style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:11,color:i===0?"#1C1917":"#57534E"}}>{i>0?"−":" "} {row.l}</span>
                          <span style={{fontSize:11,fontWeight:600,color:row.c}}>{i===0?pesoF(row.v):"−"+pesoF(row.v)}</span>
                        </div>
                        <div style={{height:5,background:"#DDD8CE",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(row.pct,100)}%`,background:row.c,borderRadius:3,opacity:i===0?1:.8,transition:"width .9s"}}/>
                        </div>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid #C8C2B6",marginTop:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:"#1C1917"}}>= Net Take-Home</span>
                      <span style={{fontSize:14,fontWeight:800,color:e.color,fontFamily:"Plus Jakarta Sans"}}>{pesoF(e.ded.net)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Other expected income sources */}
              <div style={{background:"#FDFAF5",borderRadius:13,padding:"18px 22px",border:"1px solid #DDD8CE",marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#78716C",textTransform:"uppercase",letterSpacing:".07em"}}>OTHER EXPECTED INCOME SOURCES</div>
                    <div style={{fontSize:11,color:"#78716C",marginTop:3}}>Planned income this period. Enter actual amounts received in Transactions.</div>
                  </div>
                  <Btn variant="ghost" style={{fontSize:12,padding:"6px 14px"}} onClick={()=>setModal("addIncomeSource")}>+ Add Source</Btn>
                </div>
                {incomeSources.length===0&&(
                  <div style={{background:"#EDE8DE",borderRadius:10,padding:"16px 18px",textAlign:"center",color:"#78716C",fontSize:13,border:"1px dashed #C8C2B6"}}>
                    No other income sources yet. Click <strong>+ Add Source</strong> to start tracking.
                  </div>
                )}
                <div style={{display:"grid",gap:8}}>
                  {incomeSources.map(src=>{
                    const it=INCOME_TYPES.find(t=>t.v===src.type)||{l:src.type};
                    const rxMatch=receivedIncome.find(rx=>{
                      const diff=Math.abs(rx.amount-src.expectedAmt)/(src.expectedAmt||1);
                      return rx.type===src.type&&(rx.earner===src.earner||src.earner==="Joint"||rx.earner==="Joint")&&diff<=0.10;
                    });
                    return (
                      <div key={src.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:"#EDE8DE",borderRadius:10,border:"1px solid",borderColor:rxMatch?"#0D9E8055":"#DDD8CE"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:7}}>
                            {src.desc}
                            {rxMatch?<Tag color="#0D9E80">✅ RECEIVED</Tag>:<Tag color="#C97A0A">⏳ PENDING</Tag>}
                          </div>
                          <div style={{fontSize:11,color:"#78716C",marginTop:2}}>{it.l}</div>
                          {src.notes&&<div style={{fontSize:10,color:"#A8A29E",marginTop:2,fontStyle:"italic"}}>{src.notes}</div>}
                          {rxMatch&&<div style={{fontSize:10,color:"#0D9E80",marginTop:3}}>Received {pesoF(rxMatch.amount)} on {rxMatch.date} — {Math.round(Math.abs(rxMatch.amount-src.expectedAmt)/(src.expectedAmt||1)*100)}% variance</div>}
                        </div>
                        <Tag color={earnerColor(src.earner)}>{src.earner}</Tag>
                        <div style={{textAlign:"right",minWidth:90}}>
                          <div style={{fontFamily:"Plus Jakarta Sans",fontWeight:700,fontSize:15,color:rxMatch?"#0D9E80":"#C97A0A"}}>{pesoF(src.expectedAmt)}</div>
                          <div style={{fontSize:10,color:"#78716C"}}>expected</div>
                        </div>
                        <button onClick={()=>setIncomeSources(x=>x.filter(s=>s.id!==src.id))} style={{background:"none",border:"none",color:"#78716C",cursor:"pointer",fontSize:14,padding:"0 2px"}}>🗑</button>
                      </div>
                    );
                  })}
                </div>
                {incomeSources.length>0&&(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:"1px solid #DDD8CE",marginTop:8}}>
                    <span style={{fontSize:12,color:"#78716C"}}>
                      {incomeSources.filter(src=>receivedIncome.find(rx=>rx.type===src.type&&(rx.earner===src.earner||src.earner==="Joint")&&Math.abs(rx.amount-src.expectedAmt)/(src.expectedAmt||1)<=0.10)).length} of {incomeSources.length} sources received
                    </span>
                    <span style={{fontSize:13,fontWeight:700,color:"#0D9E80"}}>Total expected: {pesoF(totalExpectedOther)}</span>
                  </div>
                )}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[
                  {title:"SSS (2024)",color:"#4F54D4",icon:"🛡️",rows:[["Min. Salary Credit","₱4,250"],["Max. Salary Credit","₱29,750"],[partnerNames.you+" contribution",pesoF(dedYou.sss)],[partnerNames.partner+" contribution",pesoF(dedPart.sss)]],note:"Based on 2024 SSS table. Max employee share ₱1,350/mo."},
                  {title:"PhilHealth / PHIC",color:"#F472B6",icon:"🏥",rows:[["Premium Rate","5.00%"],["Employee Share","50%"],[partnerNames.you+" share",pesoF(dedYou.phic)],[partnerNames.partner+" share",pesoF(dedPart.phic)]],note:"Max monthly salary credit ₱100,000."},
                  {title:"Pag-IBIG / HDMF",color:"#B45309",icon:"🏠",rows:[["Rate","2% (salary >₱1,500)"],["Max Contribution","₱200/mo"],[partnerNames.you+" share",pesoF(dedYou.hdmf)],[partnerNames.partner+" share",pesoF(dedPart.hdmf)]],note:"Employer also contributes ₱200/mo."},
                  {title:"BIR Withholding Tax",color:"#D94F4F",icon:"📄",rows:[["Law","TRAIN (RA 10963)"],["Tax-free threshold","₱20,833/mo"],[partnerNames.you+" tax",pesoF(dedYou.tax)],[partnerNames.partner+" tax",pesoF(dedPart.tax)]],note:"Taxable = Gross − SSS − PHIC − HDMF. Annual filing still required."},
                ].map(card=>(
                  <div key={card.title} style={{background:"#FDFAF5",borderRadius:13,padding:"18px 20px",border:`1px solid ${card.color}33`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <span style={{fontSize:18}}>{card.icon}</span>
                      <span style={{fontWeight:700,fontSize:13,color:card.color}}>{card.title}</span>
                    </div>
                    {card.rows.map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #DDD8CE"}}>
                        <span style={{fontSize:11,color:"#78716C"}}>{l}</span>
                        <span style={{fontSize:11,fontWeight:600}}>{v}</span>
                      </div>
                    ))}
                    <div style={{fontSize:10,color:"#78716C",marginTop:8,lineHeight:1.6}}>{card.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ════ MODALS ════ */}
      {modal==="addReceivedIncome"&&(
        <Modal title="Record Income Received" onClose={closeModal}>
          <div style={{background:"#0D9E8012",border:"1px solid #0D9E8030",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#0D6B55",marginBottom:14}}>
            💡 Enter the actual amount you received. We'll check it against your expected sources.
          </div>
          <Inp label="Description" placeholder="e.g. June Salary, Freelance Payment" value={form.desc||""} onChange={e=>ff("desc",e.target.value)}/>
          <Inp label="Amount Received (₱)" type="number" placeholder="0.00" value={form.amount||""} onChange={e=>ff("amount",e.target.value)}/>
          <Inp label="Date Received" type="date" value={form.date||today()} onChange={e=>ff("date",e.target.value)}/>
          <Sel label="Income Type" value={form.type||"salary"} onChange={e=>ff("type",e.target.value)}>
            {INCOME_TYPES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
          </Sel>
          <Sel label="Earner" value={form.earner||"You"} onChange={e=>ff("earner",e.target.value)}>
            <option value="You">{partnerNames.you}</option>
            <option value="Partner">{partnerNames.partner}</option>
            <option value="Joint">Joint / Shared</option>
          </Sel>
          <Sel label="Received via" value={form.via||"Bank Transfer"} onChange={e=>ff("via",e.target.value)}>
            {PAY_METHODS.map(p=><option key={p} value={p}>{p}</option>)}
          </Sel>
          <MatchPreview amount={form.amount} type={form.type} earner={form.earner} incomeSources={incomeSources}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={addReceivedIncome}>Save Income</Btn>
          </div>
        </Modal>
      )}

      {modal==="addIncomeSource"&&(
        <Modal title="Add Expected Income Source" onClose={closeModal}>
          <div style={{background:"#4F54D412",border:"1px solid #4F54D430",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#2D3183",marginBottom:14}}>
            📋 This is a <strong>planned</strong> source. Enter the actual received amount in Transactions when it arrives.
          </div>
          <Inp label="Source Description" placeholder="e.g. Rental Income, REIT Dividends" value={form.desc||""} onChange={e=>ff("desc",e.target.value)}/>
          <Inp label="Expected Monthly Amount (₱)" type="number" placeholder="0.00" value={form.expectedAmt||""} onChange={e=>ff("expectedAmt",e.target.value)}/>
          <Sel label="Income Type" value={form.type||"freelance"} onChange={e=>ff("type",e.target.value)}>
            {INCOME_TYPES.filter(t=>t.v!=="salary").map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
          </Sel>
          <Sel label="Earner" value={form.earner||"You"} onChange={e=>ff("earner",e.target.value)}>
            <option value="You">{partnerNames.you}</option>
            <option value="Partner">{partnerNames.partner}</option>
            <option value="Joint">Joint / Shared</option>
          </Sel>
          <Inp label="Notes (optional)" placeholder="e.g. Unit 4B monthly rent" value={form.notes||""} onChange={e=>ff("notes",e.target.value)}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={addIncomeSource}>Add Source</Btn>
          </div>
        </Modal>
      )}

      {modal==="addExpense"&&(
        <Modal title="Record Expense" onClose={closeModal}>
          <Inp label="Description" placeholder="e.g. S&R Grocery" value={form.desc||""} onChange={e=>ff("desc",e.target.value)}/>
          <Inp label="Amount (₱)" type="number" placeholder="0.00" value={form.amount||""} onChange={e=>ff("amount",e.target.value)}/>
          <Inp label="Date" type="date" value={form.date||today()} onChange={e=>ff("date",e.target.value)}/>
          <Sel label="Category" value={form.cat||"other"} onChange={e=>ff("cat",e.target.value)}>
            {CATS.map(c=><option key={c.v} value={c.v}>{c.i} {c.l}</option>)}
          </Sel>
          <Sel label="Paid by" value={form.earner||"You"} onChange={e=>ff("earner",e.target.value)}>
            <option value="You">{partnerNames.you}</option>
            <option value="Partner">{partnerNames.partner}</option>
            <option value="Joint">Joint / Shared</option>
          </Sel>
          <Sel label="Payment Method" value={form.via||"Cash"} onChange={e=>ff("via",e.target.value)}>
            {PAY_METHODS.map(p=><option key={p} value={p}>{p}</option>)}
            <optgroup label="── Credit Cards ──">
              {cards.map(c=><option key={c.id} value={c.name}>💳 {c.name}</option>)}
            </optgroup>
          </Sel>
          {cards.find(c=>c.name===form.via)&&(
            <div style={{background:"#4F54D418",border:"1px solid #4F54D444",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#4F54D4",marginBottom:12}}>
              💳 This charge will be added to <strong>{form.via}</strong>'s outstanding balance.
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={addExpense}>Save Expense</Btn>
          </div>
        </Modal>
      )}

      {modal==="addBill"&&(
        <Modal title="Add Recurring Bill" onClose={closeModal}>
          <Inp label="Bill Name" placeholder="e.g. Meralco" value={form.name||""} onChange={e=>ff("name",e.target.value)}/>
          <Inp label="Monthly Amount (₱)" type="number" placeholder="0.00" value={form.amount||""} onChange={e=>ff("amount",e.target.value)}/>
          <Inp label="Due Day of Month" type="number" placeholder="15" min="1" max="31" value={form.dueDay||""} onChange={e=>ff("dueDay",e.target.value)}/>
          <Sel label="Category" value={form.cat||"utilities"} onChange={e=>ff("cat",e.target.value)}>
            {CATS.map(c=><option key={c.v} value={c.v}>{c.i} {c.l}</option>)}
          </Sel>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={addBill}>Add Bill</Btn>
          </div>
        </Modal>
      )}

      {modal==="addCard"&&(
        <Modal title="Add Credit Card" onClose={closeModal}>
          <Inp label="Card Name" placeholder="e.g. BPI Amore Visa" value={form.name||""} onChange={e=>ff("name",e.target.value)}/>
          <Inp label="Bank" placeholder="e.g. BPI, BDO, Security Bank" value={form.bank||""} onChange={e=>ff("bank",e.target.value)}/>
          <Inp label="Credit Limit (₱)" type="number" placeholder="50000" value={form.limit||""} onChange={e=>ff("limit",e.target.value)}/>
          <Inp label="Current Statement Balance (₱)" type="number" placeholder="0" value={form.stmtBal||""} onChange={e=>ff("stmtBal",e.target.value)}/>
          <Inp label="Statement Cut-off Day" type="number" placeholder="25" min="1" max="31" value={form.cutDay||""} onChange={e=>ff("cutDay",e.target.value)}/>
          <Inp label="Payment Due Day" type="number" placeholder="20" min="1" max="31" value={form.dueDay||""} onChange={e=>ff("dueDay",e.target.value)}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={addCard}>Add Card</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}
