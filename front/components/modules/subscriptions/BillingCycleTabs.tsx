import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FormattedMessage } from "react-intl";

interface BillingCycleTabsProps {
  value: string;
  onChange: (cycle: string) => void;
}

// 📦 Tabs for selecting Monthly or Yearly billing cycle
export default function BillingCycleTabs({
  value,
  onChange,
}: BillingCycleTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-fit mx-auto">
      <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm my-4">
        <TabsTrigger
          value="monthly"
          className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
        >
          <FormattedMessage
            defaultMessage="Monthly"
            id="subscriptions.billing.monthly"
          />
        </TabsTrigger>
        <TabsTrigger
          value="yearly"
          className="data-[state=active]:bg-secondary-500 data-[state=active]:text-white"
        >
          <FormattedMessage
            defaultMessage="Yearly"
            id="subscriptions.billing.yearly"
          />
          <Badge
            variant="secondary"
            className="ml-2 bg-green-100 text-green-700"
          >
            <FormattedMessage
              defaultMessage="Save + 25%"
              id="subscriptions.save25"
            />
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
