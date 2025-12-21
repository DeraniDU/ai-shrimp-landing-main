'use client'; // Important: needed if using useState or other hooks

import FeedingDemo from '../../components/feeding/FeedingDemo';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <FeedingDemo />
    </div>
  );
}
