"use client";

import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Download, Filter, Plus } from "lucide-react";

interface PaymentsActionsToolbarProps {
  onFilter?: () => void;
  onExport?: () => void;
  onNew?: () => void;
}

/**
 * Actions toolbar component for payments management
 * Contains filter, export, and new action buttons
 */
export function PaymentsActionsToolbar({
  onFilter,
  onExport,
  onNew,
}: PaymentsActionsToolbarProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onFilter}>
        <Filter className="mr-2 h-4 w-4" />
        <FormattedMessage
          id="admin.payments.actions.filter"
          defaultMessage="Filter"
        />
      </Button>
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        <FormattedMessage
          id="admin.payments.actions.export"
          defaultMessage="Export"
        />
      </Button>
      <Button size="sm" onClick={onNew}>
        <Plus className="mr-2 h-4 w-4" />
        <FormattedMessage
          id="admin.payments.actions.new"
          defaultMessage="New"
        />
      </Button>
    </div>
  );
}
