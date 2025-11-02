"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedMessage, useIntl } from "react-intl";
import { useCallback } from "react";
import { debounce } from "lodash";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: {
    id: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }[];
}

/**
 * SearchFilters - A reusable component for search and filter controls
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.searchQuery - The current search query
 * @param {Function} props.onSearchChange - Callback when search query changes
 * @param {Array} props.filters - Array of filter configurations
 *
 * @example
 * <SearchFilters
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   filters={[
 *     {
 *       id: "category",
 *       value: categoryFilter,
 *       options: categories.map(c => ({ value: c.id, label: c.name })),
 *       onChange: setCategoryFilter
 *     }
 *   ]}
 * />
 */
export function SearchFilters({
  searchQuery,
  onSearchChange,
  filters,
}: SearchFiltersProps) {
  // Debounce the search input to prevent too many requests
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 300),
    [onSearchChange]
  );
  const intl = useIntl();
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={intl.formatMessage({
            id: "shop.search.placeholder",
            defaultMessage: "Search...",
          })}
          className="pl-8"
          value={searchQuery}
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.id}
          value={filter.value}
          onValueChange={filter.onChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue
              placeholder={
                <FormattedMessage
                  id={`shop.filter.${filter.id}.placeholder`}
                  defaultMessage={
                    filter.id.charAt(0).toUpperCase() + filter.id.slice(1)
                  }
                />
              }
            />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <FormattedMessage
                  id={`shop.filter.${filter.id}.option.${option.value}`}
                  defaultMessage={option.label}
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
