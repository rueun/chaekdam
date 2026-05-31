import { TopBar } from '@/components/layout/top-bar';
import { DiscussionChat } from '@/components/feature/discussion-chat/discussion-chat';

export default function DiscussionsPage() {
  return (
    <>
      <TopBar
        title="AI 독서토론"
        subtitle="『일곱 해의 마지막』 · 비평가와의 대화"
        showSearch={false}
      />
      <DiscussionChat
        bookTitle="일곱 해의 마지막"
        persona={{ name: '비평가', role: '분석하는 토론자', icon: 'scan-text' }}
        initialMessages={[
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
        ]}
      />
    </>
  );
}
