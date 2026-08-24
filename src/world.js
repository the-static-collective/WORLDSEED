const SCHEMA_VERSION = '0.1';

export function createWorld(title = 'Untitled World', options = {}) {
  const now = options.now ?? new Date().toISOString();

  return {
    schemaVersion: SCHEMA_VERSION,
    id: options.id ?? makeId('world'),
    title: cleanText(title) || 'Untitled World',
    createdAt: now,
    updatedAt: now,
    nodes: [],
    edges: [],
    sources: [],
  };
}

export function extractWikiLinks(text = '') {
  const seen = new Set();
  const links = [];
  const pattern = /\[\[([^\[\]]+)\]\]/g;

  for (const match of String(text).matchAll(pattern)) {
    const title = cleanText(match[1]);
    const key = title.toLocaleLowerCase();
    if (!title || seen.has(key)) continue;
    seen.add(key);
    links.push(title);
  }

  return links;
}

export function captureNode(world, input = {}) {
  assertWorld(world);
  const now = input.now ?? new Date().toISOString();
  const title = cleanText(input.title) || 'Untitled Entry';
  const body = String(input.body ?? '');

  const node = {
    id: input.id ?? makeUniqueId(world.nodes, slug(title) || 'entry'),
    title,
    body,
    kind: cleanText(input.kind) || 'note',
    epistemic: cleanText(input.epistemic) || 'unknown',
    stub: false,
    createdAt: now,
  };

  if (world.nodes.some((existing) => existing.id === node.id)) {
    throw new Error(`Node id already exists: ${node.id}`);
  }

  world.nodes.push(node);

  for (const linkedTitle of extractWikiLinks(body)) {
    let target = findNodeByTitle(world, linkedTitle);
    if (!target) {
      target = {
        id: makeUniqueId(world.nodes, `stub-${slug(linkedTitle) || 'entry'}`),
        title: linkedTitle,
        body: '',
        kind: 'unknown',
        epistemic: 'unknown',
        stub: true,
        createdAt: now,
      };
      world.nodes.push(target);
    }

    world.edges.push({
      id: makeUniqueId(world.edges, 'edge'),
      from: node.id,
      to: target.id,
      toTitle: target.title,
      type: 'mentions',
      epistemic: 'unknown',
      note: '',
      createdAt: now,
    });
  }

  world.updatedAt = now;
  return node;
}

export function addRelation(world, input = {}) {
  assertWorld(world);
  requireNode(world, input.from);
  requireNode(world, input.to);

  const edge = {
    id: input.id ?? makeUniqueId(world.edges, 'edge'),
    from: input.from,
    to: input.to,
    type: cleanText(input.type) || 'related-to',
    epistemic: cleanText(input.epistemic) || 'unknown',
    note: String(input.note ?? ''),
    createdAt: input.now ?? new Date().toISOString(),
  };

  world.edges.push(edge);
  world.updatedAt = edge.createdAt;
  return edge;
}

export function addSource(world, input = {}) {
  assertWorld(world);
  requireNode(world, input.nodeId);

  const source = {
    id: input.id ?? makeUniqueId(world.sources, 'source'),
    nodeId: input.nodeId,
    label: cleanText(input.label) || 'Source',
    url: cleanText(input.url),
    note: String(input.note ?? ''),
    createdAt: input.now ?? new Date().toISOString(),
  };

  world.sources.push(source);
  world.updatedAt = source.createdAt;
  return source;
}

export function addContradiction(world, input = {}) {
  assertWorld(world);
  requireNode(world, input.left);
  requireNode(world, input.right);

  const edge = {
    id: input.id ?? makeUniqueId(world.edges, 'contradiction'),
    from: input.left,
    to: input.right,
    type: 'contradicts',
    epistemic: 'contradiction',
    note: String(input.note ?? ''),
    resolution: null,
    createdAt: input.now ?? new Date().toISOString(),
  };

  world.edges.push(edge);
  world.updatedAt = edge.createdAt;
  return edge;
}

export function getNeighborhood(world, nodeId) {
  assertWorld(world);
  const focus = requireNode(world, nodeId);
  const connections = [];

  for (const edge of world.edges) {
    if (edge.from === nodeId) {
      connections.push({
        direction: 'outgoing',
        edge,
        node: requireNode(world, edge.to),
      });
    } else if (edge.to === nodeId) {
      connections.push({
        direction: 'incoming',
        edge,
        node: requireNode(world, edge.from),
      });
    }
  }

  return { focus, connections };
}

export function exportWorld(world) {
  assertWorld(world);
  return JSON.parse(JSON.stringify(world));
}

export function serializeWorld(world) {
  assertWorld(world);
  return JSON.stringify(world, null, 2);
}

export function parseWorld(json, options = {}) {
  try {
    const world = JSON.parse(String(json ?? ''));
    assertWorld(world);
    return world;
  } catch {
    return createWorld(options.fallbackTitle ?? 'Untitled World', {
      id: options.fallbackId,
      now: options.now,
    });
  }
}

function assertWorld(world) {
  if (!world || world.schemaVersion !== SCHEMA_VERSION || !Array.isArray(world.nodes) || !Array.isArray(world.edges) || !Array.isArray(world.sources)) {
    throw new Error('Invalid WORLDSEED world document');
  }
}

function requireNode(world, id) {
  const node = world.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Unknown node: ${id}`);
  return node;
}

function findNodeByTitle(world, title) {
  const key = cleanText(title).toLocaleLowerCase();
  return world.nodes.find((node) => cleanText(node.title).toLocaleLowerCase() === key);
}

function makeUniqueId(collection, base) {
  const used = new Set(collection.map((item) => item.id));
  if (!used.has(base)) return base;
  let index = 2;
  while (used.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function slug(value) {
  return cleanText(value)
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanText(value) {
  return String(value ?? '').trim();
}
