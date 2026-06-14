import { describe, it, expect } from 'vitest';
import { UpdateUserProfileUseCase } from './update-user-profile.use-case';
import { InMemoryUserProfileRepository } from './test-support/in-memory-user-profile-repository';

describe('UpdateUserProfileUseCase', () => {
  it('이름과 소개를 갱신하고 갱신된 사용자를 반환한다', async () => {
    const repo = new InMemoryUserProfileRepository({ name: '홍길동', bio: null });
    const user = await new UpdateUserProfileUseCase(repo).execute({
      name: '김독서',
      bio: '종이책 애호가',
    });

    expect(user.name).toBe('김독서');
    expect(user.bio).toBe('종이책 애호가');
  });

  it('소개를 null 로 비울 수 있다', async () => {
    const repo = new InMemoryUserProfileRepository({ name: '홍길동', bio: '기존 소개' });
    const user = await new UpdateUserProfileUseCase(repo).execute({ name: '홍길동', bio: null });

    expect(user.bio).toBeNull();
  });
});
