"use client";

import type { ShopItem } from "@/types/shop";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tag, DollarSign, Package, BarChart4 } from "lucide-react";
import Image from "next/image";
import { FormattedMessage } from "react-intl";

interface ShopItemCardProps {
  item: ShopItem;
  onSelect: () => void;
  formatCurrency: (amount: number, currency: string) => string;
  formatNumber: (num: number) => string;
}

/**
 * ShopItemCard - A card component to display shop item details
 *
 * @component
 * @param {Object} props - Component props
 * @param {ShopItem} props.item - The shop item to display
 * @param {Function} props.onSelect - Callback when the card is selected
 * @param {Function} props.formatCurrency - Function to format currency values
 * @param {Function} props.formatNumber - Function to format numbers with commas
 */
export function ShopItemCard({
  item,
  onSelect,
  formatCurrency,
  formatNumber,
}: ShopItemCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md overflow-hidden">
              <Image
                src={
                  item.image ??
                  "https://cdn-icons-png.flaticon.com/128/10252/10252905.png"
                }
                alt={item.name}
                className="h-full w-full object-cover"
                width={80}
                height={80}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription className="line-clamp-1">
                {item.description}
              </CardDescription>
            </div>
          </div>
          <Badge variant={item.status === "active" ? "default" : "secondary"}>
            <FormattedMessage
              id={`shop.item.status.${item.status}`}
              defaultMessage={item.status}
            />
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              <FormattedMessage id="shop.item.type" defaultMessage="Type:" />
            </span>
            <span className="font-medium">
              <FormattedMessage
                id={`shop.item.type.${item.type}`}
                defaultMessage={item.type}
              />
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              <FormattedMessage id="shop.item.price" defaultMessage="Price:" />
            </span>
            <span className="font-medium">
              {formatCurrency(item.price, item.currency)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              <FormattedMessage id="shop.item.stock" defaultMessage="Stock:" />
            </span>
            <span className="font-medium">{item.stockQuantity ?? "∞"}</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              <FormattedMessage
                id="shop.item.purchases"
                defaultMessage="Purchases:"
              />
            </span>
            <span className="font-medium">
              {formatNumber(item.purchases ?? 0)}
            </span>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="p-4 pt-3">
        <Button variant="ghost" className="w-full" onClick={onSelect}>
          <FormattedMessage
            id="shop.item.view-details"
            defaultMessage="View Details"
          />
        </Button>
      </CardFooter>
    </Card>
  );
}
