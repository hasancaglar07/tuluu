"use client";

import { Search, Filter } from "lucide-react";
import { FormattedMessage } from "react-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuestsFiltersProps {
  /** Current search query */
  searchQuery: string;
  /** Callback for search query changes */
  onSearchChange: (query: string) => void;
  /** Current status filter */
  statusFilter: string;
  /** Callback for status filter changes */
  onStatusFilterChange: (status: string) => void;
  /** Current type filter */
  typeFilter: string;
  /** Callback for type filter changes */
  onTypeFilterChange: (type: string) => void;
  /** Currently active tab */
  activeTab: string;
  /** Callback for tab changes */
  onTabChange: (tab: string) => void;
}

/**
 * Quests Filters Component
 *
 * Provides filtering and search functionality for the quests list.
 * Includes tabs for different quest states, search input, and filter dropdowns.
 *
 * @param {QuestsFiltersProps} props - The component props
 * @returns {JSX.Element} Filter controls and tabs for quest management
 */
export function QuestsFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  activeTab,
  onTabChange,
}: QuestsFiltersProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        {/* Tabs for different quest views */}
        <TabsList>
          <TabsTrigger value="all">
            <FormattedMessage
              id="admin.quests.tabs.all"
              defaultMessage="All Quests"
            />
          </TabsTrigger>
          <TabsTrigger value="active">
            <FormattedMessage
              id="admin.quests.tabs.active"
              defaultMessage="Active"
            />
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <FormattedMessage
              id="admin.quests.tabs.upcoming"
              defaultMessage="Upcoming"
            />
          </TabsTrigger>
          <TabsTrigger value="expired">
            <FormattedMessage
              id="admin.quests.tabs.expired"
              defaultMessage="Expired"
            />
          </TabsTrigger>
        </TabsList>

        {/* Search and Filter Controls */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search quests..."
              className="pl-8 w-[200px] sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>
                <FormattedMessage
                  id="admin.quests.filters.title"
                  defaultMessage="Filter Quests"
                />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Status Filter */}
              <div className="p-2">
                <p className="text-sm font-medium mb-2">
                  <FormattedMessage
                    id="admin.quests.filters.status"
                    defaultMessage="Status"
                  />
                </p>
                <Select
                  value={statusFilter}
                  onValueChange={onStatusFilterChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <FormattedMessage
                        id="admin.quests.filters.status.all"
                        defaultMessage="All Statuses"
                      />
                    </SelectItem>
                    <SelectItem value="active">
                      <FormattedMessage
                        id="admin.quests.filters.status.active"
                        defaultMessage="Active"
                      />
                    </SelectItem>
                    <SelectItem value="draft">
                      <FormattedMessage
                        id="admin.quests.filters.status.draft"
                        defaultMessage="Draft"
                      />
                    </SelectItem>
                    <SelectItem value="expired">
                      <FormattedMessage
                        id="admin.quests.filters.status.expired"
                        defaultMessage="Expired"
                      />
                    </SelectItem>
                    <SelectItem value="paused">
                      <FormattedMessage
                        id="admin.quests.filters.status.paused"
                        defaultMessage="Paused"
                      />
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenuSeparator />

              {/* Type Filter */}
              <div className="p-2">
                <p className="text-sm font-medium mb-2">
                  <FormattedMessage
                    id="admin.quests.filters.type"
                    defaultMessage="Type"
                  />
                </p>
                <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <FormattedMessage
                        id="admin.quests.filters.type.all"
                        defaultMessage="All Types"
                      />
                    </SelectItem>
                    <SelectItem value="daily">
                      <FormattedMessage
                        id="admin.quests.filters.type.daily"
                        defaultMessage="Daily"
                      />
                    </SelectItem>
                    <SelectItem value="weekly">
                      <FormattedMessage
                        id="admin.quests.filters.type.weekly"
                        defaultMessage="Weekly"
                      />
                    </SelectItem>
                    <SelectItem value="event">
                      <FormattedMessage
                        id="admin.quests.filters.type.event"
                        defaultMessage="Event"
                      />
                    </SelectItem>
                    <SelectItem value="custom">
                      <FormattedMessage
                        id="admin.quests.filters.type.custom"
                        defaultMessage="Custom"
                      />
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Tabs>
  );
}
