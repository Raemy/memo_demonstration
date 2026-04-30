/* ===== PLATEFORME EXPÉRIMENTALE v4 ===== */

const INTERFACES = {
  A: { id:'A', label:'Interface non ergonomique',     shortLabel:'Non-ergo', url:'../interfaces/interface1v2/index.html', couleur:'#dc2626' },
  B: { id:'B', label:'Interface ergonomique standard', shortLabel:'Standard', url:'../interfaces/interface2/index.html',  couleur:'#d97706' },
  C: { id:'C', label:'Interface senior-friendly',     shortLabel:'Senior',   url:'../interfaces/interface3/index.html',  couleur:'#16a34a' }
};

const TACHES_DEF = {
  S1:{ id:'S1', interface:'A', type:'simple',   label:'Trouver le numéro d\'assurance maladie', enonce:'Trouvez votre numéro d\'assurance maladie sur cette interface.', reponse:'Le numéro se trouve dans le footer (bas de page).', validation:'auto' },
  C1:{ id:'C1', interface:'A', type:'complexe', label:'Retrouver le dernier remboursement', enonce:'Vous avez consulté plusieurs spécialistes ce mois-ci. Retrouvez les détails de votre dernier remboursement.', reponse:'8 avril 2026 - 17,50 € - médecin généraliste - taux 70% - base 25€', validation:'oral' },
  S2:{ id:'S2', interface:'B', type:'simple',   label:'Modifier l\'adresse email', enonce:'Modifiez votre adresse email.', reponse:'Bouton "Enregistrer la modification" → confirmation verte.', validation:'auto' },
  C2:{ id:'C2', interface:'B', type:'complexe', label:'Changer de médecin traitant', enonce:'Vous voulez changer de médecin traitant. Trouvez comment faire et précisez quel est le dernier bouton pour exécuter votre tâche.', reponse:'"Télécharger le formulaire Cerfa n°12485"', validation:'oral' },
  S3:{ id:'S3', interface:'C', type:'simple',   label:'Commander la CEAM', enonce:'Commandez une Carte Européenne d\'Assurance Maladie (CEAM).', reponse:'Bouton "Commander ma CEAM" → confirmation.', validation:'auto' },
  C3:{ id:'C3', interface:'C', type:'complexe', label:'Délais de traitement', enonce:'Vous avez changé de Caisse d\'Assurance Maladie. Trouvez la durée de traitement pour une démarche effectuée le 8 avril 2026.', reponse:'13/04/2026 (en ligne) ou 04/05/2026 (agence/courrier)', validation:'oral' }
};

const TACHES_ENTRAINEMENT = [
  { id:'E1', label:'Trouver le numéro d\'assurance maladie', enonce:'Trouvez votre numéro d\'assurance maladie. Il se trouve dans le bas de la page.', reponse:'Numéro visible dans le footer.', validation:'auto' },
  { id:'E2', label:'Se déconnecter', enonce:'Déconnectez-vous de l\'application.', reponse:'Bouton "Me déconnecter" / "Se déconnecter" en haut à droite.', validation:'auto' },
  { id:'E3', label:'Lire les CGU', enonce:'Lisez les Conditions Générales d\'Utilisation (CGU).', reponse:'Lien CGU dans le footer.', validation:'auto' }
];

const CARRE_LATIN = {
  G1: [{ iface:'A', simple:'S1', complexe:'C1' }, { iface:'B', simple:'S2', complexe:'C2' }, { iface:'C', simple:'S3', complexe:'C3' }],
  G2: [{ iface:'B', simple:'S2', complexe:'C2' }, { iface:'C', simple:'S3', complexe:'C3' }, { iface:'A', simple:'S1', complexe:'C1' }],
  G3: [{ iface:'C', simple:'S3', complexe:'C3' }, { iface:'A', simple:'S1', complexe:'C1' }, { iface:'B', simple:'S2', complexe:'C2' }]
};

function getGroupeFromCode(code) {
  const num = parseInt(code.replace(/[^0-9]/g,'')) || 1;
  return ['G1','G2','G3'][(num-1)%3];
}

function buildSequence(code) {
  const groupe = getGroupeFromCode(code);
  const plan = CARRE_LATIN[groupe];
  const sequence = [];
  plan.forEach(step => {
    sequence.push({ ...TACHES_DEF[step.simple],   ifaceObj: INTERFACES[step.iface] });
    sequence.push({ ...TACHES_DEF[step.complexe], ifaceObj: INTERFACES[step.iface] });
  });
  return { groupe, plan, sequence };
}

const SUS_QUESTIONS = [
  "Je voudrais utiliser cette application fréquemment.",
  "Cette application est inutilement complexe.",
  "Cette application est facile à utiliser.",
  "J'aurais besoin du soutien d'un technicien pour être capable d'utiliser cette application.",
  "Les différentes fonctionnalités de cette application sont bien intégrées.",
  "Il y a trop d'incohérences dans cette application.",
  "La plupart des gens apprendront à utiliser cette application très rapidement.",
  "Cette application est très lourde à utiliser.",
  "Je me suis senti·e très confiant·e en utilisant cette application.",
  "J'ai eu besoin d'apprendre beaucoup de choses avant de pouvoir utiliser cette application."
];

const NASA_DIMENSIONS = [
  { id:'mentale',     label:'Exigence Mentale',    desc:'Quelle quantité d\'activité mentale et intellectuelle était requise ? (mémorisation, décision, recherche…)' },
  { id:'physique',    label:'Exigence Physique',   desc:'Quelle quantité d\'activité physique était requise ? (cliquer, naviguer, défiler, appuyer…)' },
  { id:'temporelle',  label:'Exigence Temporelle', desc:'Quelle pression temporelle avez-vous ressentie ?' },
  { id:'performance', label:'Performance',         desc:'Dans quelle mesure pensez-vous avoir réussi ce qui vous était demandé ?' },
  { id:'effort',      label:'Effort',              desc:'À quel point avez-vous dû travailler pour atteindre ce niveau de performance ?' },
  { id:'frustration', label:'Frustration',         desc:'Dans quelle mesure vous êtes-vous senti·e irrité·e, stressé·e ou frustré·e ?' }
];

// ─── ÉTAT GLOBAL ───
const State = {
  participant: { code:'', groupe:'', typeGroupe:'', questionnaireMode:'' },
  sequence: [], plan: [], tacheIdx: 0,
  donnees: [],
  questionnaires: { preFiltrage:{}, aisanceNumerique:{}, sus:{}, nasaTlxInterface:{}, nasaTlxTache:{} },
  chrono: { startTime:null, elapsed:0, interval:null, running:false },
  clics: { count:0 }
};

// ─── CHRONO (précision ms) ───
const Chrono = {
  start() {
    if (State.chrono.running) return;
    State.chrono.startTime = performance.now() - State.chrono.elapsed;
    State.chrono.running = true;
    State.chrono.interval = setInterval(() => { State.chrono.elapsed = performance.now() - State.chrono.startTime; Chrono.render(); }, 50);
    const el = document.getElementById('chrono-display');
    if (el) { el.classList.add('running'); el.classList.remove('stopped'); }
  },
  stop() {
    if (!State.chrono.running) return;
    clearInterval(State.chrono.interval); State.chrono.running = false;
    const el = document.getElementById('chrono-display');
    if (el) { el.classList.remove('running'); el.classList.add('stopped'); }
    return Chrono.getMs();
  },
  reset() {
    clearInterval(State.chrono.interval);
    State.chrono.elapsed = 0; State.chrono.running = false; State.chrono.startTime = null;
    const el = document.getElementById('chrono-display');
    if (el) el.classList.remove('running','stopped');
    Chrono.render();
  },
  render() {
    const el = document.getElementById('chrono-display');
    if (!el) return;
    el.textContent = Chrono.format(State.chrono.elapsed);
  },
  format(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const cs = Math.floor((ms % 1000) / 10); // centièmes
    if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${cs.toString().padStart(2,'0')}`;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${cs.toString().padStart(2,'0')}`;
  },
  getMs() { return Math.round(State.chrono.elapsed); },
  // Pour l'export : retourner objet décomposé
  getDecompose() {
    const ms = Math.round(State.chrono.elapsed);
    const totalSec = Math.floor(ms / 1000);
    return {
      temps_ms: ms,
      temps_secondes: totalSec,
      temps_heures: Math.floor(totalSec / 3600),
      temps_minutes: Math.floor((totalSec % 3600) / 60),
      temps_sec_reste: totalSec % 60,
      temps_formate: Chrono.format(ms)
    };
  }
};

// ─── CLICS ───
// Les clics sont comptés DEPUIS la vue participant via le canal
const Clics = {
  reset() { State.clics.count = 0; Clics.render(); },
  setCount(n) { State.clics.count = n; Clics.render(); },
  render() { const el = document.getElementById('click-count'); if (el) el.textContent = State.clics.count; }
};

// ─── DATE FR ───
const DateFR = {
  dateCourte: () => new Date().toLocaleDateString('fr-FR'),
  heure: () => new Date().toLocaleTimeString('fr-FR'),
  duree: s => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.floor(s%60); return h>0?`${h}h${m.toString().padStart(2,'0')}m${sec.toString().padStart(2,'0')}s`:`${m}m${sec.toString().padStart(2,'0')}s`; }
};

// ─── DONNÉES ───
const Data = {
  enregistrerTache({ tache, tempsDecompose, clics, reussite, note }) {
    const iface = tache.ifaceObj || INTERFACES[tache.interface];
    State.donnees.push({
      code_participant: State.participant.code,
      date: DateFR.dateCourte(),
      heure: DateFR.heure(),
      groupe_participant: State.participant.typeGroupe,
      groupe_latin: State.participant.groupe,
      questionnaire_mode: State.participant.questionnaireMode,
      interface_id: iface.id,
      interface_label: iface.shortLabel,
      tache_id: tache.id,
      tache_label: tache.label,
      type_tache: tache.type,
      temps_formate: tempsDecompose.temps_formate,
      temps_ms: tempsDecompose.temps_ms,
      temps_secondes: tempsDecompose.temps_secondes,
      temps_heures: tempsDecompose.temps_heures,
      temps_minutes: tempsDecompose.temps_minutes,
      temps_sec_reste: tempsDecompose.temps_sec_reste,
      nombre_clics: clics,
      reussite: reussite ? 1 : 0,
      note: note || ''
    });
    Data.save();
  },
  save() {
    try {
      localStorage.setItem('exp_v4_donnees', JSON.stringify(State.donnees));
      localStorage.setItem('exp_v4_participant', JSON.stringify(State.participant));
      localStorage.setItem('exp_v4_questionnaires', JSON.stringify(State.questionnaires));
      localStorage.setItem('exp_v4_sequence', JSON.stringify({ sequence:State.sequence, plan:State.plan, tacheIdx:State.tacheIdx }));
    } catch(e) {}
  },
  load() {
    try {
      const d = localStorage.getItem('exp_v4_donnees'); if (d) State.donnees = JSON.parse(d);
      const p = localStorage.getItem('exp_v4_participant'); if (p) Object.assign(State.participant, JSON.parse(p));
      const q = localStorage.getItem('exp_v4_questionnaires'); if (q) Object.assign(State.questionnaires, JSON.parse(q));
      const s = localStorage.getItem('exp_v4_sequence');
      if (s) { const parsed = JSON.parse(s); State.sequence=parsed.sequence||[]; State.plan=parsed.plan||[]; State.tacheIdx=parsed.tacheIdx||0; }
    } catch(e) {}
  },
  // Reset UNIQUEMENT les questionnaires (pour nouveau participant)
  resetQuestionnaires() {
    State.questionnaires = { preFiltrage:{}, aisanceNumerique:{}, sus:{}, nasaTlxInterface:{}, nasaTlxTache:{} };
    localStorage.setItem('exp_v4_questionnaires', JSON.stringify(State.questionnaires));
  },
  resetSession() {
    State.tacheIdx = 0; State.sequence = []; State.plan = [];
    localStorage.removeItem('exp_v4_sequence');
    Data.resetQuestionnaires();
  },
  clear(code) {
    if (code) State.donnees = State.donnees.filter(d => d.code_participant !== code);
    else { State.donnees = []; Data.resetQuestionnaires(); }
    Data.save();
  },
  allCodes: () => [...new Set(State.donnees.map(d => d.code_participant))],

  exportTaches(filtres) {
    let rows = filtres ? State.donnees.filter(d => filtres.includes(d.code_participant)) : State.donnees;
    if (!rows.length) { alert('Aucune donnée.'); return; }
    const hdrs = ['code_participant','date','heure','groupe_participant','groupe_latin','questionnaire_mode',
                  'interface_id','interface_label','tache_id','tache_label','type_tache',
                  'temps_formate','temps_ms','temps_secondes','temps_heures','temps_minutes','temps_sec_reste',
                  'nombre_clics','reussite','note'];
    Data._dl('\uFEFF' + [hdrs.join(';'), ...rows.map(r => hdrs.map(h => Data._cell(r[h])).join(';'))].join('\r\n'),
      `taches_${DateFR.dateCourte().replace(/\//g,'-')}.csv`);
  },

  exportQuestionnaires(filtres) {
    const code = State.participant.code;
    const q = State.questionnaires;
    const rows = [];

    Object.keys(q.sus||{}).forEach(ifaceId => {
      const sus = q.sus[ifaceId]; const iface = INTERFACES[ifaceId]||{};
      const row = { code_participant:code, date:DateFR.dateCourte(), groupe_participant:State.participant.typeGroupe,
        groupe_latin:State.participant.groupe, instrument:'F-SUS', interface_id:ifaceId, interface_label:iface.shortLabel||'' };
      SUS_QUESTIONS.forEach((_,i) => row[`SUS_Q${i+1}`] = sus[`q${i+1}`]||'');
      row['SUS_global'] = sus.global||'';
      const score = Data._scoreSUS(sus); row['SUS_score_100'] = score!==null ? score.toFixed(1) : '';
      rows.push(row);
    });

    Object.keys(q.nasaTlxInterface||{}).forEach(ifaceId => {
      const nasa = q.nasaTlxInterface[ifaceId]; const iface = INTERFACES[ifaceId]||{};
      const row = { code_participant:code, date:DateFR.dateCourte(), groupe_participant:State.participant.typeGroupe,
        groupe_latin:State.participant.groupe, instrument:'NASA-TLX-Interface', interface_id:ifaceId, interface_label:iface.shortLabel||'' };
      NASA_DIMENSIONS.forEach(dim => row[`NASA_I_${dim.id}`] = nasa[dim.id]??'');
      row['NASA_I_score_moyen'] = Data._scoreNASA(nasa);
      rows.push(row);
    });

    Object.keys(q.nasaTlxTache||{}).forEach(tacheId => {
      const nasa = q.nasaTlxTache[tacheId]; const tDef = TACHES_DEF[tacheId]||{}; const iface = INTERFACES[tDef.interface]||{};
      const row = { code_participant:code, date:DateFR.dateCourte(), groupe_participant:State.participant.typeGroupe,
        groupe_latin:State.participant.groupe, instrument:'NASA-TLX-Tache',
        interface_id:iface.id||'', interface_label:iface.shortLabel||'', tache_id:tacheId, tache_label:tDef.label||'' };
      NASA_DIMENSIONS.forEach(dim => row[`NASA_T_${dim.id}`] = nasa[dim.id]??'');
      row['NASA_T_score_moyen'] = Data._scoreNASA(nasa);
      rows.push(row);
    });

    if (!rows.length) { alert('Aucun questionnaire à exporter.'); return; }
    const keys = [...new Set(rows.flatMap(r => Object.keys(r)))];
    Data._dl('\uFEFF' + [keys.join(';'), ...rows.map(r => keys.map(k => Data._cell(r[k]??'')).join(';'))].join('\r\n'),
      `questionnaires_${DateFR.dateCourte().replace(/\//g,'-')}.csv`);
  },

  _scoreSUS(sus) {
    let total=0, count=0;
    SUS_QUESTIONS.forEach((_,i)=>{ const v=parseInt(sus[`q${i+1}`]); if(isNaN(v))return; total+=(i%2===0)?(v-1):(5-v); count++; });
    return count===10 ? total*2.5 : null;
  },
  _scoreNASA(nasa) {
    const vals = NASA_DIMENSIONS.map(d=>parseFloat(nasa[d.id])).filter(v=>!isNaN(v));
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2) : '';
  },
  _cell: v => '"'+String(v??'').replace(/"/g,'""')+'"',
  _dl(content, name) {
    const a = Object.assign(document.createElement('a'), { href:URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8;'})), download:name });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
};

// ─── UTILITAIRES DOM ───
const Utils = {
  show: id => { const e=document.getElementById(id); if(e) e.classList.remove('hidden'); },
  hide: id => { const e=document.getElementById(id); if(e) e.classList.add('hidden'); },
  set:  (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; },
  html: (id,v) => { const e=document.getElementById(id); if(e) e.innerHTML=v; }
};

// ─── CANAL DE COMMUNICATION (BroadcastChannel + localStorage fallback) ───
const Canal = {
  bc: null,
  handlers: [],
  init() {
    if (typeof BroadcastChannel !== 'undefined') {
      Canal.bc = new BroadcastChannel('exp_v4_canal');
      Canal.bc.onmessage = e => Canal._dispatch(e.data);
    }
    // Polling localStorage pour cross-window / cross-browser
    let lastTs = 0;
    setInterval(() => {
      try {
        const raw = localStorage.getItem('exp_v4_canal_msg');
        if (!raw) return;
        const msg = JSON.parse(raw);
        if (msg._ts > lastTs) { lastTs = msg._ts; Canal._dispatch(msg); }
      } catch(e) {}
    }, 200);
  },
  envoyer(msg) {
    const full = { ...msg, _ts: Date.now() };
    if (Canal.bc) Canal.bc.postMessage(full);
    try { localStorage.setItem('exp_v4_canal_msg', JSON.stringify(full)); } catch(e) {}
  },
  ecouter(cb) { Canal.handlers.push(cb); },
  _dispatch(msg) { Canal.handlers.forEach(h => h(msg)); }
};

// ─── EXPORTS ───
window.INTERFACES=INTERFACES; window.TACHES_DEF=TACHES_DEF; window.TACHES_ENTRAINEMENT=TACHES_ENTRAINEMENT;
window.CARRE_LATIN=CARRE_LATIN; window.SUS_QUESTIONS=SUS_QUESTIONS; window.NASA_DIMENSIONS=NASA_DIMENSIONS;
window.State=State; window.Chrono=Chrono; window.Clics=Clics; window.Data=Data;
window.Utils=Utils; window.DateFR=DateFR; window.Canal=Canal;
window.buildSequence=buildSequence; window.getGroupeFromCode=getGroupeFromCode;
