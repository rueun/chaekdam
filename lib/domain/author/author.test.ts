import { describe, it, expect } from 'vitest';
import { Author } from './author';

describe('Author.isDeceased', () => {
  it('큐레이션 목록의 사망 작가를 인식한다', () => {
    expect(Author.isDeceased('헤르만 헤세')).toBe(true);
    expect(Author.isDeceased('박완서')).toBe(true);
  });

  it('공백 표기 차이는 흡수한다', () => {
    expect(Author.isDeceased('헤르만헤세')).toBe(true);
  });

  it('다중 저자는 모두 사망일 때만 사망으로 본다', () => {
    expect(Author.isDeceased('헤르만 헤세 ^ 프란츠 카프카')).toBe(true);
    // 생존 작가가 섞이면 비활성(보수적).
    expect(Author.isDeceased('김연수 | 헤르만 헤세')).toBe(false);
  });

  it('부분 일치 오탐을 내지 않는다(정확 일치)', () => {
    expect(Author.isDeceased('이상한 나라의 앨리스')).toBe(false);
    expect(Author.isDeceased('이상문학상')).toBe(false);
    expect(Author.isDeceased('백석기')).toBe(false);
  });

  it('생존·미등록 작가는 사망으로 보지 않는다', () => {
    expect(Author.isDeceased('김연수')).toBe(false);
    expect(Author.isDeceased('무라카미 하루키')).toBe(false);
  });

  it('빈 이름은 false', () => {
    expect(Author.isDeceased('')).toBe(false);
    expect(Author.isDeceased('   ')).toBe(false);
  });
});
