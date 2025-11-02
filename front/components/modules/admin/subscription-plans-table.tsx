"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Check,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import axios, { AxiosError } from "axios";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string[];
  active: boolean;
  trialDays: number;
  currency: string;
  checkoutLink: string;
}

export function SubscriptionPlansTable() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();

      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL +
          "/api/admin/payments/subscription-plans",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPlans(response.data.data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load subscription plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;

    try {
      const token = await getToken();
      setIsLoading(true);
      await axios.patch(
        process.env.NEXT_PUBLIC_API_URL +
          `/api/admin/payments/subscription-plans/${id}`,
        { active: !plan.active },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPlans(
        plans.map((plan) =>
          plan.id === id ? { ...plan, active: !plan.active } : plan
        )
      );

      toast.success(
        `Plan ${!plan.active ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete plan";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setIsDialogOpen(true);
  };

  const openNewPlanDialog = () => {
    setCurrentPlan({
      id: "",
      name: "",
      description: "",
      price: 0,
      billingCycle: "monthly",
      features: [],
      active: true,
      trialDays: 7,
      currency: "USD",
      checkoutLink: "",
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePlan = async () => {
    if (!currentPlan) return;

    try {
      setIsLoading(true);
      const token = await getToken();

      await axios.delete(
        process.env.NEXT_PUBLIC_API_URL +
          `/api/admin/payments/subscription-plans/${currentPlan.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPlans(plans.filter((plan) => plan.id !== currentPlan.id));
      setIsDeleteDialogOpen(false);

      toast.success("Plan deleted successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete plan";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    setIsLoading(true);
    if (!currentPlan) return;
    try {
      // Get Clerk token for authorization header
      const token = await getToken();

      let response;
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (plans.some((plan) => plan.id === currentPlan.id)) {
        // Update existing plan
        response = await axios.put(
          process.env.NEXT_PUBLIC_API_URL +
            `/api/admin/payments/subscription-plans/${currentPlan.id}`,
          currentPlan,
          config
        );
      } else {
        // Create new plan
        response = await axios.post(
          process.env.NEXT_PUBLIC_API_URL +
            "/api/admin/payments/subscription-plans",
          currentPlan,
          config
        );
      }

      const savedPlan = response.data.data;

      console.log(savedPlan);
      if (plans.some((plan) => plan.id === currentPlan.id)) {
        setPlans(
          plans.map((plan) =>
            plan.id === currentPlan.id ? savedPlan.plan : plan
          )
        );
      } else {
        setPlans([...plans, savedPlan.plan]);
      }

      toast(`Plan ${currentPlan.id ? "updated" : "created"} successfully`);
    } catch (err) {
      const error = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      const apiErrors = error.response?.data?.errors;
      const message = error.response?.data?.message;

      if (apiErrors && typeof apiErrors === "object") {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`));
          }
        });
      } else {
        toast.error(message || "Failed to delete language.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        Loading subscription plans...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-4">
        <p className="text-red-500 mb-2">Error: {error}</p>
        <Button disabled={isLoading} onClick={fetchSubscriptionPlans}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button disabled={isLoading} onClick={openNewPlanDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Trial</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans &&
              plans.map((plan) => (
                <TableRow key={plan?.id}>
                  <TableCell className="font-medium">
                    <div>
                      {plan.name}
                      <p className="text-xs text-muted-foreground">
                        {plan?.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    ${plan?.price.toFixed(2)} {plan.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {plan.billingCycle.charAt(0).toUpperCase() +
                        plan?.billingCycle.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {plan?.trialDays > 0
                      ? `${plan.trialDays} days`
                      : "No trial"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plan?.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="mr-1">
                          {feature}
                        </Badge>
                      ))}
                      {plan?.features.length > 2 && (
                        <Badge variant="outline">
                          +{plan?.features.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={plan.active}
                        onCheckedChange={() => handleToggleActive(plan.id)}
                      />
                      <span
                        className={
                          plan.active
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {plan.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(plan.id)}
                        >
                          {plan.active ? (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(plan)}
                        >
                          {isLoading && <Loader2 className="animate-spin" />}
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {currentPlan && currentPlan.name
                ? `Edit ${currentPlan.name}`
                : "Create New Subscription Plan"}
            </DialogTitle>
            <DialogDescription>
              Configure the subscription plan details. Click save when
              you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePlan}>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Trial</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Name</Label>
                    <Input
                      id="name"
                      value={currentPlan?.name || ""}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan!,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Checkout link</Label>
                    <Input
                      id="checkoutLink"
                      value={currentPlan?.checkoutLink || ""}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan!,
                          checkoutLink: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={currentPlan?.description || ""}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan!,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingCycle">Billing Interval</Label>
                    <select
                      id="billingCycle"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={currentPlan?.billingCycle || "monthly"}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan!,
                          billingCycle: e.target.value,
                        })
                      }
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={currentPlan?.active || false}
                      onCheckedChange={(checked) =>
                        setCurrentPlan({ ...currentPlan!, active: checked })
                      }
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4 py-4">
                <div className="space-y-4">
                  <Label>Plan Features</Label>
                  <div className="space-y-2">
                    {currentPlan?.features?.map(
                      (feature: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...currentPlan.features];
                              newFeatures[index] = e.target.value;
                              setCurrentPlan({
                                ...currentPlan,
                                features: newFeatures,
                              });
                            }}
                          />
                          <Button
                            disabled={isLoading}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFeatures = currentPlan.features.filter(
                                (_: unknown, i: number) => i !== index
                              );
                              setCurrentPlan({
                                ...currentPlan,
                                features: newFeatures,
                              });
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      disabled={isLoading}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newFeatures = [
                          ...(currentPlan?.features || []),
                          "",
                        ];
                        setCurrentPlan({
                          ...currentPlan!,
                          features: newFeatures,
                        });
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Feature
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        $
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        className="rounded-l-none"
                        value={currentPlan?.price || 0}
                        onChange={(e) =>
                          setCurrentPlan({
                            ...currentPlan!,
                            price: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={currentPlan?.currency || "USD"}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan!,
                          currency: e.target.value,
                        })
                      }
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trialDays">Trial Period (Days)</Label>
                    <Input
                      id="trialDays"
                      type="number"
                      min="0"
                      value={currentPlan?.trialDays || 0}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan!,
                          trialDays: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>Regional Pricing (Coming Soon)</Label>
                  <div className="p-4 border rounded-md bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Regional pricing allows you to set different prices for
                      different regions. This feature will be available soon.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                disabled={isLoading}
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={isLoading} className="flex-1" type="submit">
                {isLoading && <Loader2 className="animate-spin" />}
                Save Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {currentPlan?.name} plan? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isLoading}
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              variant="destructive"
              onClick={handleDeletePlan}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
