import { describe, it, expect } from 'vitest';
import { CaptureHighlightFromPhotoUseCase } from './capture-highlight-from-photo.use-case';
import { InMemoryHighlightRepository } from './test-support/in-memory-highlight-repository';
import { NoteSource } from '@/lib/domain/highlight/note-source';
import type { Highlight } from '@/lib/domain/highlight/highlight';
import type { HighlightRepository } from '@/lib/domain/ports/highlight-repository';
import type { PhotoStorage, PhotoUpload } from '@/lib/domain/ports/photo-storage';

/** 결정적 Fake — 업로드를 흉내내고 받은 이미지·삭제 호출을 기록한다. */
class FakePhotoStorage implements PhotoStorage {
  lastImage: PhotoUpload | null = null;
  removed: string[] = [];
  constructor(private readonly url: string) {}
  store(image: PhotoUpload): Promise<string> {
    this.lastImage = image;
    return Promise.resolve(this.url);
  }
  remove(url: string): Promise<void> {
    this.removed.push(url);
    return Promise.resolve();
  }
}

describe('CaptureHighlightFromPhotoUseCase', () => {
  it('사진을 저장하고 PHOTO 출처 한 줄로 남긴다', async () => {
    const photos = new FakePhotoStorage('https://cdn.example/u1/abc.jpg');
    const highlights = new InMemoryHighlightRepository();
    const useCase = new CaptureHighlightFromPhotoUseCase(photos, highlights);

    await useCase.execute({
      bookId: 'b1',
      content: '인상 깊은 구절',
      image: { base64: 'AAAA', mediaType: 'image/jpeg' },
      page: '42',
    });

    expect(photos.lastImage).toEqual({ base64: 'AAAA', mediaType: 'image/jpeg' });
    const saved = (await highlights.findByBookId('b1'))[0]!;
    expect(saved.source).toBe(NoteSource.PHOTO);
    expect(saved.photoUrl).toBe('https://cdn.example/u1/abc.jpg');
    expect(saved.content).toBe('인상 깊은 구절');
    expect(saved.page).toBe('42');
  });

  it('업로드 실패 시 한 줄을 저장하지 않는다', async () => {
    const failing: PhotoStorage = {
      store: () => Promise.reject(new Error('upload down')),
      remove: () => Promise.resolve(),
    };
    const highlights = new InMemoryHighlightRepository();
    const useCase = new CaptureHighlightFromPhotoUseCase(failing, highlights);

    await expect(
      useCase.execute({
        bookId: 'b1',
        content: '구절',
        image: { base64: 'AAAA', mediaType: 'image/jpeg' },
      }),
    ).rejects.toThrow('upload down');
    expect(await highlights.findAll()).toHaveLength(0);
  });

  it('저장이 실패하면 업로드된 사진을 삭제한다(고아 객체 방지)', async () => {
    const photos = new FakePhotoStorage('https://cdn.example/u1/abc.jpg');
    const failingRepo: HighlightRepository = {
      save: () => Promise.reject(new Error('db down')),
      findById: () => Promise.resolve(null),
      findByBookId: () => Promise.resolve([] as Highlight[]),
      findAll: () => Promise.resolve([] as Highlight[]),
      findArchived: () => Promise.resolve([] as Highlight[]),
      remove: () => Promise.resolve(),
    };
    const useCase = new CaptureHighlightFromPhotoUseCase(photos, failingRepo);

    await expect(
      useCase.execute({
        bookId: 'b1',
        content: '구절',
        image: { base64: 'AAAA', mediaType: 'image/jpeg' },
      }),
    ).rejects.toThrow('db down');
    expect(photos.removed).toEqual(['https://cdn.example/u1/abc.jpg']);
  });
});
