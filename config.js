/* ==========================================================================
   ★ CONFIGURATION — C’EST ICI QUE VOUS CHANGEZ TOUT ★
   ========================================================================== */
const CONFIG = {
  // ① BASE DE DONNÉES (Supabase) — collez vos 2 valeurs (voir supabase.sql + explications)
  //    Tant que ces valeurs ne sont pas remplies, l’app tourne en MODE DÉMO (PIN admin : 1234,
  //    données stockées dans votre navigateur seulement).
  SUPABASE_URL: 'VOTRE_URL_SUPABASE',
  SUPABASE_ANON_KEY: 'VOTRE_CLE_ANON_SUPABASE',

  // ② ADRESSE DU SITE une fois en ligne, ex: 'https://mariage-nissho.netlify.app/' (sert aux liens uniques). Vide = automatique.
  SITE_URL: '',

  // ③ MUSIQUE — collez ici le lien de VOTRE fichier MP3 (hébergé sur votre site ou ailleurs).
  //    Lien par défaut = morceau de démonstration libre de droits.
  MUSIC_URL: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  MUSIC_TITLE: 'A Thousand Years - Christina Perri (Violin Cover - Joel Grainger)',

  // ④ DATE DU MARIAGE (format AAAA-MM-JJTHH:MM:SS) + texte affiché
  WEDDING_DATE: '2027-01-16T10:00:00',
  WEDDING_DATE_LABEL: 'Samedi 16 janvier 2027',

  // ⑤ PROGRAMME — horaires, noms des lieux et ADRESSES (le bouton ouvre Google Maps avec l’adresse)
  EVENTS: [
    { time: '10:00', title: 'Cérémonie civile',     place: 'Nom de la mairie',   address: 'Adresse de la mairie, Ville' },
    { time: '13:00', title: 'Bénédiction nuptiale', place: 'Nom de l’église',    address: 'Adresse de l’église, Ville' },
    { time: '18:00', title: 'Réception & soirée',   place: 'Nom de la salle',    address: 'Adresse de la salle, Ville' }
  ],

  // ⑥ PHOTOS DU COUPLE — remplacez ces liens (ou chemins de fichiers, ex: 'photos/1.jpg').
  //    Classes : '' normal, 'tall' = haute, 'wide' = large.
  PHOTOS: [
    { src: 'https://picsum.photos/seed/nissho1/700/900', cls: 'tall' },
    { src: 'https://picsum.photos/seed/nissho2/700/500', cls: '' },
    { src: 'https://picsum.photos/seed/nissho3/700/500', cls: '' },
    { src: 'https://picsum.photos/seed/nissho4/900/500', cls: 'wide' },
    { src: 'https://picsum.photos/seed/nissho5/700/900', cls: 'tall' },
    { src: 'https://picsum.photos/seed/nissho6/700/500', cls: '' }
  ]
};
/* ======================= FIN DE LA CONFIGURATION ======================= */

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hasSB = !CONFIG.SUPABASE_URL.includes('VOTRE');
const sb = hasSB ? supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY) : null;
const siteUrl = () => CONFIG.SITE_URL || (location.origin + location.pathname.replace(/[^/]*$/, ''));
const link = t => `${siteUrl()}?invite=${t}`;

/* ---------- Accès aux données (Supabase ou mode démo) ---------- */
async function rpc(name, a = {}) {
  if (sb) { const { data, error } = await sb.rpc(name, a); if (error) throw error; return data; }
  const g = JSON.parse(localStorage.getItem('fp_demo') || '[]'), save = () => localStorage.setItem('fp_demo', JSON.stringify(g));
  const f = t => g.find(x => x.token === t);
  if (name.startsWith('admin_') && a.p_pin !== '1234') throw new Error('PIN');
  switch (name) {
    case 'get_invite': { const x = f(a.p_token); if (!x) return null; x.opened_at ||= new Date().toISOString(); save(); return { name: x.name, seats: x.seats, status: x.status, message: x.message }; }
    case 'rsvp': { const x = f(a.p_token); if (x) { x.status = a.p_status; x.message = a.p_message; save(); } return null; }
    case 'confirmed_count': return g.filter(x => x.status === 'present').reduce((s, x) => s + x.seats, 0);
    case 'admin_list': return g;
    case 'admin_add': g.unshift({ token: a.p_token, name: a.p_name, seats: a.p_seats, phone: a.p_phone, status: 'pending', created_at: new Date().toISOString() }); save(); return null;
    case 'admin_delete': g.splice(g.findIndex(x => x.token === a.p_token), 1); save(); return null;
  }
}

