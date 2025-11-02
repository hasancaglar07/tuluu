"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { FormattedMessage } from "react-intl";

/**
 * ProfileHeader Component
 *
 * Displays the header of the profile edit page with navigation and save buttons.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether the form is currently submitting
 * @param {boolean} props.isValid - Whether the form is valid and can be submitted
 * @param {Function} props.onSave - Function to call when save button is clicked
 * @param {Function} props.onBack - Function to call when back button is clicked
 */
export function ProfileHeader({
  isLoading,
  isValid,
  onSave,
  onBack,
}: {
  isLoading: boolean;
  isValid: boolean;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-primary-500 text-white">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">
          <FormattedMessage id="header.title" defaultMessage="Edit Profile" />
        </h1>
      </div>
      <Button
        type="button"
        onClick={onSave}
        disabled={isLoading || !isValid}
        className="bg-white text-primary-500 hover:bg-white/90"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        <FormattedMessage id="header.save" defaultMessage="Save Changes" />
      </Button>
    </div>
  );
}
