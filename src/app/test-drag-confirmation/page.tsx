'use client';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SectionActivities } from '@/features/course/components/SectionActivities';

export default function DragConfirmationTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Drag & Drop Confirmation Test
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Test the drag and drop confirmation functionality for sections and activities
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Test Instructions:
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                Try dragging sections to reorder them - a confirmation dialog should appear
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                Try dragging activities within the same section - a confirmation dialog should appear
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                Try dragging activities between sections - a confirmation dialog should appear
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                Test both "Confirm" and "Cancel" options
              </li>
            </ul>

            <SectionActivities
              groupId="b8d1607e-4edf-4f7a-8a0b-0552191bdd71"
              onAddActivity={(sectionId) => {
                console.log('Add activity to section:', sectionId);
              }}
              onEditActivity={(sectionId, activityId, activityData) => {
                console.log('Edit activity:', { sectionId, activityId, activityData });
              }}
              onManageQuizQuestions={(sectionId, activityId, activityData) => {
                console.log('Manage quiz questions:', { sectionId, activityId, activityData });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}