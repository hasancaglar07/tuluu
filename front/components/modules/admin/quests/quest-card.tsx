"use client";

import {
  Calendar,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { FormattedMessage } from "react-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Quest } from "@/types";

interface QuestCardProps {
  /** Quest data to display */
  quest: Quest;
  /** Callback for editing the quest */
  onEdit: () => void;
  /** Callback for viewing quest details */
  onViewDetails: () => void;
  /** Callback for deleting the quest */
  onDelete: () => void;
  /** Callback for changing quest status */
  onStatusChange: (action: string) => void;
  /** Card variant for different display modes */
  variant?: "default" | "upcoming" | "expired";
}

/**
 * Quest Card Component
 *
 * Displays individual quest information in a card format.
 * Shows quest details, status, progress, and provides action menu.
 * Adapts display based on quest status and variant.
 *
 * @param {QuestCardProps} props - The component props
 * @returns {JSX.Element} Quest card with details and actions
 */
export function QuestCard({
  quest,
  onEdit,
  onViewDetails,
  onDelete,
  onStatusChange,
  variant = "default",
}: QuestCardProps) {
  /**
   * Returns appropriate status badge based on quest status
   * @param {string} status - Quest status
   * @returns {JSX.Element} Colored badge component
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500">
            <FormattedMessage
              id="admin.quests.status.active"
              defaultMessage="Active"
            />
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-blue-500">
            <FormattedMessage
              id="admin.quests.status.draft"
              defaultMessage="Draft"
            />
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-gray-500">
            <FormattedMessage
              id="admin.quests.status.expired"
              defaultMessage="Expired"
            />
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-yellow-500">
            <FormattedMessage
              id="admin.quests.status.paused"
              defaultMessage="Paused"
            />
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  /**
   * Returns appropriate type badge based on quest type
   * @param {string} type - Quest type
   * @returns {JSX.Element} Colored badge component
   */
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "daily":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            <FormattedMessage
              id="admin.quests.type.daily"
              defaultMessage="Daily"
            />
          </Badge>
        );
      case "weekly":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            <FormattedMessage
              id="admin.quests.type.weekly"
              defaultMessage="Weekly"
            />
          </Badge>
        );
      case "event":
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-700"
          >
            <FormattedMessage
              id="admin.quests.type.event"
              defaultMessage="Event"
            />
          </Badge>
        );
      case "custom":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-700"
          >
            <FormattedMessage
              id="admin.quests.type.custom"
              defaultMessage="Custom"
            />
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  /**
   * Formats reward display based on reward type
   * @param {Object} reward - Reward object with type and value
   * @returns {JSX.Element} Formatted reward display
   */
  const getRewardDisplay = (reward: {
    type: string;
    value: string | number;
  }) => {
    switch (reward.type) {
      case "xp":
        return (
          <span className="flex items-center gap-1">
            <FormattedMessage
              id="admin.quests.reward.xp"
              defaultMessage="{value} XP"
              values={{ value: reward.value }}
            />
          </span>
        );
      case "gems":
        return (
          <span className="flex items-center gap-1">
            <FormattedMessage
              id="admin.quests.reward.gems"
              defaultMessage="{value} Gems"
              values={{ value: reward.value }}
            />
          </span>
        );
      case "badge":
        return (
          <span className="flex items-center gap-1">
            <FormattedMessage
              id="admin.quests.reward.badge"
              defaultMessage="Badge: {value}"
              values={{ value: reward.value }}
            />
          </span>
        );
      default:
        return <span>{reward.value}</span>;
    }
  };

  /**
   * Renders the right panel content based on variant
   * @returns {JSX.Element} Right panel with metrics and actions
   */
  const renderRightPanel = () => {
    if (variant === "upcoming") {
      return (
        <div className="bg-muted p-6 md:w-[200px] flex flex-row md:flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              <FormattedMessage
                id="admin.quests.card.startsIn"
                defaultMessage="Starts In"
              />
            </p>
            <p className="text-lg font-bold flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <FormattedMessage
                id="admin.quests.card.daysCount"
                defaultMessage="{days} days"
                values={{
                  days: Math.ceil(
                    (quest.startDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  ),
                }}
              />
            </p>
          </div>
          <div className="mt-0 md:mt-4">
            <p className="text-xs text-muted-foreground">
              <FormattedMessage
                id="admin.quests.card.targetUsers"
                defaultMessage="Target Users"
              />
            </p>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <p className="text-sm font-medium">{quest.usersAssigned}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-0 md:mt-auto"
            onClick={onViewDetails}
          >
            <FormattedMessage
              id="admin.quests.actions.viewDetails"
              defaultMessage="View Details"
            />
          </Button>
        </div>
      );
    }

    if (variant === "expired") {
      return (
        <div className="bg-muted p-6 md:w-[200px] flex flex-row md:flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              <FormattedMessage
                id="admin.quests.card.finalCompletion"
                defaultMessage="Final Completion"
              />
            </p>
            <p className="text-2xl font-bold">{quest.completionRate}%</p>
          </div>
          <div className="mt-0 md:mt-4">
            <p className="text-xs text-muted-foreground">
              <FormattedMessage
                id="admin.quests.card.users"
                defaultMessage="Users"
              />
            </p>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <p className="text-sm font-medium">
                {quest.usersCompleted} / {quest.usersAssigned}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-0 md:mt-auto"
            onClick={onViewDetails}
          >
            <FormattedMessage
              id="admin.quests.actions.viewDetails"
              defaultMessage="View Details"
            />
          </Button>
        </div>
      );
    }

    // Default variant
    return (
      <div className="bg-muted p-6 md:w-[200px] flex flex-row md:flex-col justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="admin.quests.card.completionRate"
              defaultMessage="Completion Rate"
            />
          </p>
          <p className="text-2xl font-bold">{quest.completionRate}%</p>
        </div>
        <div className="mt-0 md:mt-4">
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="admin.quests.card.users"
              defaultMessage="Users"
            />
          </p>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <p className="text-sm font-medium">
              {quest.usersCompleted} / {quest.usersAssigned}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-0 md:mt-auto"
          onClick={onViewDetails}
        >
          <FormattedMessage
            id="admin.quests.actions.viewDetails"
            defaultMessage="View Details"
          />
        </Button>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{quest.title}</h3>
                {getStatusBadge(quest.status)}
                {getTypeBadge(quest.type)}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {quest.description}
              </p>
            </div>

            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDetails}>
                  <Eye className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.quests.actions.viewDetails"
                    defaultMessage="View Details"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.quests.actions.editQuest"
                    defaultMessage="Edit Quest"
                  />
                </DropdownMenuItem>
                {quest.status !== "expired" && (
                  <DropdownMenuItem
                    onClick={() => {
                      const action =
                        quest.status === "paused" ? "resume" : "pause";
                      onStatusChange(action);
                    }}
                  >
                    {quest.status === "paused" ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        <FormattedMessage
                          id="admin.quests.actions.resumeQuest"
                          defaultMessage="Resume Quest"
                        />
                      </>
                    ) : (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        <FormattedMessage
                          id="admin.quests.actions.pauseQuest"
                          defaultMessage="Pause Quest"
                        />
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {variant === "expired" && (
                  <DropdownMenuItem>
                    <Calendar className="mr-2 h-4 w-4" />
                    <FormattedMessage
                      id="admin.quests.actions.reschedule"
                      defaultMessage="Reschedule"
                    />
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.quests.actions.deleteQuest"
                    defaultMessage="Delete Quest"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quest Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground">
                <FormattedMessage
                  id="admin.quests.card.goal"
                  defaultMessage="Goal"
                />
              </p>
              <p className="text-sm font-medium">{quest.goal}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                <FormattedMessage
                  id="admin.quests.card.reward"
                  defaultMessage="Reward"
                />
              </p>
              <p className="text-sm font-medium">
                {getRewardDisplay(quest.reward)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                <FormattedMessage
                  id="admin.quests.card.target"
                  defaultMessage="Target"
                />
              </p>
              <p className="text-sm font-medium capitalize">
                {quest.targetSegment}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                <FormattedMessage
                  id="admin.quests.card.duration"
                  defaultMessage="Duration"
                />
              </p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(quest.startDate, "MMM d")} -{" "}
                {format(quest.endDate, "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        {renderRightPanel()}
      </div>
    </Card>
  );
}
