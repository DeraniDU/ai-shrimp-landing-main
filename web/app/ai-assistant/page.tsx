import FarmManagementAI from '@/components/ai-assistant/FarmManagementAI';

export const metadata = {
  title: 'Farm Management AI Assistant',
  description: 'Intelligent AI-powered decision support system for shrimp farm management and optimization',
};

export default function AIAssistantPage() {
  return (
    <main>
      <FarmManagementAI />
    </main>
  );
}
