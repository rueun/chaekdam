import { describe, it, expect } from 'vitest';
import { Persona, type PersonaKey } from './persona';

describe('Persona', () => {
  it('키로 페르소나를 얻고 톤·이름을 노출한다', () => {
    const socrates = Persona.of('socrates');
    expect(socrates.key).toBe('socrates');
    expect(socrates.name).toBe('소크라테스');
    expect(socrates.tone).toBeTruthy();
  });

  it('MVP 가용 페르소나는 작가 본인을 제외한 3종이다', () => {
    expect(Persona.availableKeys()).toEqual(['socrates', 'critic', 'friend']);
    expect(Persona.isAvailable('author')).toBe(false);
    expect(Persona.isAvailable('socrates')).toBe(true);
  });

  it('작가 본인은 사망 작가 한정 플래그를 가진다', () => {
    expect(Persona.of('author').requiresDeceasedAuthor).toBe(true);
    expect(Persona.of('critic').requiresDeceasedAuthor).toBe(false);
  });

  it('페르소나는 동결되어 있다', () => {
    expect(Object.isFrozen(Persona.of('friend'))).toBe(true);
  });

  it('availableKeys 결과를 외부에서 변경할 수 없다', () => {
    expect(() => {
      // readonly 를 캐스트로 우회해도 동결된 배열이라 런타임에서 막힌다.
      (Persona.availableKeys() as PersonaKey[]).push('author');
    }).toThrow(TypeError);
    expect(Persona.availableKeys()).toEqual(['socrates', 'critic', 'friend']);
  });
});
