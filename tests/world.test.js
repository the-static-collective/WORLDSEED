import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addContradiction,
  addRelation,
  addSource,
  captureNode,
  createWorld,
  exportWorld,
  extractWikiLinks,
  getNeighborhood,
} from '../src/world.js';

test('createWorld starts with an empty author-owned world document', () => {
  const world = createWorld('The Long Memory', { id: 'world-1', now: '2026-08-24T00:00:00.000Z' });

  assert.equal(world.schemaVersion, '0.1');
  assert.equal(world.id, 'world-1');
  assert.equal(world.title, 'The Long Memory');
  assert.deepEqual(world.nodes, []);
  assert.deepEqual(world.edges, []);
  assert.deepEqual(world.sources, []);
});

test('extractWikiLinks preserves unique linked names in encounter order', () => {
  assert.deepEqual(
    extractWikiLinks('Meet [[Ada Vale]] beside [[North Station]], then return to [[Ada Vale]].'),
    ['Ada Vale', 'North Station'],
  );
});

test('captureNode keeps prose and creates mention edges to lightweight wiki stubs', () => {
  const world = createWorld('World', { id: 'world-1', now: '2026-08-24T00:00:00.000Z' });

  captureNode(world, {
    id: 'note-1',
    title: 'Arrival note',
    body: 'I think [[Ada Vale]] reached [[North Station]] before dawn.',
    kind: 'note',
    epistemic: 'possibility',
    now: '2026-08-24T00:01:00.000Z',
  });

  assert.equal(world.nodes.length, 3);
  assert.equal(world.nodes.find((node) => node.id === 'note-1').body, 'I think [[Ada Vale]] reached [[North Station]] before dawn.');
  assert.equal(world.nodes.find((node) => node.title === 'Ada Vale').stub, true);
  assert.equal(world.nodes.find((node) => node.title === 'North Station').stub, true);
  assert.deepEqual(
    world.edges.filter((edge) => edge.type === 'mentions').map((edge) => edge.toTitle),
    ['Ada Vale', 'North Station'],
  );
});

test('addRelation preserves author-declared open-vocabulary relation and epistemic state', () => {
  const world = seededTwoNodeWorld();

  addRelation(world, {
    id: 'edge-1',
    from: 'ada',
    to: 'station',
    type: 'possibly-knew',
    epistemic: 'sourced-interpretation',
    note: 'A letter places both in the district.',
    now: '2026-08-24T00:03:00.000Z',
  });

  assert.deepEqual(world.edges.at(-1), {
    id: 'edge-1',
    from: 'ada',
    to: 'station',
    type: 'possibly-knew',
    epistemic: 'sourced-interpretation',
    note: 'A letter places both in the district.',
    createdAt: '2026-08-24T00:03:00.000Z',
  });
});

test('addSource attaches provenance without changing the node claim', () => {
  const world = seededTwoNodeWorld();

  addSource(world, {
    id: 'source-1',
    nodeId: 'ada',
    label: 'City directory, 1891',
    url: 'https://example.test/directory',
    note: 'Lists an A. Vale on Mercer Street.',
    now: '2026-08-24T00:04:00.000Z',
  });

  assert.equal(world.sources.length, 1);
  assert.equal(world.sources[0].nodeId, 'ada');
  assert.equal(world.nodes.find((node) => node.id === 'ada').epistemic, 'historical-fact');
});

test('addContradiction preserves both claims and records incompatibility without resolving it', () => {
  const world = seededTwoNodeWorld();

  addContradiction(world, {
    id: 'contradiction-1',
    left: 'ada',
    right: 'station',
    note: 'These entries currently imply incompatible locations at the same time.',
    now: '2026-08-24T00:05:00.000Z',
  });

  const edge = world.edges.at(-1);
  assert.equal(edge.type, 'contradicts');
  assert.equal(edge.from, 'ada');
  assert.equal(edge.to, 'station');
  assert.equal(edge.resolution, null);
  assert.equal(world.nodes.length, 2);
});

test('getNeighborhood returns immediate incoming and outgoing connected entries', () => {
  const world = seededTwoNodeWorld();
  addRelation(world, {
    id: 'edge-1',
    from: 'ada',
    to: 'station',
    type: 'arrived-at',
    epistemic: 'fictional-canon',
    now: '2026-08-24T00:06:00.000Z',
  });

  const neighborhood = getNeighborhood(world, 'station');

  assert.equal(neighborhood.focus.id, 'station');
  assert.equal(neighborhood.connections.length, 1);
  assert.equal(neighborhood.connections[0].direction, 'incoming');
  assert.equal(neighborhood.connections[0].node.id, 'ada');
  assert.equal(neighborhood.connections[0].edge.type, 'arrived-at');
});

test('exportWorld returns a detached complete world document', () => {
  const world = seededTwoNodeWorld();
  addSource(world, {
    id: 'source-1',
    nodeId: 'ada',
    label: 'Archive note',
    now: '2026-08-24T00:07:00.000Z',
  });

  const exported = exportWorld(world);
  exported.nodes[0].title = 'Changed outside';

  assert.equal(world.nodes[0].title, 'Ada Vale');
  assert.equal(exported.sources.length, 1);
  assert.equal(exported.schemaVersion, '0.1');
});

function seededTwoNodeWorld() {
  const world = createWorld('World', { id: 'world-1', now: '2026-08-24T00:00:00.000Z' });

  captureNode(world, {
    id: 'ada',
    title: 'Ada Vale',
    body: 'Directory-backed person entry.',
    kind: 'person',
    epistemic: 'historical-fact',
    now: '2026-08-24T00:01:00.000Z',
  });

  captureNode(world, {
    id: 'station',
    title: 'North Station',
    body: 'A station in the fictional narrative layer.',
    kind: 'place',
    epistemic: 'fictional-canon',
    now: '2026-08-24T00:02:00.000Z',
  });

  return world;
}
