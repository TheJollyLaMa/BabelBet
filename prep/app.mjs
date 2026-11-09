import { emptyProfile, readProfile, parseProfile, persistProfile, MAX_IMPORT_BYTES, PROFILE_KEY } from './profile.mjs';
import { createPreparationIPFSHost } from './ipfs-adapter.mjs';
const $ = id => document.getElementById(id);
const returnFocus = new WeakMap();
function activeControl() {
  let node = document.activeElement;
  while (node?.shadowRoot?.activeElement) node = node.shadowRoot.activeElement;
  return node;
}
const open = (id, trigger = activeControl()) => {
  const dialog = $(id);
  returnFocus.set(dialog, trigger);
  dialog.showModal();
};
globalThis.DECENT_CONFIG = {
  appName: 'BabelBet', subtitle: 'A Decent language bridge · preparation only',
  ens: { enabled: false },
  theme: { accent: '#7af0cf', 'accent-2': '#c5b1ff', 'bg-1': '#0c1426', 'bg-2': '#22314e', title: '#f3eeff' },
  art: { titleEnds: ['⟪', '⟫'] },
  providers: { default: 'unconfigured · local files only' },
  ipfsControlsMode: 'host-only',
  ipfsAdapter: createPreparationIPFSHost({ openLocalBackup: () => open('profile-dialog') }),
  about: {
    title: 'About BabelBet’s preparation bridge',
    summary: 'A free, preparation-only Decent experience. The historical betting implementation is archived, not activated.',
    sections: [
      { title: 'What is available', body: 'Optional EIP-6963 wallet session, private local profile files, accessible bunny-hop orientation and contextual shared ankhs.' },
      { title: 'Safety comes first', body: 'Official and unofficial Duolingo access, watchers, challenges, email, stakes and payouts are disabled. No provider, AI, contract, wallet secret or financial configuration is bundled.' },
      { title: 'Participation and accepted work', body: 'Participation is free. Preparation work requires steward acceptance and review. Request a private contributor registration channel; never put payout addresses or keys in public issues. Gated receipt tooling records proven prior payments only, never transfers funds.' },
      { title: 'Data and storage', body: 'Profiles are tab-local unless you explicitly save in this browser. Local export is plaintext; keep it private. Provider choice is not verification. Explicit Verify checks your personal Pinata authentication or local Kubo version without uploads; credentials stay in this tab. Provider readiness does not verify backup or retention. IPFS uploads, community pinning and rewards are unavailable. UCAN authorization is not implemented. A wallet is neither required nor admin authorization.' }
    ]
  },
  links: [{ label: 'Preparation guide', url: new URL('./guide.html', location.href).href }],
  relatedDapps: [{ label: 'DecentCanopy', url: 'https://github.com/TheJollyLaMa/DecentCanopy' }]
};
const { DecentHead } = await import('./vendor/decent-head/2.0.0/js/main.js');
const header = document.querySelector('decent-header');
header.addEventListener('decenthead:menu', event => {
  if (event.detail?.side === 'left') open('admin-dialog');
  if (event.detail?.side === 'right') open('profile-dialog');
});
DecentHead.on('wallet', state => {
  $('wallet-state').textContent = state.connected ? `Optional wallet connected: ${state.address} · no signing or payments available` : 'Wallet optional · not connected';
});

let profile = emptyProfile();
try {
  profile = readProfile(localStorage);
  $('remember-profile').checked = localStorage.getItem(PROFILE_KEY) !== null;
} catch {
  $('profile-status').textContent = 'Stored profile unavailable or invalid; using tab memory. You may clear the browser copy.';
}
function fillProfile() { for (const key of ['nickname', 'languages', 'notes']) $(key).value = profile[key]; }
fillProfile();
for (const id of ['profile-open', 'privacy-open']) $(id).onclick = () => open('profile-dialog');
$('admin-open').onclick = () => open('admin-dialog');
$('about-open').onclick = () => header.openAbout();
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => dialog.close(); });
  dialog.addEventListener('close', () => returnFocus.get(dialog)?.focus());
}
$('profile-form').onsubmit = event => {
  event.preventDefault();
  profile = { version: 1, nickname: $('nickname').value, languages: $('languages').value, notes: $('notes').value };
  try {
    profile = persistProfile(localStorage, profile, $('remember-profile').checked);
    $('profile-status').textContent = $('remember-profile').checked ? 'Saved to this browser only. Nothing uploaded.' : 'Saved in tab memory; browser copy removed. Nothing uploaded.';
  } catch { $('profile-status').textContent = 'Kept in tab memory. Browser storage unavailable; an older browser copy may remain. Use browser settings to remove it.'; }
};
$('profile-clear').onclick = () => {
  profile = emptyProfile(); fillProfile(); $('remember-profile').checked = false; $('export-consent').checked = false; $('profile-export').disabled = true;
  try { localStorage.removeItem(PROFILE_KEY); $('profile-status').textContent = 'Profile cleared from memory and this browser.'; }
  catch { $('profile-status').textContent = 'Memory cleared. Browser storage unavailable; remove any older copy in browser settings.'; }
};
$('export-consent').onchange = () => { $('profile-export').disabled = !$('export-consent').checked; };
$('profile-export').onclick = () => {
  if (!$('export-consent').checked) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'babelbet-preparation-profile.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('profile-status').textContent = 'Exported the last saved profile as a local plaintext file. No upload. Keep it private.';
};
$('profile-import').onchange = async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > MAX_IMPORT_BYTES) throw new Error('Profile exceeds 64 KiB.');
    const imported = parseProfile(await file.text());
    if (!confirm('Replace your in-memory profile with this validated local file? No browser save or upload will occur.')) return;
    profile = imported; fillProfile();
    $('profile-status').textContent = 'Imported into memory only. Save explicitly if you want to replace the browser copy.';
  } catch (error) { $('profile-status').textContent = `Import rejected: ${error.message}`; }
  finally { event.target.value = ''; }
};

const hops = [
  ['Welcome to the bridge', 'BabelBet is preparation-only. There are no games, challenges, wagers, provider calls or automated payouts. Participation is free.'],
  ['Explore the shared head', 'The two ankhs flank the title: left for steward information, right for your local profile. Click the title for About. Optional wallet connection does not grant privileges or request a signature.'],
  ['Keep your profile private', 'Save in memory, explicitly remember in this browser, or export/import a local JSON file. No provider login or wallet address belongs in your profile. IPFS uploads and rewards remain unavailable.'],
  ['Join accepted preparation work', 'Offer translations, accessibility improvements, documentation or offline tests. A steward reviews and accepts work before any future accrual. Arrange contributor registration privately, not in public issues.'],
  ['Prepare responsibly', 'Permission, privacy and provider etiquette must be agreed before future integrations. You are ready to help prepare — no score or prize.']
];
let hop = 0;
function renderHop() {
  $('tutorial-progress').textContent = `Hop ${hop + 1} of ${hops.length}`;
  $('tutorial-title').textContent = hops[hop][0]; $('tutorial-body').textContent = hops[hop][1];
  $('tutorial-back').disabled = hop === 0; $('tutorial-next').textContent = hop === hops.length - 1 ? 'Finish orientation' : 'Next hop';
}
$('tutorial-open').onclick = () => { hop = 0; renderHop(); open('tutorial-dialog'); };
$('tutorial-back').onclick = () => { if (hop > 0) { hop--; renderHop(); } };
$('tutorial-next').onclick = () => { if (hop === hops.length - 1) $('tutorial-dialog').close(); else { hop++; renderHop(); } };
window.addEventListener('pagehide', () => {
  DecentHead.getWallet().forget();
});
