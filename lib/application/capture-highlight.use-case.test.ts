import { describe, it, expect, beforeEach } from 'vitest';
import { CaptureHighlightUseCase } from './capture-highlight.use-case';
import type { Highlight } from '@/lib/domain/highlight/highlight';
import { NoteSource } from '@/lib/domain/highlight/note-source';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import { EmptyHighlightContentError } from '@/lib/domain/shared/errors';

/** 테스트용 In-Memory 구현 — Mock 이 아닌 진짜 저장 동작(testing 규칙). */
class InMemoryHighlightRepository implements HighlightRepository {
  readonly saved: Highlight[] = [];

  save(highlight: Highlight): Promise<void> {
    this.saved.push(highlight);
    return Promise.resolve();
  }
  findById(id: string): Promise<Highlight | null> {
    return Promise.resolve(this.saved.find((h) => h.id === id) ?? null);
  }
  findByBookId(bookId: string): Promise<Highlight[]> {
    return Promise.resolve(this.saved.filter((h) => h.bookId === bookId));
  }
}

describe('CaptureHighlightUseCase', () => {
  let repo: InMemoryHighlightRepository;
  let useCase: CaptureHighlightUseCase;

  beforeEach(() => {
    repo = new InMemoryHighlightRepository();
    useCase = new CaptureHighlightUseCase(repo);
  });

  it('텍스트 한 줄을 담아 저장하고 id 를 돌려준다', async () => {
    const result = await useCase.execute({
      source: NoteSource.TEXT,
      bookId: 'book-1',
      content: '인상 깊은 한 구절',
      page: 'p.42',
    });

    expect(result.highlightId).toBeTruthy();
    expect(repo.saved).toHaveLength(1);
    const saved = repo.saved[0]!;
    expect(saved.source).toBe(NoteSource.TEXT);
    expect(saved.content).toBe('인상 깊은 한 구절');
    expect(saved.page).toBe('p.42');
    expect(saved.photoUrl).toBeNull();
  });

  it('사진 한 줄을 담으면 사진 URL 과 함께 저장된다', async () => {
    const result = await useCase.execute({
      source: NoteSource.PHOTO,
      bookId: 'book-1',
      content: '추출된 문장',
      photoUrl: 'https://x/y.jpg',
    });

    const saved = await repo.findById(result.highlightId);
    expect(saved).not.toBeNull();
    expect(saved!.isFromPhoto()).toBe(true);
    expect(saved!.photoUrl).toBe('https://x/y.jpg');
    // page 미전달 시 null 로 기본 설정
    expect(saved!.page).toBeNull();
  });

  it('빈 본문은 도메인 예외로 거부되고 저장되지 않는다', async () => {
    await expect(
      useCase.execute({ source: NoteSource.TEXT, bookId: 'book-1', content: '   ' }),
    ).rejects.toThrow(EmptyHighlightContentError);
    expect(repo.saved).toHaveLength(0);
  });

  it('저장한 한 줄은 책 id 로 조회된다', async () => {
    await useCase.execute({ source: NoteSource.TEXT, bookId: 'book-1', content: '문장 A' });
    await useCase.execute({ source: NoteSource.TEXT, bookId: 'book-2', content: '문장 B' });

    const book1 = await repo.findByBookId('book-1');
    expect(book1).toHaveLength(1);
    expect(book1[0]!.content).toBe('문장 A');
  });
});
