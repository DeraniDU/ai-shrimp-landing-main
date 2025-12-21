'use client'; // Important: needed if using useState or other hooks

import LearnMorePage from '../../components/feeding/LearnMorePage';


export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LearnMorePage />
    </div>
  );
}
