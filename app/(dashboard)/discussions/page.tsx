import { TopBar } from '@/components/layout/top-bar';
import { DiscussionWorkspace } from '@/components/feature/discussion-chat/discussion-workspace';
import type { DiscussionRoomView } from '@/components/feature/discussion-chat/discussion-list';
import type { Message } from '@/components/feature/discussion-chat/discussion-chat';
import type { NewChatBook } from '@/components/feature/discussion-chat/new-chat-modal';

// 대화방 목록 샘플 — 추후 DiscussionRepository 조회로 대체.
// 한 책에 여러 방이 있을 수 있고, 각 방의 페르소나는 생성 시 고정(ADR-009).
const ROOMS: DiscussionRoomView[] = [
  {
    id: 'r1',
    bookTitle: '일곱 해의 마지막',
    personaKey: 'critic',
    topic: '4장 · 빛나는 것들에 대하여',
    when: '방금',
    turns: 14,
    coverColor: 'var(--terra-600)',
  },
  {
    id: 'r2',
    bookTitle: '일곱 해의 마지막',
    personaKey: 'friend',
    topic: '백석에 대한 잡담',
    when: '어제',
    turns: 8,
    coverColor: 'var(--terra-600)',
  },
  {
    id: 'r3',
    bookTitle: '바깥은 여름',
    personaKey: 'socrates',
    topic: '완독 후 회고',
    when: '4월 22일',
    turns: 22,
    coverColor: 'var(--talk-500)',
  },
  {
    id: 'r4',
    bookTitle: '아주 사적인 독서',
    personaKey: 'critic',
    topic: '에필로그',
    when: '3월 8일',
    turns: 9,
    coverColor: 'var(--clay-500)',
  },
];

// 방별 대화 내용 샘플 — 추후 메시지 조회로 대체.
const THREADS: Record<string, Message[]> = {
  r1: [
    { id: 'm1', who: 'ai', body: '이 책에서 가장 마음에 닿은 장면은 어디였나요?' },
    {
      id: 'm2',
      who: 'me',
      body: '기행이 백석의 시를 다시 외우는 장면이요. 너무 조용해서 오히려 크게 들렸어요.',
    },
    {
      id: 'm3',
      who: 'ai',
      body: '"조용한 장면이 크게 들렸다"는 표현이 좋네요. 그 장면에서 기행은 어떤 마음이었을까요?',
    },
  ],
  r2: [{ id: 'm1', who: 'ai', body: '백석 이야기를 더 해볼까요? 어떤 시가 먼저 떠올라요?' }],
  r3: [
    {
      id: 'm1',
      who: 'ai',
      body: '완독 축하해요. 다 읽고 난 지금, 가장 먼저 떠오르는 한 문장은요?',
    },
  ],
  r4: [{ id: 'm1', who: 'ai', body: '에필로그에서 저자의 목소리가 어떻게 바뀌었다고 느꼈나요?' }],
};

// 새 대화 모달의 책 후보 — 추후 사용자 책장(읽는 중·완독) 조회로 대체.
// authorDeceased=true 인 책에서만 '작가 본인' 페르소나가 활성(ADR-009).
const NEW_CHAT_BOOKS: NewChatBook[] = [
  {
    id: 'b1',
    title: '일곱 해의 마지막',
    author: '김연수',
    statusLabel: '읽는 중',
    coverColor: 'var(--terra-600)',
    authorDeceased: false,
  },
  {
    id: 'b3',
    title: '바깥은 여름',
    author: '김애란',
    statusLabel: '완독 5월 7일',
    coverColor: 'var(--talk-500)',
    authorDeceased: false,
  },
  {
    id: 'b9',
    title: '소나기',
    author: '황순원',
    statusLabel: '완독 4월 2일',
    coverColor: 'var(--sage-700)',
    authorDeceased: true,
  },
];

export default function DiscussionsPage() {
  return (
    <>
      <TopBar title="AI 독서토론" subtitle="책에 대해 천천히 묻고 답해보세요" showSearch={false} />
      <DiscussionWorkspace rooms={ROOMS} threads={THREADS} books={NEW_CHAT_BOOKS} />
    </>
  );
}
