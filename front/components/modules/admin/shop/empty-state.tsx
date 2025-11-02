"use client";

import { type LucideIcon } from 'lucide-react';
import { FormattedMessage } from "react-intl";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * EmptyState - A component to display when no items are found
 * 
 * @component
 * @param {Object} props - Component props
 * @param {LucideIcon} props.icon - The icon to display
 * @param {string} props.title - The title text
 * @param {string} props.description - The description text
 * 
 * @example
 * <EmptyState
 *   icon={Package}
 *   title="No items found"
 *   description="Try adjusting your search or filter criteria"
 * />
 */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-10">
      <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-lg font-semibold">
        <FormattedMessage
          id={`shop.empty-state.${title.toLowerCase().replace(/\s+/g, '-')}.title`}
          defaultMessage={title}
        />
      </h3>
      <p className="text-sm text-muted-foreground">
        <FormattedMessage
          id={`shop.empty-state.${title.toLowerCase().replace(/\s+/g, '-')}.description`}
          defaultMessage={description}
        />
      </p>
    </div>
  );
}
