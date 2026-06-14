import type { Discussion } from '@/lib/domain/discussion/discussion';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';

/**
 * 토론 목록 조회(Query). 최신순(메시지 포함). 소유 범위는 Repository/RLS 가 보장한다.
 */
export class ListDiscussionsUseCase {
  constructor(private readonly discussions: DiscussionRepository) {}

  execute(): Promise<Discussion[]> {
    return this.discussions.findAll();
  }
}
