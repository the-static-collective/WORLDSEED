import {
  addContradiction,
  addRelation,
  addSource,
  captureNode,
  getNeighborhood,
  parseWorld,
  serializeWorld,
} from './world.js';

const STORAGE_KEY = 'worldseed.activeWorld.v0.1';
const THEME_KEY = 'worldseed.theme';

const ui = {
  captureForm: byId('capture-form'),
  entryTitle: byId('entry-title'),
  entryKind: byId('entry-kind'),
  entryEpistemic: byId('entry-epistemic'),
  entryBody: byId('entry-body'),
  worldTitle: byId('world-title'),
  worldCounts: byId('world-counts'),
  shelf: byId('world-shelf'),
  linkForm: byId('link-form'),
  linkFrom: byId('link-from'),
  linkType: byId('link-type'),
  linkTo: byId('link-to'),
  linkEpistemic: byId('link-epistemic'),
  linkNote: byId('link-note'),
  sourceForm: byId('source-form'),
  sourceNode: byId('source-node'),
  sourceLabel: byId('source-label'),
  sourceUrl: byId('source-url'),
  sourceNote: byId('source-note'),
  contradictForm: byId('contradict-form'),
  contradictLeft: byId('contradict-left'),
  contradictRight: byId('contradict-right'),
  contradictNote: byId('contradict-note'),
  wanderFocus: byId('wander-focus'),
  wanderView: byId('wander-view'),
  exportWorld: byId('export-world'),
  themeSelect: byId('theme-select'),
  status: byId('status'),
};

let world = parseWorld(readStorage(STORAGE_KEY), {
  fallbackTitle: 'My World',
});
let selectedNodeId = world.nodes[0]?.id ?? null;

initializeTheme();
bindEvents();
render();

function bindEvents() {
  ui.captureForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const node = captureNode(world, {
      title: ui.entryTitle.value,
      kind: ui.entryKind.value,
      epistemic: ui.entryEpistemic.value,
      body: ui.entryBody.value,
    });

    selectedNodeId = node.id;
    ui.captureForm.reset();
    ui.entryKind.value = 'note';
    ui.entryEpistemic.value = 'unknown';
    commit(`Captured “${node.title}”.`);
    ui.entryTitle.focus();
  });

  ui.linkForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!ui.linkFrom.value || !ui.linkTo.value) return;

    addRelation(world, {
      from: ui.linkFrom.value,
      to: ui.linkTo.value,
      type: ui.linkType.value,
      epistemic: ui.linkEpistemic.value,
      note: ui.linkNote.value,
    });

    selectedNodeId = ui.linkFrom.value;
    ui.linkType.value = '';
    ui.linkNote.value = '';
    commit('Link preserved.');
  });

  ui.sourceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!ui.sourceNode.value) return;

    addSource(world, {
      nodeId: ui.sourceNode.value,
      label: ui.sourceLabel.value,
      url: ui.sourceUrl.value,
      note: ui.sourceNote.value,
    });

    selectedNodeId = ui.sourceNode.value;
    ui.sourceLabel.value = '';
    ui.sourceUrl.value = '';
    ui.sourceNote.value = '';
    commit('Source attached without changing the claim.');
  });

  ui.contradictForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const left = ui.contradictLeft.value;
    const right = ui.contradictRight.value;

    if (!left || !right) return;
    if (left === right) {
      announce('Choose two different entries to preserve a contradiction.');
      return;
    }

    addContradiction(world, {
      left,
      right,
      note: ui.contradictNote.value,
    });

    selectedNodeId = left;
    ui.contradictNote.value = '';
    commit('Contradiction preserved. Nothing was resolved.');
  });

  ui.worldTitle.addEventListener('change', () => {
    world.title = ui.worldTitle.value.trim() || 'Untitled World';
    world.updatedAt = new Date().toISOString();
    commit('World name saved.');
  });

  ui.wanderFocus.addEventListener('change', () => {
    selectedNodeId = ui.wanderFocus.value || null;
    renderShelf();
    renderWander();
  });

  ui.exportWorld.addEventListener('click', exportWorldFile);

  ui.themeSelect.addEventListener('change', () => {
    applyTheme(ui.themeSelect.value);
    writeStorage(THEME_KEY, ui.themeSelect.value);
  });
}

function commit(message) {
  const stored = writeStorage(STORAGE_KEY, serializeWorld(world));
  render();
  announce(stored ? message : `${message} Browser storage is unavailable; export before closing.`);
}

function render() {
  if (!world.nodes.some((node) => node.id === selectedNodeId)) {
    selectedNodeId = world.nodes[0]?.id ?? null;
  }

  if (document.activeElement !== ui.worldTitle) ui.worldTitle.value = world.title;
  ui.worldCounts.textContent = `${world.nodes.length} entries · ${world.edges.length} links · ${world.sources.length} sources`;

  renderShelf();
  renderSelects();
  renderWander();
  renderToolAvailability();
}

function renderShelf() {
  ui.shelf.replaceChildren();

  if (world.nodes.length === 0) {
    ui.shelf.append(emptyMessage('Nothing has entered this world yet.'));
    return;
  }

  for (const node of world.nodes) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shelf-card';
    button.dataset.selected = String(node.id === selectedNodeId);
    button.addEventListener('click', () => selectNode(node.id));

    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = node.title;

    const meta = document.createElement('span');
    meta.className = 'card-meta';
    meta.textContent = `${humanize(node.kind)} · ${humanize(node.epistemic)}`;
    if (node.stub) {
      const stub = document.createElement('span');
      stub.className = 'stub-mark';
      stub.textContent = ' · linked stub';
      meta.append(stub);
    }

    button.append(title, meta);

    if (node.body) {
      const body = document.createElement('span');
      body.className = 'card-body';
      body.textContent = excerpt(node.body, 170);
      button.append(body);
    }

    ui.shelf.append(button);
  }
}

function renderSelects() {
  const selects = [
    ui.linkFrom,
    ui.linkTo,
    ui.sourceNode,
    ui.contradictLeft,
    ui.contradictRight,
    ui.wanderFocus,
  ];

  for (const select of selects) populateNodeSelect(select);

  if (selectedNodeId) ui.wanderFocus.value = selectedNodeId;
}

function populateNodeSelect(select) {
  const prior = select.value;
  const fragment = document.createDocumentFragment();

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = world.nodes.length ? 'Choose an entry…' : 'Capture an entry first';
  fragment.append(placeholder);

  for (const node of world.nodes) {
    const option = document.createElement('option');
    option.value = node.id;
    option.textContent = node.stub ? `${node.title} (stub)` : node.title;
    fragment.append(option);
  }

  select.replaceChildren(fragment);
  if (world.nodes.some((node) => node.id === prior)) select.value = prior;
}

function renderToolAvailability() {
  setFormEnabled(ui.linkForm, world.nodes.length >= 1);
  setFormEnabled(ui.sourceForm, world.nodes.length >= 1);
  setFormEnabled(ui.contradictForm, world.nodes.length >= 2);
  ui.wanderFocus.disabled = world.nodes.length === 0;
}

function setFormEnabled(form, enabled) {
  for (const control of form.elements) control.disabled = !enabled;
}

function renderWander() {
  ui.wanderView.replaceChildren();

  if (!selectedNodeId) {
    ui.wanderView.append(emptyMessage('Capture something, then enter it here.'));
    return;
  }

  const neighborhood = getNeighborhood(world, selectedNodeId);
  const { focus, connections } = neighborhood;
  const sources = world.sources.filter((source) => source.nodeId === focus.id);

  const card = document.createElement('article');
  card.className = 'wander-card';

  const heading = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = focus.title;
  const meta = document.createElement('div');
  meta.className = 'wander-meta';
  meta.append(badge(humanize(focus.kind)), badge(humanize(focus.epistemic)));
  if (focus.stub) meta.append(badge('linked stub'));
  heading.append(title, meta);
  card.append(heading);

  if (focus.body) {
    const prose = document.createElement('div');
    prose.className = 'wander-prose';
    prose.textContent = focus.body;
    card.append(prose);
  }

  card.append(subheading('Sources'));
  const sourceList = document.createElement('div');
  sourceList.className = 'source-list';
  if (sources.length === 0) {
    sourceList.append(emptyMessage('No source attached.'));
  } else {
    for (const source of sources) sourceList.append(renderSource(source));
  }
  card.append(sourceList);

  card.append(subheading('Immediate connections'));
  const connectionList = document.createElement('div');
  connectionList.className = 'connection-list';
  if (connections.length === 0) {
    connectionList.append(emptyMessage('No declared connections yet.'));
  } else {
    for (const connection of connections) connectionList.append(renderConnection(connection));
  }
  card.append(connectionList);

  ui.wanderView.append(card);
}

function renderSource(source) {
  const card = document.createElement('div');
  card.className = 'source-card';
  const strong = document.createElement('strong');
  strong.textContent = source.label;
  card.append(strong);

  const safeUrl = safeHttpUrl(source.url);
  if (safeUrl) {
    card.append(document.createElement('br'));
    const link = document.createElement('a');
    link.href = safeUrl;
    link.target = '_blank';
    link.rel = 'noreferrer noopener';
    link.textContent = source.url;
    card.append(link);
  }

  if (source.note) {
    card.append(document.createElement('br'));
    const note = document.createElement('small');
    note.textContent = source.note;
    card.append(note);
  }
  return card;
}

function renderConnection(connection) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'connection';
  button.addEventListener('click', () => selectNode(connection.node.id));

  const line = document.createElement('strong');
  const arrow = connection.direction === 'outgoing' ? '→' : '←';
  line.textContent = `${arrow} ${connection.edge.type} · ${connection.node.title}`;
  const detail = document.createElement('small');
  detail.textContent = `${humanize(connection.edge.epistemic)}${connection.edge.note ? ` · ${connection.edge.note}` : ''}`;
  button.append(line, detail);
  return button;
}

function selectNode(nodeId) {
  selectedNodeId = nodeId;
  ui.wanderFocus.value = nodeId;
  renderShelf();
  renderWander();
}

function exportWorldFile() {
  const json = serializeWorld(world);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileSafe(world.title || 'world')}.worldseed.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  announce('World exported. That file is yours.');
}

function initializeTheme() {
  const stored = readStorage(THEME_KEY);
  const choice = ['system', 'light', 'dark'].includes(stored) ? stored : 'system';
  ui.themeSelect.value = choice;
  applyTheme(choice);
}

function applyTheme(choice) {
  if (choice === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = choice;
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeHttpUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function emptyMessage(text) {
  const p = document.createElement('p');
  p.className = 'wander-empty';
  p.textContent = text;
  return p;
}

function badge(text) {
  const span = document.createElement('span');
  span.className = 'badge';
  span.textContent = text;
  return span;
}

function subheading(text) {
  const h4 = document.createElement('h4');
  h4.textContent = text;
  return h4;
}

function announce(message) {
  ui.status.textContent = message;
}

function excerpt(value, maxLength) {
  const normalized = String(value).replace(/\s+/g, ' ').trim();
  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 1)}…`;
}

function humanize(value) {
  return String(value ?? 'unknown').replaceAll('-', ' ');
}

function fileSafe(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'world';
}

function byId(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing interface element: #${id}`);
  return element;
}
