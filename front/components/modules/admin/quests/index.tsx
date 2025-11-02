"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FormattedMessage } from "react-intl";

import { QuestsHeader } from "./quests-header";
import { QuestsSummaryCards } from "./quests-summary-cards";
import { QuestsFilters } from "./quests-filters";
import { QuestsTabsView } from "./quests-tabs-view";
import { QuestFormDialog } from "./dialogs/quest-form-dialog";
import { QuestDetailsDialog } from "./dialogs/quest-details-dialog";
import { LoadingState } from "./loading-state";
import { ErrorState } from "./error-state";

// Import types
import type { Quest, QuestSummary } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";

/**
 * Main Quests Management Page Component
 *
 * This component serves as the main container for the quests management interface.
 * It handles:
 * - Fetching and managing quests data from the API
 * - Managing filter and search state
 * - Handling quest CRUD operations (Create, Read, Update, Delete)
 * - Managing dialog states for quest forms and details
 * - Providing data to child components
 *
 * @returns {JSX.Element} The complete quests management interface
 */
export default function QuestsManagementPage() {
  // State for quests data
  const [quests, setQuests] = useState<Quest[]>([]);
  const [summary, setSummary] = useState<QuestSummary>({
    totalActiveQuests: 0,
    totalUpcomingQuests: 0,
    averageCompletionRate: 0,
    totalUsersEngaged: 0,
    totalCompletedQuests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Dialog state
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { getToken } = useAuth();

  /**
   * Fetches quests from the API with current filters applied
   * Handles loading states, error handling, and data transformation
   */
  const fetchQuests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
        limit: "50",
        page: "1",
      });

      const token = await getToken();

      const response = await apiClient.get(`/api/admin/quests?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch quests");
      }

      // Transform the data to ensure dates are properly parsed
      const transformedQuests = data.data.map((quest: Quest) => ({
        ...quest,
        startDate: new Date(quest.startDate),
        endDate: new Date(quest.endDate),
        createdAt: new Date(quest.createdAt),
        updatedAt: new Date(quest.updatedAt),
      }));

      setQuests(transformedQuests);
      setSummary(data.summary);
    } catch (err) {
      console.error("Error fetching quests:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch quests");
      toast.error(
        <FormattedMessage
          id="admin.quests.errors.fetchFailed"
          defaultMessage="Failed to load quests"
        />
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch quests on component mount and when filters change
  useEffect(() => {
    fetchQuests();
  }, [searchQuery, statusFilter, typeFilter]);

  /**
   * Handles successful quest creation
   * Updates the local state and shows success message
   */
  const handleQuestCreated = (newQuest: Quest) => {
    setQuests((prev) => [newQuest, ...prev]);
    setIsCreateDialogOpen(false);
    toast.success(
      <FormattedMessage
        id="admin.quests.success.created"
        defaultMessage="Quest created successfully"
      />
    );
    fetchQuests();
  };

  /**
   * Handles successful quest update
   * Updates the local state and shows success message
   */
  const handleQuestUpdated = (updatedQuest: Quest) => {
    setQuests((prev) =>
      prev.map((quest) => (quest.id === updatedQuest.id ? updatedQuest : quest))
    );
    setIsEditDialogOpen(false);
    toast.success(
      <FormattedMessage
        id="admin.quests.success.updated"
        defaultMessage="Quest updated successfully"
      />
    );
    fetchQuests();
  };

  /**
   * Handles quest deletion
   * Sends DELETE request to API and updates local state
   */
  const handleDeleteQuest = async (questId: string) => {
    try {
      const token = await getToken();
      const response = await apiClient.delete(`/api/admin/quests/${questId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || "Failed to delete quest");
      }

      setQuests((prev) => prev.filter((quest) => quest.id !== questId));
      toast.success(
        <FormattedMessage
          id="admin.quests.success.deleted"
          defaultMessage="Quest deleted successfully"
        />
      );
      fetchQuests();
    } catch (err) {
      console.error("Error deleting quest:", err);
      toast.error(
        <FormattedMessage
          id="admin.quests.errors.deleteFailed"
          defaultMessage="Failed to delete quest"
        />
      );
    }
  };

  /**
   * Handles quest status changes (pause/resume)
   * Sends PATCH request to API and updates local state
   */
  const handleStatusChange = async (questId: string, action: string) => {
    try {
      const token = await getToken();
      const response = await apiClient.patch(
        `/api/admin/quests/${questId}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || "Failed to update quest status");
      }

      setQuests((prev) =>
        prev.map((quest) =>
          quest.id === questId
            ? {
                ...quest,
                status: data.data.status,
                updatedAt: new Date(data.data.updatedAt),
              }
            : quest
        )
      );
      toast.success(data.message);
    } catch (err) {
      console.error("Error updating quest status:", err);
      toast.error(
        <FormattedMessage
          id="admin.quests.errors.statusUpdateFailed"
          defaultMessage="Failed to update quest status"
        />
      );
    }
  };

  /**
   * Opens the edit dialog for a specific quest
   */
  const handleEditQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsEditDialogOpen(true);
  };

  /**
   * Fetches detailed quest information and opens the details dialog
   */
  const handleViewDetails = async (quest: Quest) => {
    try {
      const token = await getToken();
      const response = await apiClient.get(`/api/admin/quests/${quest.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch quest details");
      }

      const detailedQuest = {
        ...data.data,
        startDate: new Date(data.data.startDate),
        endDate: new Date(data.data.endDate),
        createdAt: new Date(data.data.createdAt),
        updatedAt: new Date(data.data.updatedAt),
      };

      setSelectedQuest(detailedQuest);
      setIsDetailsDialogOpen(true);
    } catch (err) {
      console.error("Error fetching quest details:", err);
      toast.error(
        <FormattedMessage
          id="admin.quests.errors.detailsFetchFailed"
          defaultMessage="Failed to load quest details"
        />
      );
    }
  };

  /**
   * Clears all active filters
   */
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={fetchQuests} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <QuestsHeader onCreateQuest={() => setIsCreateDialogOpen(true)} />

      {/* Summary Cards */}
      <QuestsSummaryCards summary={summary} />

      {/* Filters */}
      <QuestsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Quests Tabs View */}
      <QuestsTabsView
        quests={quests}
        activeTab={activeTab}
        onEditQuest={handleEditQuest}
        onViewDetails={handleViewDetails}
        onDeleteQuest={handleDeleteQuest}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
      />

      {/* Create Quest Dialog */}
      <QuestFormDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleQuestCreated}
        mode="create"
      />

      {/* Edit Quest Dialog */}
      <QuestFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleQuestUpdated}
        mode="edit"
        quest={selectedQuest}
      />

      {/* Quest Details Dialog */}
      <QuestDetailsDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        quest={selectedQuest}
        onEdit={() => {
          setIsDetailsDialogOpen(false);
          if (selectedQuest) handleEditQuest(selectedQuest);
        }}
      />
    </div>
  );
}
