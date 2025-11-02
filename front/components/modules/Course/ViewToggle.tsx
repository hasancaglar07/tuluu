"use client";

import { AlignHorizontalSpaceAround, AlignJustify } from "lucide-react";
import { FormattedMessage } from "react-intl";

interface ViewToggleProps {
  activeView: string;
  setView: (view: string) => void;
}

/**
 * Component to toggle between different dashboard views
 */
export const ViewToggle = ({ activeView, setView }: ViewToggleProps) => {
  return (
    <div className="flex gap-4">
      <FormattedMessage
        id="dashboard.viewToggle.label"
        defaultMessage="Change view:"
      />
      <button
        className={`cursor-pointer ${
          activeView === "game" ? "text-primary-500" : ""
        }`}
        onClick={() => setView("game")}
        aria-label="Game view"
      >
        <AlignHorizontalSpaceAround />
      </button>
      <button
        className={`cursor-pointer ${
          activeView === "pro" ? "text-primary-500" : ""
        }`}
        onClick={() => setView("pro")}
        aria-label="Pro view"
      >
        <AlignJustify />
      </button>
    </div>
  );
};
