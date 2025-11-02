"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Title message to display */
  title: ReactNode;
  /** Optional action button or element */
  action?: ReactNode;
}

/**
 * Empty State Component
 *
 * Displays a message when no quests match the current filters.
 * Provides option to clear filters or take other actions.
 *
 * @param {EmptyStateProps} props - The component props
 * @returns {JSX.Element} Empty state with message and optional action
 */
export function EmptyState({ title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
      <p className="text-muted-foreground">{title}</p>
      {action && action}
    </div>
  );
}
