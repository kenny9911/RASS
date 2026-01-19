import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col h-full">
      {/* Header moved to ChatInterface */}


      <ChatInterface />
    </main>
  );
}
