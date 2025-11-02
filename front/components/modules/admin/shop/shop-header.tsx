"use client";

import { FormattedMessage } from "react-intl";

interface ShopHeaderProps {
  title: string;
  description: string;
}

/**
 * ShopHeader - A reusable header component for shop-related pages
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display in the header
 * @param {string} props.description - The description text to display below the title
 *
 * @example
 * <ShopHeader
 *   title="Shop Management"
 *   description="Create, edit, and manage items in your in-app shop"
 * />
 */
export function ShopHeader({ title, description }: ShopHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        <FormattedMessage
          id={`shop.header.${title.toLowerCase().replace(/\s+/g, "-")}.title`}
          defaultMessage={title}
        />
      </h1>
      <p className="text-muted-foreground">
        <FormattedMessage
          id={`shop.header.${title
            .toLowerCase()
            .replace(/\s+/g, "-")}.description`}
          defaultMessage={description}
        />
      </p>
    </div>
  );
}
