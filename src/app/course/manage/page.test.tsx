import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the SectionActivities to expose a controllable button that triggers onAddActivity
jest.mock('@/features/course/components/SectionActivities', () => ({
  SectionActivities: ({ onAddActivity }: any) => (
    <div>
      <button onClick={() => onAddActivity('sec-1')}>Add Activity</button>
    </div>
  ),
}));

// Mock ActivityDrawerContent to render sectionId so we can assert it appears
jest.mock('@/features/course/components/ActivityDrawerContent', () => ({
  ActivityDrawerContent: ({ sectionId }: any) => (
    <div data-testid="activity-drawer">ActivityDrawer:{sectionId}</div>
  ),
}));

// Render the page under test
import ManageCoursePage from './page';

describe('ManageCoursePage', () => {
  it('renders heading and opens drawer when adding activity', () => {
    render(<ManageCoursePage />);

    // page title
    expect(screen.getByText(/Manage Course/i)).toBeInTheDocument();

    // click the mocked add activity button from SectionActivities
    const addBtn = screen.getByText('Add Activity');
    fireEvent.click(addBtn);

    // ActivityDrawerContent should appear with the section id
    expect(screen.getByTestId('activity-drawer')).toHaveTextContent('ActivityDrawer:sec-1');
  });
});
