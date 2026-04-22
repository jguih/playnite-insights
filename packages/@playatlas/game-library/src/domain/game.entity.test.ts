import { describe, expect, it } from 'vitest';
import { makeGame } from './index';
import { InvalidStateError } from '@playatlas/common/domain';

const now = new Date('2026-04-21T12:00:00.000Z');
const deps = { clock: { now: () => now } } as const;

const snapshot = {
  id: 'playnite-1',
  playtime: 120,
  backgroundImagePath: null,
  coverImagePath: null,
  iconImagePath: null,
};

const base = {
  id: 'game-1' as any,
  contentHash: 'hash-1',
  playniteSnapshot: structuredClone(snapshot),
};

describe('game entity invariants', () => {
  it('creates a valid game', () => {
    const game = makeGame(base, deps);
    expect(game.getId()).toBe('game-1');
    expect(game.getContentHash()).toBe('hash-1');
  });

  it('rejects empty content hash', () => {
    expect(() => makeGame({ ...base, contentHash: '' }, deps)).toThrow(InvalidStateError);
  });

  it('rejects negative playtime', () => {
    expect(() => makeGame({ ...base, playniteSnapshot: { ...snapshot, playtime: -1 } }, deps)).toThrow(InvalidStateError);
  });

  it('sets image references using snapshot folder', () => {
    const game = makeGame(base, deps);
    game.setImageReference({ name: 'cover', path: { filename: 'cover.jpg' } });
    expect(game.getCoverImagePath()).toBe('playnite-1/cover.jpg');
  });

  it('rejects empty image filename', () => {
    const game = makeGame(base, deps);
    expect(() => game.setImageReference({ name: 'cover', path: { filename: '' } })).toThrow(InvalidStateError);
  });

  it('updates from playnite when content hash changes', () => {
    const game = makeGame(base, deps);
    const updated = game.updateFromPlaynite({
      contentHash: 'hash-2',
      playniteSnapshot: { ...snapshot, playtime: 999 },
      relationships: {
        developerIds: ['d1'],
        publisherIds: ['p1'],
        platformIds: ['pc'],
        genreIds: ['rpg'],
        tagIds: ['fav'],
      },
    } as any);

    expect(updated).toBe(true);
    expect(game.getContentHash()).toBe('hash-2');
    expect(game.getPlayniteSnapshot()?.playtime).toBe(999);
  });

  it('does not update when content hash is unchanged', () => {
    const game = makeGame(base, deps);
    const updated = game.updateFromPlaynite({
      contentHash: 'hash-1',
      playniteSnapshot: structuredClone(snapshot),
      relationships: {
        developerIds: null,
        publisherIds: null,
        platformIds: null,
        genreIds: null,
        tagIds: null,
      },
    } as any);

    expect(updated).toBe(false);
  });
});
