import type { IconName } from '@/components/ui/icon';

/**
 * AI 토론 페르소나 — 톤·관점 아키타입(ADR-009).
 * 대화방은 생성 시 페르소나가 고정된다(생성 후 변경 불가).
 * 설정 기본값 선택 · 새 대화 생성 · 채팅 헤더 배지에서 공유되는 단일 출처.
 */
export type PersonaKey = 'socrates' | 'critic' | 'author' | 'friend';

export interface Persona {
  /** 표시 이름 */
  name: string;
  /** 한 줄 역할 */
  role: string;
  icon: IconName;
  /** 선택 화면용 짧은 설명 */
  short: string;
  /** 선택 카드용 한 문단 설명 */
  blurb: string;
  /** 선택 카드용 말투 미리보기(인용) */
  preview: string;
  /** 카드 우상단 배지(예: 작가 본인 '책마다 다름') */
  badge?: string;
  /** 사망 작가에 한해 활성(ADR-009) — 생존 작가 책에서는 비활성 */
  onlyDeceased?: boolean;
}

export const PERSONAS: Record<PersonaKey, Persona> = {
  socrates: {
    name: '소크라테스',
    role: '질문하는 사람',
    icon: 'help-circle',
    short: '답 대신 질문을 건네요',
    blurb: '답을 주지 않고 묻기만 해요. 본인 생각을 끌어내고 싶을 때.',
    preview: '이 문장을 따라 적은 이유는 무엇이었을까요?',
  },
  critic: {
    name: '비평가',
    role: '분석하는 사람',
    icon: 'scan-text',
    short: '구조와 문체를 짚어줘요',
    blurb: '작품의 구조·문체·당대 맥락을 짚어줘요.',
    preview: '백석의 시 운율이 이 장면의 호흡과 닮아 있죠.',
  },
  author: {
    name: '작가 본인',
    role: '쓴 사람의 목소리',
    icon: 'feather',
    short: '인터뷰·서신에서 학습',
    blurb: '인터뷰·서신·산문에서 학습한 톤. 사망 작가에 한해 활성화돼요.',
    preview: '그때 저는 이 장면을 며칠을 두고 다듬었습니다.',
    badge: '책마다 다름',
    onlyDeceased: true,
  },
  friend: {
    name: '책 동무',
    role: '같이 읽는 친구',
    icon: 'coffee',
    short: '분석하지 않고 같이 반응해요',
    blurb: '한국 문학 좋아하는 가상의 독자. 분석하지 않고 같이 반응해줘요.',
    preview: '어, 나도 이 부분에서 한참 멈췄어요. 그 다음 장면도 좋지 않았어요?',
  },
};

/** 선택 화면에 노출하는 순서 */
export const PERSONA_ORDER: PersonaKey[] = ['socrates', 'critic', 'author', 'friend'];
