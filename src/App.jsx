import { useState, useMemo, useCallback, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────── */
/* PALETTE — warm travel journal (4 colors + derived only)        */
/* Surface #FFFFFF · Card #EAD4AF · Ink #503D32 · Accent #8F6947     */
/* ─────────────────────────────────────────────────────────────── */
const P = {
  cream: "#FFFFFF",
  card: "#EAD4AF",
  ink: "#503D32",
  accent: "#8F6947",
};
const C = {
  ...P,
  whiteBeige: P.cream,
  peach: P.card,
  chalk: P.card,
  line: "rgba(234, 212, 175, 0.08)",
  lineFaint: "rgba(234, 212, 175, 0.08)",
  shadow: "0 2px 8px rgba(80, 61, 50, 0.06)",
  shadowHover: "0 4px 12px rgba(80, 61, 50, 0.08)",
  overlay: "rgba(255, 255, 255, 0.92)",
  modalPanel: P.cream,
  pageCanvas: P.cream,
  /* cream tint for Dashboard / Itinerary inner info cards only */
  infoCard: "#FFF3E4",
  textMain: P.ink,
  textAccent: P.accent,
  textMuted: "rgba(80, 61, 50, 0.85)",
  textHint: "rgba(80, 61, 50, 0.82)",
  dangerText: P.ink,
  dangerBg: P.card,
  primary: P.accent,
  onPrimary: P.cream,
  neutral: "rgba(80, 61, 50, 0.85)",
  creamSoft: P.card,
  creamDark: "rgba(234, 212, 175, 0.12)",
  white: P.cream,
  khaki: P.accent,
  khakiSoft: P.card,
  khakiLight: P.card,
  khakiDeep: P.accent,
  coffee: P.accent,
  coffeeSoft: "rgba(80, 61, 50, 0.85)",
  coffeeDeep: P.ink,
  blush: P.accent,
  blushSoft: P.card,
  blushDeep: P.accent,
  matcha: P.accent,
  matchaSoft: P.card,
  matchaDeep: P.accent,
  lavender: P.card,
  lavenderSoft: P.cream,
  lavenderDeep: P.accent,
};

/* ─────────────────────────────────────────────────────────────── */
/* STATIC DATA                                                     */
/* ─────────────────────────────────────────────────────────────── */
const TRAVELERS = [
  { id: "emily", name: "Emily", initials: "E", color: C.cream, textColor: C.ink },
  { id: "charlotte", name: "Charlotte", initials: "C", color: C.cream, textColor: C.ink },
  { id: "alice", name: "Alice", initials: "A", color: C.cream, textColor: C.ink },
];

const CITIES = [
  { id: "brisbane", label: "Brisbane", emoji: "🌴", bg: C.card, text: C.ink },
  { id: "sydney", label: "Sydney", emoji: "🌊", bg: C.card, text: C.ink },
  { id: "melbourne", label: "Melbourne", emoji: "☕", bg: C.card, text: C.ink },
];

const TRIP_DATE_RANGE = "2026/7/9 – 2026/7/25";
const TRIP_DAYS_COUNT = 17;
const TRIP_SEGMENTS = [
  { city: "🌴 Brisbane", dates: "7/9 – 7/15", daysLabel: "7 天" },
  { city: "🌊 Sydney", dates: "7/15 – 7/18", daysLabel: "4 天" },
  { city: "☕ Melbourne", dates: "7/18 – 7/25", daysLabel: "8 天" },
];

const CAT_OPTIONS = [
  { value: "accommodation", label: "🏨 Accommodation" },
  { value: "food", label: "🍽️ Food & Drinks" },
  { value: "activities", label: "🎡 Activities" },
  { value: "transport", label: "🚌 Transport" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "other", label: "📦 Other" },
];

const MAP_SPOTS = [
  { id: 1, city: "brisbane", name: "Story Bridge", address: "170 Main St, Kangaroo Point QLD", emoji: "🌉", q: "Story+Bridge+Kangaroo+Point+Brisbane" },
  { id: 2, city: "brisbane", name: "Lone Pine Koala Sanctuary", address: "708 Jesmond Rd, Fig Tree Pocket QLD", emoji: "🐨", q: "Lone+Pine+Koala+Sanctuary+Brisbane" },
  { id: 3, city: "brisbane", name: "South Bank Parklands", address: "Stanley St Plaza, South Brisbane QLD", emoji: "🏞️", q: "South+Bank+Parklands+Brisbane" },
  { id: 4, city: "brisbane", name: "Brisbane Botanic Gardens", address: "Mt Coot-tha Rd, Toowong QLD", emoji: "🌿", q: "Brisbane+Botanic+Gardens" },
  { id: 5, city: "sydney", name: "Sydney Opera House", address: "Bennelong Point, Sydney NSW 2000", emoji: "🎭", q: "Sydney+Opera+House" },
  { id: 6, city: "sydney", name: "Bondi Beach", address: "Bondi Beach NSW 2026", emoji: "🏖️", q: "Bondi+Beach+Sydney" },
  { id: 7, city: "sydney", name: "Sydney Harbour Bridge", address: "Sydney Harbour Bridge NSW 2060", emoji: "🌁", q: "Sydney+Harbour+Bridge" },
  { id: 8, city: "sydney", name: "The Rocks Markets", address: "The Rocks, Sydney NSW 2000", emoji: "🛍️", q: "The+Rocks+Markets+Sydney" },
  { id: 9, city: "melbourne", name: "Degraves Street", address: "Degraves St, Melbourne VIC 3000", emoji: "☕", q: "Degraves+Street+Melbourne" },
  { id: 10, city: "melbourne", name: "NGV International", address: "180 St Kilda Rd, Melbourne VIC 3006", emoji: "🖼️", q: "National+Gallery+Victoria+Melbourne" },
  { id: 11, city: "melbourne", name: "Queen Victoria Market", address: "Queen St & Victoria St, Melbourne VIC 3000", emoji: "🧺", q: "Queen+Victoria+Market+Melbourne" },
  { id: 12, city: "melbourne", name: "St Kilda Beach", address: "St Kilda VIC 3182", emoji: "🌊", q: "St+Kilda+Beach+Melbourne" },
];

const MONTH_MAP = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const dateSortKey = (s) => { const p = (s || "").split(" "); return p.length < 2 ? 9999 : (MONTH_MAP[p[0]] || 0) * 100 + (parseInt(p[1]) || 0); };
const timeSortKey = (t) => { const [h, m] = (t || "00:00").split(":").map(Number); return (h || 0) * 60 + (m || 0); };

/* ─────────────────────────────────────────────────────────────── */
/* DEFAULT DATA (aligned with TRIP_DATE_RANGE / TRIP_SEGMENTS)     */
/* ─────────────────────────────────────────────────────────────── */
const DEFAULT_ITINERARY = [
  { id: 1, city: "brisbane", day: 1, date: "Jul 9", time: "15:30", name: "Brisbane Marriott 入住", location: "515 Queen St, Brisbane City", price: "AUD $280/night", emoji: "🏨", tags: ["Accommodation"], notes: "" },
  { id: 2, city: "brisbane", day: 1, date: "Jul 9", time: "19:00", name: "South Bank 河邊晚餐", location: "Stanley Street Plaza, South Bank", price: "≈ AUD $40-60/pp", emoji: "🍽️", tags: ["Food"], notes: "" },
  { id: 3, city: "brisbane", day: 2, date: "Jul 10", time: "09:00", name: "Story Bridge Adventure Climb", location: "170 Main St, Kangaroo Point", price: "AUD $129/person", emoji: "🌉", tags: ["Adventure", "Must-do"], notes: "需提前預訂" },
  { id: 4, city: "brisbane", day: 2, date: "Jul 10", time: "13:30", name: "Lone Pine Koala Sanctuary 🐨", location: "708 Jesmond Rd, Fig Tree Pocket", price: "AUD $59/person", emoji: "🐨", tags: ["Wildlife", "Photo"], notes: "" },
  { id: 5, city: "sydney", day: 7, date: "Jul 15", time: "10:00", name: "Sydney Opera House 導覽", location: "Bennelong Point, Sydney", price: "AUD $43/person", emoji: "🎭", tags: ["Landmark", "Must-do"], notes: "" },
  { id: 6, city: "sydney", day: 7, date: "Jul 15", time: "14:00", name: "Bondi Beach 散步 & 冰淇淋", location: "Bondi Beach, NSW", price: "Free", emoji: "🏖️", tags: ["Beach", "Chill"], notes: "" },
  { id: 7, city: "sydney", day: 8, date: "Jul 16", time: "09:00", name: "Sydney Harbour Bridge Climb", location: "3 Cumberland St, The Rocks", price: "AUD $388/person", emoji: "🌁", tags: ["Adventure", "Scenic"], notes: "" },
  { id: 8, city: "melbourne", day: 10, date: "Jul 18", time: "09:00", name: "Degraves St 文青早餐 ☕", location: "Degraves St, Melbourne CBD", price: "≈ AUD $20/pp", emoji: "☕", tags: ["Cafe", "Aesthetic"], notes: "" },
  { id: 9, city: "melbourne", day: 10, date: "Jul 18", time: "11:00", name: "National Gallery of Victoria", location: "180 St Kilda Rd, Melbourne", price: "Free", emoji: "🖼️", tags: ["Art", "Culture"], notes: "" },
  { id: 10, city: "melbourne", day: 11, date: "Jul 19", time: "10:00", name: "Queen Victoria Market 🧺", location: "Queen St & Victoria St, Melbourne", price: "Free entry", emoji: "🧺", tags: ["Market", "Shopping"], notes: "" },
];

const DEFAULT_EXPENSES = [
  { id: 1, name: "Brisbane Marriott (3 nights)", category: "accommodation", city: "brisbane", date: "Jul 9", amount: 840, paidBy: "emily", splitAmong: ["emily", "charlotte", "alice"], emoji: "🏨", notes: "" },
  { id: 2, name: "Story Bridge Climb × 3", category: "activities", city: "brisbane", date: "Jul 10", amount: 387, paidBy: "charlotte", splitAmong: ["emily", "charlotte", "alice"], emoji: "🌉", notes: "" },
  { id: 3, name: "Lone Pine Sanctuary × 3", category: "activities", city: "brisbane", date: "Jul 10", amount: 177, paidBy: "alice", splitAmong: ["emily", "charlotte", "alice"], emoji: "🐨", notes: "" },
  { id: 4, name: "South Bank 晚餐", category: "food", city: "brisbane", date: "Jul 9", amount: 142, paidBy: "emily", splitAmong: ["emily", "charlotte", "alice"], emoji: "🍽️", notes: "" },
  { id: 5, name: "Brisbane → Sydney 機票", category: "transport", city: "brisbane", date: "Jul 15", amount: 594, paidBy: "charlotte", splitAmong: ["emily", "charlotte", "alice"], emoji: "✈️", notes: "" },
  { id: 6, name: "Opera House 導覽 × 3", category: "activities", city: "sydney", date: "Jul 15", amount: 129, paidBy: "emily", splitAmong: ["emily", "charlotte", "alice"], emoji: "🎭", notes: "" },
  { id: 7, name: "The Rocks 午餐", category: "food", city: "sydney", date: "Jul 16", amount: 98, paidBy: "alice", splitAmong: ["emily", "charlotte", "alice"], emoji: "🥗", notes: "" },
];

/* ─────────────────────────────────────────────────────────────── */
/* LOCALSTORAGE                                                    */
/* ─────────────────────────────────────────────────────────────── */
const LS_ITIN = "trip_koala_itinerary_v6";
const LS_EXP = "trip_koala_expenses_v6";
const lsRead = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const lsWrite = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota / disabled storage — best-effort */ } };

function usePersistedState(key, def) {
  const [state, setState] = useState(() => lsRead(key, def));
  useEffect(() => { lsWrite(key, state); }, [key, state]);
  return [state, setState];
}

/* Collision-safe id generator (Date.now() alone can collide on fast double-clicks). */
const newId = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);

/* ─────────────────────────────────────────────────────────────── */
/* SETTLEMENT CALCULATOR                                           */
/* ─────────────────────────────────────────────────────────────── */
function calcSettlement(expenses) {
  const bal = {};
  TRAVELERS.forEach((t) => { bal[t.id] = 0; });
  expenses.forEach((exp) => {
    const share = exp.amount / exp.splitAmong.length;
    exp.splitAmong.forEach((pid) => { bal[pid] -= share; });
    bal[exp.paidBy] += exp.amount;
  });
  const debtors = Object.entries(bal).filter(([, v]) => v < -0.01).map(([id, v]) => ({ id, amount: -v })).sort((a, b) => b.amount - a.amount);
  const creds = Object.entries(bal).filter(([, v]) => v > 0.01).map(([id, v]) => ({ id, amount: v })).sort((a, b) => b.amount - a.amount);
  const txns = [];
  const d = debtors.map((x) => ({ ...x }));
  const c = creds.map((x) => ({ ...x }));
  let di = 0, ci = 0;
  while (di < d.length && ci < c.length) {
    const amt = Math.min(d[di].amount, c[ci].amount);
    txns.push({ from: d[di].id, to: c[ci].id, amount: amt });
    d[di].amount -= amt; c[ci].amount -= amt;
    if (d[di].amount < 0.01) di++;
    if (c[ci].amount < 0.01) ci++;
  }
  return { balance: bal, txns };
}

/* ─────────────────────────────────────────────────────────────── */
/* HELPERS & ATOMS                                                 */
/* ─────────────────────────────────────────────────────────────── */
const getTraveler = (id) => TRAVELERS.find((t) => t.id === id);
const getCity = (id) => CITIES.find((c) => c.id === id);

function HoverCard({ children, onClick, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ ...style, cursor: onClick ? "pointer" : "default", transform: onClick && hovered ? "translateY(-2px)" : "none", boxShadow: onClick && hovered ? C.shadowHover : C.shadow, transition: "transform 0.18s ease, box-shadow 0.18s ease" }}>
      {children}
    </div>
  );
}

function Avatar({ id, size = 32 }) {
  const t = getTraveler(id);
  if (!t) return null;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: t.color, color: t.textColor, border: `1.5px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 800, flexShrink: 0, fontFamily: "'DM Serif Display', serif" }}>{t.initials}</div>;
}

function Tag({ label }) {
  return <span style={{ background: C.card, color: C.ink, borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700, border: `1px solid ${C.line}` }}>{label}</span>;
}

function PaperCard({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 20, padding: "18px 20px", boxShadow: C.shadow, border: `1px solid ${C.lineFaint}`, ...style }}>{children}</div>;
}

function ST({ children, style }) {
  return <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 12, ...style }}>{children}</div>;
}

const fSt = { width: "100%", padding: "9px 13px", borderRadius: 14, border: `1.5px solid ${C.line}`, background: C.whiteBeige, fontSize: 13, color: C.textMain, outline: "none", boxSizing: "border-box", fontFamily: "'Nunito', sans-serif" };
const taSt = { ...fSt, resize: "vertical", minHeight: 60, lineHeight: 1.5 };

function IRow({ label, children }) {
  return <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 10, fontWeight: 800, color: C.textHint, marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</label>{children}</div>;
}

function SavedToast({ show }) {
  return <div style={{ position: "fixed", bottom: 72, right: 16, background: C.accent, color: C.cream, borderRadius: 12, padding: "8px 16px", fontSize: 12, fontWeight: 700, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(8px)", transition: "all 0.3s", pointerEvents: "none", zIndex: 8000, boxShadow: C.shadow }}>已自動儲存</div>;
}

/* ─────────────────────────────────────────────────────────────── */
/* JOURNAL MODAL                                                   */
/* ─────────────────────────────────────────────────────────────── */
function JournalModal({ title, subtitle, onClose, onSave, onDelete, err, children }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  return (
    <div onClick={handleBackdrop} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: C.overlay, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div className="journal-modal" style={{ background: C.modalPanel, borderRadius: 28, padding: "28px 28px 24px", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: C.shadow, border: `1px solid ${C.lineFaint}`, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "28px 28px 0 0", background: C.card }} />
        <div style={{ marginBottom: 20, paddingTop: 4 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: C.ink, lineHeight: 1.2 }}>{title}</div>
              {subtitle && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={{ background: C.whiteBeige, border: `1px solid ${C.lineFaint}`, borderRadius: 12, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.textMuted, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif" }}>✕</button>
          </div>
          <div style={{ height: 1, background: C.line, marginTop: 14 }} />
        </div>
        {children}
        {err && <div style={{ fontSize: 12, color: C.dangerText, background: C.dangerBg, borderRadius: 10, padding: "8px 12px", margin: "10px 0" }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ background: "none", border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: C.textMuted, fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
          <button onClick={onSave} className="journal-btn-primary" style={{ background: C.accent, border: "none", borderRadius: 12, padding: "8px 22px", fontSize: 13, fontWeight: 800, cursor: "pointer", color: C.cream, fontFamily: "'Nunito', sans-serif" }}>Save</button>
        </div>
        {onDelete && !confirmDel && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px dashed ${C.line}`, textAlign: "center" }}>
            <button onClick={() => setConfirmDel(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.textHint, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3, fontFamily: "'Nunito', sans-serif" }}>刪除這筆記錄</button>
          </div>
        )}
        {onDelete && confirmDel && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px dashed ${C.line}`, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.dangerText, marginBottom: 10 }}>確定要刪除嗎？此操作無法復原。</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => setConfirmDel(false)} style={{ background: C.whiteBeige, border: `1px solid ${C.lineFaint}`, borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: C.textMuted, fontFamily: "'Nunito', sans-serif" }}>再想想</button>
              <button onClick={onDelete} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: C.ink, fontFamily: "'Nunito', sans-serif" }}>確定刪除</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* ITINERARY MODAL                                                 */
/* ─────────────────────────────────────────────────────────────── */
function ItinModal({ item, isNew, onSave, onDelete, onClose }) {
  const initTags = Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "";
  const [f, setF] = useState({ ...item, tags: initTags });
  const [err, setErr] = useState("");
  const u = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const city = getCity(f.city);
  const handleSave = () => {
    if (!f.name.trim()) { setErr("請輸入景點名稱 ✏️"); return; }
    setErr("");
    const finalTags = f.tags ? f.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    onSave({ ...f, day: parseInt(f.day) || 99, tags: finalTags });
  };
  const handleDelete = isNew ? null : () => onDelete(item.id);
  return (
    <JournalModal title={isNew ? "新增一個景點" : `${f.emoji || "📍"} 編輯景點`} subtitle={!isNew ? `${f.date || ""} · ${city?.label || f.city}` : "告訴我們你想去哪裡～"} onClose={onClose} onSave={handleSave} onDelete={handleDelete} err={err}>
      <IRow label="城市"><select value={f.city} onChange={u("city")} style={fSt}>{CITIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}</select></IRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <IRow label="天數"><input type="number" value={f.day} onChange={u("day")} placeholder="1" style={fSt} /></IRow>
        <IRow label="日期"><input type="text" value={f.date} onChange={u("date")} placeholder="Jul 9" style={fSt} /></IRow>
        <IRow label="時間"><input type="text" value={f.time} onChange={u("time")} placeholder="09:00" style={fSt} /></IRow>
      </div>
      <IRow label="景點名稱 *"><input type="text" value={f.name} onChange={u("name")} placeholder="e.g. Bondi Beach 散步" style={{ ...fSt, borderColor: err ? "rgba(80, 61, 50, 0.45)" : undefined }} /></IRow>
      <IRow label="地址"><input type="text" value={f.location} onChange={u("location")} placeholder="e.g. Bondi Beach, NSW" style={fSt} /></IRow>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 8 }}>
        <IRow label="門票費用"><input type="text" value={f.price} onChange={u("price")} placeholder="AUD $25/pp" style={fSt} /></IRow>
        <IRow label="Emoji"><input type="text" value={f.emoji} onChange={u("emoji")} placeholder="📍" style={fSt} /></IRow>
      </div>
      <IRow label="標籤（逗號分隔）"><input type="text" value={f.tags} onChange={u("tags")} placeholder="Beach, Chill, Photo" style={fSt} /></IRow>
      <IRow label="備註"><textarea value={f.notes} onChange={u("notes")} placeholder="行前小提醒、預訂連結、心情筆記…" style={taSt} /></IRow>
    </JournalModal>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* EXPENSE MODAL                                                   */
/* ─────────────────────────────────────────────────────────────── */
function ExpModal({ item, isNew, onSave, onDelete, onClose }) {
  const [f, setF] = useState({ ...item });
  const [err, setErr] = useState("");
  const u = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const toggleSplit = (id) => setF((p) => ({ ...p, splitAmong: p.splitAmong.includes(id) ? p.splitAmong.filter((x) => x !== id) : [...p.splitAmong, id] }));
  const payer = getTraveler(f.paidBy);
  const handleSave = () => {
    const amt = parseFloat(f.amount);
    if (!f.name.trim() || isNaN(amt) || amt <= 0) { setErr("請輸入名稱和有效金額 💰"); return; }
    if (f.splitAmong.length === 0) { setErr("請選擇至少一位分攤成員"); return; }
    setErr("");
    const catObj = CAT_OPTIONS.find((c) => c.value === f.category);
    onSave({ ...f, amount: amt, emoji: f.emoji || (catObj?.label.split(" ")[0]) || "💸" });
  };
  const handleDelete = isNew ? null : () => onDelete(item.id);
  return (
    <JournalModal title={isNew ? "記一筆支出" : "編輯支出"} subtitle={!isNew ? `${f.date || ""} · by ${payer?.name || f.paidBy}` : "今天花了什麼？"} onClose={onClose} onSave={handleSave} onDelete={handleDelete} err={err}>
      <IRow label="支出名稱 *"><input type="text" value={f.name} onChange={u("name")} placeholder="e.g. Bondi Beach 午餐" style={{ ...fSt, borderColor: err ? "rgba(80, 61, 50, 0.45)" : undefined }} /></IRow>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
        <IRow label="金額 (AUD) *"><input type="number" min="0" step="0.01" value={f.amount} onChange={u("amount")} placeholder="0.00" style={fSt} /></IRow>
        <IRow label="Emoji"><input type="text" value={f.emoji} onChange={u("emoji")} placeholder="💸" style={fSt} /></IRow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <IRow label="類別"><select value={f.category} onChange={u("category")} style={fSt}>{CAT_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></IRow>
        <IRow label="城市"><select value={f.city} onChange={u("city")} style={fSt}>{CITIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}</select></IRow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <IRow label="日期"><input type="text" value={f.date} onChange={u("date")} placeholder="Jul 13" style={fSt} /></IRow>
        <IRow label="付款人"><select value={f.paidBy} onChange={u("paidBy")} style={fSt}>{TRAVELERS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></IRow>
      </div>
      <IRow label="分攤成員">
        <div style={{ display: "flex", gap: 7 }}>
          {TRAVELERS.map((t) => { const on = f.splitAmong.includes(t.id); return <button key={t.id} onClick={() => toggleSplit(t.id)} type="button" style={{ flex: 1, padding: "8px 0", borderRadius: 12, border: `1.5px solid ${on ? C.accent : C.line}`, background: on ? C.accent : C.cream, color: on ? C.cream : C.textMuted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>{t.name}</button>; })}
        </div>
      </IRow>
      <IRow label="備註"><textarea value={f.notes} onChange={u("notes")} placeholder="補充說明…" style={taSt} /></IRow>
    </JournalModal>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* BLANK FORMS                                                     */
/* ─────────────────────────────────────────────────────────────── */
const blankItin = { city: "brisbane", day: "", date: "", time: "", name: "", location: "", price: "", emoji: "📍", tags: [], notes: "" };
const blankExp = { name: "", category: "food", city: "brisbane", date: "", amount: "", paidBy: "emily", splitAmong: ["emily", "charlotte", "alice"], emoji: "", notes: "" };

/* ═══════════════════════════════════════════════════════════════ */
/* DASHBOARD                                                       */
/* ═══════════════════════════════════════════════════════════════ */
function DashboardPage({ itinerary, expenses }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const catTotals = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
  const sorted = [...itinerary].sort((a, b) => dateSortKey(a.date) - dateSortKey(b.date) || timeSortKey(a.time) - timeSortKey(b.time));
  return (
    <div className="page-root dash-page" style={{ padding: "28px 28px 40px" }}>
      <div
        className="dash-hero"
        style={{
          background: C.infoCard,
          borderRadius: 18,
          padding: "14px 18px 14px 20px",
          marginBottom: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          border: `1px solid ${C.line}`,
          boxShadow: C.shadow,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: C.ink, letterSpacing: "0.02em", lineHeight: 1.35 }}>{TRIP_DATE_RANGE}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 5, fontWeight: 600 }}>Brisbane → Sydney → Melbourne</div>
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CITIES.map((c) => (
              <span key={c.id} style={{ background: C.card, color: C.ink, borderRadius: 8, padding: "2px 9px", fontSize: 10, fontWeight: 700, border: `1px solid ${C.lineFaint}`, letterSpacing: "0.02em" }}>{c.emoji} {c.label}</span>
            ))}
          </div>
        </div>
        <div
          style={{
            flexShrink: 0,
            textAlign: "center",
            background: C.infoCard,
            border: `1.5px solid ${C.line}`,
            borderRadius: 4,
            padding: "10px 14px 12px",
            boxShadow: "2px 3px 0 rgba(80, 61, 50, 0.06), 0 2px 8px rgba(80, 61, 50, 0.05)",
            transform: "rotate(-2.5deg)",
          }}
        >
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: C.ink, lineHeight: 1 }}>{TRIP_DAYS_COUNT}</div>
          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>days</div>
        </div>
      </div>
      <div className="dash-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { label: "已花費", value: `$${total.toFixed(0)}`, sub: "AUD · 累計", subc: C.textMuted },
          { label: "Trip Days", value: `${TRIP_DAYS_COUNT}`, sub: "days total", subc: C.textMuted },
          { label: "Spots", value: `${itinerary.length}`, sub: "planned", subc: C.textMuted },
        ].map((s) => (
          <div key={s.label} style={{ background: C.infoCard, borderRadius: 14, padding: "14px 16px", boxShadow: C.shadow, border: `1px solid ${C.lineFaint}` }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.ink, marginTop: 4, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.subc, fontWeight: 600, marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="dash-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
        <PaperCard style={{ boxShadow: C.shadow }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.ink, marginBottom: 12, letterSpacing: "0.06em" }}>城市行程</div>
          {TRIP_SEGMENTS.map((c) => (
            <div key={c.city} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{c.city}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{c.dates} · {c.daysLabel}</span>
              </div>
            </div>
          ))}
        </PaperCard>
        <PaperCard style={{ boxShadow: C.shadow }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.ink, marginBottom: 12, letterSpacing: "0.06em" }}>支出分類</div>
          {[
            { cat: "accommodation", label: "🏨 Accommodation", color: C.accent },
            { cat: "food", label: "🍽️ Food & Drinks", color: C.ink },
            { cat: "activities", label: "🎡 Activities", color: C.accent },
            { cat: "transport", label: "🚌 Transport", color: C.ink },
          ].map((row) => {
            const amt = catTotals[row.cat] || 0;
            const p = total > 0 ? ((amt / total) * 100).toFixed(0) : 0;
            return (
              <div key={row.cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <div style={{ width: 9, height: 9, borderRadius: 3, background: row.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, flex: 1 }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>${amt.toFixed(0)}</span>
                <span style={{ fontSize: 10, color: C.textMuted, minWidth: 26, textAlign: "right" }}>{p}%</span>
              </div>
            );
          })}
        </PaperCard>
      </div>
      <PaperCard style={{ boxShadow: C.shadow }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.ink, marginBottom: 12, letterSpacing: "0.06em" }}>即將到來的行程</div>
        {sorted.slice(0, 3).map((item) => {
          const city = getCity(item.city);
          return (
            <div key={item.id} className="dash-upcoming-row" style={{ display: "flex", gap: 12, padding: "11px 13px", background: C.infoCard, borderRadius: 13, marginBottom: 7, alignItems: "flex-start", border: `1px solid ${C.lineFaint}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, minWidth: 42, marginTop: 2 }}>{item.time}</div>
              <div style={{ fontSize: 20, lineHeight: 1, marginTop: 2 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMain }}>{item.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>📍 {item.location}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.ink, marginTop: 2 }}>{item.price}</div>
              </div>
              {city && <span style={{ background: C.card, color: C.ink, borderRadius: 10, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", border: `1px solid ${C.line}` }}>{city.emoji} {item.date}</span>}
            </div>
          );
        })}
      </PaperCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* ITINERARY                                                       */
/* ═══════════════════════════════════════════════════════════════ */
function ItineraryPage({ itinerary, setItinerary, showSaved }) {
  const [cf, setCf] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const filtered = cf === "all" ? itinerary : itinerary.filter((i) => i.city === cf);
  const sorted = [...filtered].sort((a, b) => dateSortKey(a.date) - dateSortKey(b.date) || timeSortKey(a.time) - timeSortKey(b.time));
  const groups = sorted.reduce((acc, item) => { const k = item.date || "TBD"; if (!acc[k]) acc[k] = []; acc[k].push(item); return acc; }, {});
  const groupKeys = Object.keys(groups);
  const handleSave = useCallback((f) => { if (f.id) setItinerary((prev) => prev.map((i) => (i.id === f.id ? f : i))); else setItinerary((prev) => [...prev, { ...f, id: newId() }]); showSaved(); setSelectedItem(null); }, [setItinerary, showSaved]);
  const handleDelete = useCallback((id) => { setItinerary((prev) => prev.filter((i) => i.id !== id)); showSaved(); setSelectedItem(null); }, [setItinerary, showSaved]);
  const openCard = useCallback((item) => { setSelectedItem({ ...item, tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "" }); }, []);
  const isModalOpen = selectedItem !== null;
  const isNew = selectedItem === "new";
  return (
    <div className="page-root itin-page" style={{ padding: "24px 24px 36px" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.ink }}>Itinerary 🗒️</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>點擊卡片編輯 · {itinerary.length} 個景點 🌿</div>
        </div>
        <button onClick={() => setSelectedItem("new")} className="journal-btn-primary" style={{ background: C.accent, color: C.cream, border: "none", borderRadius: 14, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: C.shadow, fontFamily: "'Nunito', sans-serif" }}>＋ 新增景點</button>
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 20 }}>
        {[{ id: "all", label: "All 🌏" }, ...CITIES.map((c) => ({ id: c.id, label: `${c.emoji} ${c.label}` }))].map((f) => (
          <button key={f.id} onClick={() => setCf(f.id)} className={cf === f.id ? "journal-btn-primary" : ""} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: cf === f.id ? C.accent : C.infoCard, color: cf === f.id ? C.cream : C.textMuted, border: `1.5px solid ${cf === f.id ? C.accent : C.line}`, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>{f.label}</button>
        ))}
      </div>
      {groupKeys.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted, fontSize: 14 }}>沒有符合的行程 🌿</div>}
      {groupKeys.map((dateKey) => {
        const items = groups[dateKey];
        const firstCity = getCity(items[0].city);
        return (
          <div key={dateKey} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: C.ink, whiteSpace: "nowrap" }}>{dateKey}</div>
              <div style={{ height: 1, flex: 1, background: C.line }} />
              <span style={{ background: C.card, color: C.ink, borderRadius: 8, padding: "2px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", border: `1px solid ${C.line}` }}>{firstCity?.emoji} {items.length} 個景點</span>
            </div>
            {items.map((item) => {
              const city = getCity(item.city);
              return (
                <HoverCard key={item.id} onClick={() => openCard(item)} style={{ display: "flex", gap: 12, padding: "14px 16px", background: C.infoCard, borderRadius: 16, marginBottom: 8, border: `1px solid ${C.lineFaint}`, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, minWidth: 42, paddingTop: 3 }}>{item.time}</div>
                  <div style={{ fontSize: 22, lineHeight: 1, paddingTop: 1 }}>{item.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.textMain }}>{item.name}</div>
                    {item.location && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>📍 {item.location}</div>}
                    {item.price && <div style={{ fontSize: 11, fontWeight: 700, color: C.ink, marginTop: 2 }}>{item.price}</div>}
                    {item.notes && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3, fontStyle: "italic" }}>💬 {item.notes}</div>}
                    <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap", alignItems: "center" }}>
                      {item.tags?.map((t) => <Tag key={t} label={t} />)}
                      {city && <span style={{ background: C.card, color: C.ink, borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700, border: `1px solid ${C.line}` }}>{city.emoji} {city.label}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: C.textHint, paddingTop: 2, flexShrink: 0 }}>›</div>
                </HoverCard>
              );
            })}
          </div>
        );
      })}
      {isModalOpen && <ItinModal item={isNew ? { ...blankItin } : selectedItem} isNew={isNew} onSave={handleSave} onDelete={handleDelete} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* EXPENSES                                                        */
/* ═══════════════════════════════════════════════════════════════ */
function ExpensesPage({ expenses, setExpenses, showSaved }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = total / 3;
  const paidTotals = useMemo(() => { const m = {}; TRAVELERS.forEach((t) => { m[t.id] = 0; }); expenses.forEach((e) => { m[e.paidBy] += e.amount; }); return m; }, [expenses]);
  const sorted = [...expenses].sort((a, b) => dateSortKey(b.date) - dateSortKey(a.date));
  const handleSave = useCallback((f) => { if (f.id) setExpenses((prev) => prev.map((e) => (e.id === f.id ? f : e))); else setExpenses((prev) => [...prev, { ...f, id: newId() }]); showSaved(); setSelectedItem(null); }, [setExpenses, showSaved]);
  const handleDelete = useCallback((id) => { setExpenses((prev) => prev.filter((e) => e.id !== id)); showSaved(); setSelectedItem(null); }, [setExpenses, showSaved]);
  const isModalOpen = selectedItem !== null;
  const isNew = selectedItem === "new";
  return (
    <div className="page-root exp-page" style={{ padding: "24px 24px 36px" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.ink }}>Expenses 💰</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>點擊卡片編輯 · {expenses.length} 筆支出 🧾</div>
        </div>
        <button onClick={() => setSelectedItem("new")} className="journal-btn-primary" style={{ background: C.accent, color: C.cream, border: "none", borderRadius: 14, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: C.shadow, fontFamily: "'Nunito', sans-serif" }}>＋ 新增支出</button>
      </div>
      <div className="exp-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 18 }}>
        {[
          { label: "已花費", value: `$${total.toFixed(0)}`, sub: "AUD · 3 travelers", bg: C.cream, text: C.ink },
          { label: "Per Person", value: `$${perPerson.toFixed(0)}`, sub: "average each", bg: C.card, text: C.ink },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: s.text, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: s.text, marginTop: 3 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.text, opacity: 0.75, marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <PaperCard style={{ marginBottom: 16 }}>
        <ST>🧾 所有支出</ST>
        {sorted.length === 0 && <div style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "16px 0" }}>還沒有支出紀錄！</div>}
        {sorted.map((exp) => {
          const cat = CAT_OPTIONS.find((c) => c.value === exp.category);
          const payer = getTraveler(exp.paidBy);
          const city = getCity(exp.city);
          return (
            <HoverCard key={exp.id} onClick={() => setSelectedItem({ ...exp })} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: C.cream, borderRadius: 14, marginBottom: 7, border: `1px solid ${C.lineFaint}`, flexWrap: "wrap" }}>
              <div style={{ fontSize: 21, width: 36, textAlign: "center", paddingTop: 2, flexShrink: 0 }}>{exp.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMain }}>{exp.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{cat?.label} · {exp.date} · {city?.emoji} {exp.city}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>分攤：{exp.splitAmong.map((id) => getTraveler(id)?.name).join("、")} · 每人 ${(exp.amount / exp.splitAmong.length).toFixed(1)}</div>
                {exp.notes && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, fontStyle: "italic" }}>💬 {exp.notes}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: C.ink }}>${exp.amount.toFixed(0)}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>by {payer?.name}</div>
              </div>
              <div style={{ fontSize: 13, color: C.textHint, paddingTop: 2, flexShrink: 0 }}>›</div>
            </HoverCard>
          );
        })}
      </PaperCard>
      <PaperCard>
        <ST>👛 誰付了多少？</ST>
        {TRAVELERS.map((t) => {
          const amt = paidTotals[t.id] || 0;
          const pct = total > 0 ? (amt / total) * 100 : 0;
          return (
            <div key={t.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar id={t.id} size={26} /><span style={{ fontSize: 13, fontWeight: 700, color: C.textMain }}>{t.name}</span></div>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: C.ink }}>${amt.toFixed(0)}</span>
              </div>
              <div style={{ background: C.cream, borderRadius: 10, height: 8, overflow: "hidden", border: `1px solid ${C.lineFaint}` }}>
                <div style={{ height: "100%", width: `${pct}%`, background: C.accent, borderRadius: 10, transition: "width 0.4s", opacity: 0.55 }} />
              </div>
            </div>
          );
        })}
      </PaperCard>
      {isModalOpen && <ExpModal item={isNew ? { ...blankExp } : selectedItem} isNew={isNew} onSave={handleSave} onDelete={handleDelete} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* SETTLEMENT                                                      */
/* ═══════════════════════════════════════════════════════════════ */
function SettlementPage({ expenses }) {
  const [paidSet, setPaidSet] = useState(new Set());
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = total / TRAVELERS.length;
  const { balance, txns } = calcSettlement(expenses);
  const paidByPerson = (id) => expenses.filter((e) => e.paidBy === id).reduce((s, e) => s + e.amount, 0);
  const togglePaid = (key) => setPaidSet((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  return (
    <div className="page-root settle-page" style={{ padding: "24px 24px 36px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.ink }}>Settlement 🤝</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>根據支出自動計算 · 修改後即時更新 ✨</div>
      </div>
      <PaperCard style={{ marginBottom: 16 }}>
        <ST>💡 均攤結算</ST>
        <div style={{ background: C.cream, borderRadius: 14, padding: 16, marginBottom: 16, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, marginBottom: 3 }}>每人應付（均攤）</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: C.ink }}>${perPerson.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>Total ${total.toFixed(2)} ÷ {TRAVELERS.length} people</div>
        </div>
        <div className="settle-balance-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
          {TRAVELERS.map((t) => {
            const bal = balance[t.id] || 0;
            const isPos = bal > 0.01;
            const isNeg = bal < -0.01;
            return (
              <div key={t.id} style={{ background: C.cream, borderRadius: 14, padding: 13, textAlign: "center", border: `1px solid ${C.lineFaint}` }}>
                <Avatar id={t.id} size={34} />
                <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginTop: 6 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>付了 ${paidByPerson(t.id).toFixed(0)}</div>
                <div style={{ fontSize: 11, fontWeight: 800, marginTop: 5, color: isPos || isNeg ? C.accent : C.textMuted }}>
                  {isPos ? `應收 $${bal.toFixed(2)}` : isNeg ? `應付 $${(-bal).toFixed(2)}` : "✓ 平衡"}
                </div>
              </div>
            );
          })}
        </div>
      </PaperCard>
      <PaperCard style={{ marginBottom: 16 }}>
        <ST>💸 最少轉帳方案（{txns.length} 筆）</ST>
        {txns.length === 0 && <div style={{ textAlign: "center", padding: "18px 0", color: C.textMuted, fontSize: 13 }}>大家都平衡了，不需要轉帳。</div>}
        {txns.map((txn, i) => {
          const key = `${txn.from}-${txn.to}-${i}`;
          const paid = paidSet.has(key);
          const from = getTraveler(txn.from);
          const to = getTraveler(txn.to);
          return (
            <div key={key} className="settle-txn-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: paid ? C.card : C.cream, borderRadius: 14, marginBottom: 9, border: `1.5px solid ${paid ? C.line : "transparent"}`, flexWrap: "wrap" }}>
              <Avatar id={txn.from} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMain }}>{from?.name} → {to?.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>轉給 {to?.name}</div>
              </div>
              <div style={{ background: C.cream, color: paid ? C.textMuted : C.accent, borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 700, textDecoration: paid ? "line-through" : "none", border: `1.5px solid ${paid ? C.line : C.accent}` }}>${txn.amount.toFixed(2)}</div>
              <Avatar id={txn.to} size={32} />
              <button onClick={() => togglePaid(key)} className={paid ? "journal-btn-primary" : ""} style={{ background: paid ? C.accent : C.cream, color: paid ? C.cream : C.textMuted, border: `1.5px solid ${paid ? C.accent : C.line}`, borderRadius: 9, padding: "5px 11px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Nunito', sans-serif" }}>{paid ? "✓ 已付" : "標記已付"}</button>
            </div>
          );
        })}
      </PaperCard>
      <PaperCard>
        <ST>📋 各筆支出明細</ST>
        {expenses.length === 0 && <div style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "12px 0" }}>尚無支出紀錄</div>}
        {[...expenses].sort((a, b) => dateSortKey(a.date) - dateSortKey(b.date)).map((exp) => {
          const share = (exp.amount / exp.splitAmong.length).toFixed(2);
          const payer = getTraveler(exp.paidBy);
          return (
            <div key={exp.id} style={{ padding: "9px 11px", background: C.cream, borderRadius: 11, marginBottom: 7, border: `1px solid ${C.lineFaint}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{exp.emoji} {exp.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>${exp.amount.toFixed(0)}</div>
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{payer?.name} 付款 · 分攤：{exp.splitAmong.map((id) => getTraveler(id)?.name).join("、")} · 每人 ${share}</div>
            </div>
          );
        })}
      </PaperCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* MAP                                                             */
/* ═══════════════════════════════════════════════════════════════ */
function MapPage() {
  const [cf, setCf] = useState("all");
  const filtered = cf === "all" ? MAP_SPOTS : MAP_SPOTS.filter((s) => s.city === cf);
  const grouped = CITIES.reduce((acc, c) => { acc[c.id] = filtered.filter((s) => s.city === c.id); return acc; }, {});
  const openMaps = (q) => window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  return (
    <div className="page-root map-page" style={{ padding: "24px 24px 36px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.ink }}>Map 🗺️</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>所有景點一目瞭然 · 點擊開啟 Google Maps 📍</div>
      </div>
      <div style={{ background: C.card, borderRadius: 22, height: 210, marginBottom: 20, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.lineFaint}`, boxShadow: C.shadow }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>Australia</div>
        {[
          { label: "Brisbane 🌴", top: "28%", left: "67%" },
          { label: "Sydney 🌊", top: "52%", left: "63%" },
          { label: "Melbourne ☕", top: "70%", left: "52%" },
        ].map((pin) => (
          <div key={pin.label} style={{ position: "absolute", top: pin.top, left: pin.left, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50% 50% 50% 4px", transform: "rotate(-45deg)", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: C.shadow, border: `1.5px solid ${C.accent}` }}>
              <span style={{ transform: "rotate(45deg)", fontSize: 11, color: C.accent }}>·</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 10, fontWeight: 800, color: C.ink, background: C.cream, padding: "2px 8px", borderRadius: 8, boxShadow: C.shadow, whiteSpace: "nowrap", border: `1px solid ${C.lineFaint}` }}>{pin.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 20 }}>
        {[{ id: "all", label: "All 🌏" }, ...CITIES.map((c) => ({ id: c.id, label: `${c.emoji} ${c.label}` }))].map((f) => (
          <button key={f.id} onClick={() => setCf(f.id)} className={cf === f.id ? "journal-btn-primary" : ""} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: cf === f.id ? C.accent : C.cream, color: cf === f.id ? C.cream : C.textMuted, border: `1.5px solid ${cf === f.id ? C.accent : C.line}`, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>{f.label}</button>
        ))}
      </div>
      {CITIES.filter((c) => grouped[c.id]?.length > 0).map((city) => (
        <div key={city.id} style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 11 }}>{city.emoji} {city.label}</div>
          <div className="map-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {grouped[city.id].map((spot) => (
              <div key={spot.id} style={{ background: C.cream, borderRadius: 16, padding: "13px 15px", boxShadow: C.shadow, border: `1px solid ${C.lineFaint}`, display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: C.card, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: `1px solid ${C.line}` }}>{spot.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.textMain }}>{spot.name}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, lineHeight: 1.4 }}>{spot.address}</div>
                  </div>
                </div>
                <button onClick={() => openMaps(spot.q)} className="journal-btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: C.accent, color: C.cream, border: "none", borderRadius: 10, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "'Nunito', sans-serif" }}>Open in Google Maps</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* MAIN APP                                                        */
/* ═══════════════════════════════════════════════════════════════ */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "itinerary", label: "Itinerary", icon: "🗒️" },
  { id: "expenses", label: "Expenses", icon: "💰" },
  { id: "settlement", label: "Settlement", icon: "🤝" },
  { id: "map", label: "Map", icon: "🗺️" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [itinerary, setItinerary] = usePersistedState(LS_ITIN, DEFAULT_ITINERARY);
  const [expenses, setExpenses] = usePersistedState(LS_EXP, DEFAULT_EXPENSES);
  const [savedVisible, setSavedVisible] = useState(false);
  const showSaved = useCallback(() => { setSavedVisible(true); setTimeout(() => setSavedVisible(false), 2200); }, []);
  const handleReset = () => {
    if (!window.confirm("確定要重設所有資料到預設值嗎？")) return;
    lsWrite(LS_ITIN, DEFAULT_ITINERARY);
    lsWrite(LS_EXP, DEFAULT_EXPENSES);
    setItinerary(DEFAULT_ITINERARY);
    setExpenses(DEFAULT_EXPENSES);
    showSaved();
  };
  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage itinerary={itinerary} expenses={expenses} />;
      case "itinerary": return <ItineraryPage itinerary={itinerary} setItinerary={setItinerary} showSaved={showSaved} />;
      case "expenses": return <ExpensesPage expenses={expenses} setExpenses={setExpenses} showSaved={showSaved} />;
      case "settlement": return <SettlementPage expenses={expenses} />;
      case "map": return <MapPage />;
      default: return null;
    }
  };
  return (
    <div className="app-shell" style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.whiteBeige, fontFamily: "'Nunito', sans-serif" }}>
      {/* Top Bar */}
      <div className="app-topbar" style={{ background: C.whiteBeige, borderBottom: `1px solid ${C.lineFaint}`, padding: "11px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 12 }}>
        <div className="app-topbar-title" style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 21, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Trip to Australia</div>
          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Australia · {TRIP_DATE_RANGE}</div>
        </div>
        <div className="app-topbar-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div className="app-topbar-avatars" style={{ display: "flex", gap: 4 }}>{TRAVELERS.map((t) => <Avatar key={t.id} id={t.id} size={26} />)}</div>
          <button onClick={handleReset} style={{ background: C.whiteBeige, border: `1px solid ${C.lineFaint}`, borderRadius: 10, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: C.textMuted, cursor: "pointer", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>↺ 重設</button>
        </div>
      </div>
      <div className="app-middle" style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Sidebar */}
        <aside className="app-sidebar" style={{ width: 196, background: C.whiteBeige, borderRight: `1px solid ${C.lineFaint}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ padding: "13px 12px 12px", borderBottom: `1px solid ${C.lineFaint}` }}>
            <div style={{ background: C.card, borderRadius: 13, padding: "11px 13px", border: `1px solid ${C.lineFaint}` }}>
              <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>Current Trip</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 5, lineHeight: 1.45, fontWeight: 600 }}>Brisbane → Sydney → Melbourne</div>
              <div style={{ fontSize: 10, color: C.ink, marginTop: 6, fontWeight: 700 }}>{TRIP_DATE_RANGE}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.whiteBeige, borderBottom: `1px solid ${C.lineFaint}` }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, flexShrink: 0, opacity: 0.45 }} />
            <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 700 }}>資料已儲存於此裝置</span>
          </div>
          <nav style={{ flex: 1, paddingTop: 10 }}>
            {NAV.map((item) => (
              <button key={item.id} onClick={() => setPage(item.id)} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "10px 18px", background: page === item.id ? "rgba(234, 212, 175, 0.35)" : "transparent", color: page === item.id ? C.accent : C.textMuted, fontWeight: page === item.id ? 800 : 500, fontSize: 13, border: "none", cursor: "pointer", textAlign: "left", boxShadow: page === item.id ? `inset 3px 0 0 ${C.accent}` : "none", fontFamily: "'Nunito', sans-serif" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "12px 12px 16px", borderTop: `1px solid ${C.lineFaint}` }}>
            <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 9 }}>Travelers 👯</div>
            {TRAVELERS.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <Avatar id={t.id} size={26} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textMain }}>{t.name}</span>
              </div>
            ))}
          </div>
        </aside>
        <main className="app-main" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: C.pageCanvas, minWidth: 0 }}>{renderPage()}</main>
      </div>
      {/* Mobile Bottom Nav */}
      <nav className="app-bottomnav" role="navigation" aria-label="Primary" style={{ background: C.whiteBeige, borderTop: `1px solid ${C.lineFaint}`, display: "flex", flexShrink: 0 }}>
        {NAV.map((item) => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "7px 0 5px", background: "none", border: "none", cursor: "pointer", color: page === item.id ? C.accent : C.textMuted, fontFamily: "'Nunito', sans-serif" }}>
            <span style={{ fontSize: 19 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: page === item.id ? 800 : 500 }}>{item.label}</span>
          </button>
        ))}
      </nav>
      <SavedToast show={savedVisible} />
    </div>
  );
}