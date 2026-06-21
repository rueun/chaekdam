import type { Discussion } from '@/lib/domain/discussion/discussion';
import type { DiscussionRepository } from '@/lib/domain/ports/discussion-repository';
import { OwnedBy } from '@/lib/domain/discussion/specs/owned-by';
import { DiscussionAccessDeniedError, DiscussionNotFoundError } from '@/lib/domain/shared/errors';

/**
 * 토론 방을 불러오며 소유권을 검증한다(ADR-004/027 — 권한 이중 방어).
 * 없으면 NotFound, 소유자가 아니면 AccessDenied. 토론 이어가기 유스케이스 공용.
 */
export async function loadOwnedDiscussion(
  discussions: DiscussionRepository,
  discussionId: string,
  userId: string,
): Promise<Discussion> {
  const discussion = await discussions.findById(discussionId);
  if (!discussion) throw new DiscussionNotFoundError(discussionId);
  if (!new OwnedBy(userId).isSatisfiedBy(discussion)) {
    throw new DiscussionAccessDeniedError(discussionId);
  }
  return discussion;
}
