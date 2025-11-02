"use client";

import type React from "react";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Copy,
  Edit,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data for promo codes
const promoCodes = [
  {
    id: "promo-1",
    code: "WELCOME20",
    discountType: "percentage",
    discountValue: 20,
    maxUses: 1000,
    usedCount: 450,
    startDate: "2023-05-01",
    endDate: "2023-06-30",
    active: true,
    description: "20% off for new users",
  },
  {
    id: "promo-2",
    code: "SUMMER2023",
    discountType: "percentage",
    discountValue: 15,
    maxUses: 500,
    usedCount: 123,
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    active: true,
    description: "Summer sale discount",
  },
  {
    id: "promo-3",
    code: "FLAT10",
    discountType: "fixed",
    discountValue: 10,
    maxUses: 200,
    usedCount: 45,
    startDate: "2023-05-15",
    endDate: "2023-07-15",
    active: true,
    description: "$10 off any subscription",
  },
  {
    id: "promo-4",
    code: "YEARLY50",
    discountType: "percentage",
    discountValue: 50,
    maxUses: 100,
    usedCount: 98,
    startDate: "2023-04-01",
    endDate: "2023-04-30",
    active: false,
    description: "50% off yearly subscriptions",
  },
  {
    id: "promo-5",
    code: "PREMIUM25",
    discountType: "percentage",
    discountValue: 25,
    maxUses: 300,
    usedCount: 75,
    startDate: "2023-05-01",
    endDate: "2023-12-31",
    active: true,
    description: "25% off premium subscriptions",
  },
];

export function PromoCodesTable() {
  const [codes, setCodes] = useState(promoCodes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const openEditDialog = (code: any) => {
    setCurrentCode(code);
    setStartDate(code.startDate ? new Date(code.startDate) : undefined);
    setEndDate(code.endDate ? new Date(code.endDate) : undefined);
    setIsDialogOpen(true);
  };

  const openNewCodeDialog = () => {
    const newCode = {
      id: `promo-${codes.length + 1}`,
      code: "",
      discountType: "percentage",
      discountValue: 10,
      maxUses: 100,
      usedCount: 0,
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(
        new Date(new Date().setMonth(new Date().getMonth() + 1)),
        "yyyy-MM-dd"
      ),
      active: true,
      description: "",
    };
    setCurrentCode(newCode);
    setStartDate(new Date());
    setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 1)));
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (code: any) => {
    setCurrentCode(code);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCode = () => {
    setCodes(codes.filter((code) => code.id !== currentCode.id));
    setIsDeleteDialogOpen(false);
  };

  const handleSaveCode = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCode = {
      ...currentCode,
      startDate: startDate
        ? format(startDate, "yyyy-MM-dd")
        : currentCode.startDate,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : currentCode.endDate,
    };

    if (codes.some((code) => code.id === currentCode.id)) {
      setCodes(
        codes.map((code) => (code.id === currentCode.id ? updatedCode : code))
      );
    } else {
      setCodes([...codes, updatedCode]);
    }
    setIsDialogOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you would show a toast notification here
  };

  const getUsagePercentage = (used: number, max: number) => {
    return Math.round((used / max) * 100);
  };

  const getStatusBadge = (code: any) => {
    const now = new Date();
    const start = new Date(code.startDate);
    const end = new Date(code.endDate);

    if (!code.active) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Inactive
        </Badge>
      );
    }

    if (now < start) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Scheduled
        </Badge>
      );
    }

    if (now > end) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Expired
        </Badge>
      );
    }

    if (code.usedCount >= code.maxUses) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          Exhausted
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        Active
      </Badge>
    );
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openNewCodeDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Promo Code
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((code) => (
              <TableRow key={code.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{code.code}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {code.description}
                  </p>
                </TableCell>
                <TableCell>
                  {code.discountType === "percentage"
                    ? `${code.discountValue}%`
                    : `$${code.discountValue.toFixed(2)}`}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-xs">
                      {code.usedCount} / {code.maxUses} (
                      {getUsagePercentage(code.usedCount, code.maxUses)}%)
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${getUsagePercentage(
                            code.usedCount,
                            code.maxUses
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <div>Start: {code.startDate}</div>
                    <div>End: {code.endDate}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(code)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openEditDialog(code)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => copyToClipboard(code.code)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => openDeleteDialog(code)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Promo Code Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {currentCode && currentCode.code
                ? `Edit ${currentCode.code}`
                : "Create New Promo Code"}
            </DialogTitle>
            <DialogDescription>
              Configure the promo code details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCode}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <Input
                  id="code"
                  value={currentCode?.code || ""}
                  onChange={(e) =>
                    setCurrentCode({
                      ...currentCode,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. SUMMER2023"
                  className="uppercase"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={currentCode?.description || ""}
                  onChange={(e) =>
                    setCurrentCode({
                      ...currentCode,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. Summer sale discount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <select
                    id="discountType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={currentCode?.discountType || "percentage"}
                    onChange={(e) =>
                      setCurrentCode({
                        ...currentCode,
                        discountType: e.target.value,
                      })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountValue">Discount Value</Label>
                  <div className="flex">
                    {currentCode?.discountType === "fixed" && (
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        $
                      </span>
                    )}
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      step={
                        currentCode?.discountType === "fixed" ? "0.01" : "1"
                      }
                      className={
                        currentCode?.discountType === "fixed"
                          ? "rounded-l-none"
                          : ""
                      }
                      value={currentCode?.discountValue || 0}
                      onChange={(e) =>
                        setCurrentCode({
                          ...currentCode,
                          discountValue: Number.parseFloat(e.target.value),
                        })
                      }
                    />
                    {currentCode?.discountType === "percentage" && (
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm">
                        %
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Maximum Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={currentCode?.maxUses || 100}
                  onChange={(e) =>
                    setCurrentCode({
                      ...currentCode,
                      maxUses: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={currentCode?.active || false}
                  onChange={(e) =>
                    setCurrentCode({ ...currentCode, active: e.target.checked })
                  }
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promo Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{currentCode?.code}" promo
              code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCode}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
