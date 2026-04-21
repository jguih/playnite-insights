import { describe, expect, it } from 'vitest';
import {
  GameSessionNotInProgressError,
  makeClosedGameSession,
  makeGameSession,
  makeStaleGameSession,
} from './index';
import { InvalidStateError } from '@playatlas/common/domain';

const fixedNow = new Date('2026-04-21T12:00:00.000Z');
const clock = { now: () => fixedNow };
const deps = { clock } as const;

const base = {
  sessionId: 'session-1' as any,
  gameId: 'game-1' as any,
  gameName: 'Test Game',
  startTime: new Date('2026-04-21T10:00:00.000Z'),
};

describe('game-session invariants', () => {
  it('creates in progress sessions by default', () => {
    const session = makeGameSession(base, deps);
    expect(session.isInProgress()).toBe(true);
    expect(session.getStatus()).toBe('in_progress');
    expect(session.getEndTime()).toBeNull();
    expect(session.getDuration()).toBeNull();
  });

  it('closes an in progress session with valid end time and duration', () => {
    const session = makeGameSession(base, deps);
    session.close({ endTime: new Date('2026-04-21T11:00:00.000Z'), duration: 3600 });
    expect(session.isClosed()).toBe(true);
    expect(session.getStatus()).toBe('closed');
    expect(session.getDuration()).toBe(3600);
  });

  it('cannot close a session twice', () => {
    const session = makeGameSession(base, deps);
    session.close({ endTime: new Date('2026-04-21T11:00:00.000Z'), duration: 3600 });
    expect(() => session.close({ endTime: new Date('2026-04-21T11:30:00.000Z'), duration: 5400 })).toThrow(GameSessionNotInProgressError);
  });

  it('can mark in progress session as stale', () => {
    const session = makeGameSession(base, deps);
    session.stale();
    expect(session.isStale()).toBe(true);
    expect(session.getStatus()).toBe('stale');
  });

  it('cannot stale a closed session', () => {
    const session = makeGameSession(base, deps);
    session.close({ endTime: new Date('2026-04-21T11:00:00.000Z'), duration: 3600 });
    expect(() => session.stale()).toThrow(GameSessionNotInProgressError);
  });

  it('rejects end time earlier or equal start time', () => {
    expect(() => makeClosedGameSession({ ...base, endTime: base.startTime, duration: 1 }, deps)).toThrow(InvalidStateError);
    expect(() => makeClosedGameSession({ ...base, endTime: new Date('2026-04-21T09:00:00.000Z'), duration: 1 }, deps)).toThrow(InvalidStateError);
  });

  it('rejects non positive duration', () => {
    expect(() => makeClosedGameSession({ ...base, endTime: new Date('2026-04-21T11:00:00.000Z'), duration: 0 }, deps)).toThrow(InvalidStateError);
  });

  it('supports constructing stale sessions', () => {
    const session = makeStaleGameSession(base, deps);
    expect(session.isStale()).toBe(true);
  });
});
