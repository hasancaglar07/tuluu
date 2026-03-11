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
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      toast.error("Abonelik planları yüklenemedi");
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
        `Plan başarıyla ${!plan.active ? "etkinleştirildi" : "pasife alındı"}`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Plan silinemedi";
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
        err instanceof Error ? err.message : "Plan silinemedi";
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

      toast(`Plan başarıyla ${currentPlan.id ? "güncellendi" : "oluşturuldu"}`);
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
        toast.error(message || "Plan kaydedilemedi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        Abonelik planları yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-4">
        <p className="text-red-500 mb-2">Hata: {error}</p>
        <Button disabled={isLoading} onClick={fetchSubscriptionPlans}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button disabled={isLoading} onClick={openNewPlanDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Plan Ekle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Periyot</TableHead>
              <TableHead>Deneme</TableHead>
              <TableHead>Özellikler</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
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
                      {plan.billingCycle === "monthly"
                        ? "Aylık"
                        : plan.billingCycle === "yearly"
                        ? "Yıllık"
                        : plan.billingCycle === "one-time"
                        ? "Tek Seferlik"
                        : plan.billingCycle}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {plan?.trialDays > 0
                      ? `${plan.trialDays} gün`
                      : "Deneme yok"}
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
                          +{plan?.features.length - 2} daha
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
                        {plan.active ? "Aktif" : "Pasif"}
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
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Planı Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(plan.id)}
                        >
                          {plan.active ? (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Pasife Al
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Etkinleştir
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(plan)}
                        >
                          {isLoading && <Loader2 className="animate-spin" />}
                          <Trash className="mr-2 h-4 w-4" />
                          Planı Sil
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
                ? `${currentPlan.name} Planını Düzenle`
                : "Yeni Abonelik Planı Oluştur"}
            </DialogTitle>
            <DialogDescription>
              Abonelik planı detaylarını yapılandırın. İşiniz bittiğinde kaydedin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePlan}>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Temel Bilgiler</TabsTrigger>
                <TabsTrigger value="features">Özellikler</TabsTrigger>
                <TabsTrigger value="pricing">Fiyat & Deneme</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Adı</Label>
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
                    <Label htmlFor="name">Ödeme bağlantısı</Label>
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
                    <Label htmlFor="description">Açıklama</Label>
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
                    <Label htmlFor="billingCycle">Faturalama Periyodu</Label>
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
                      <option value="monthly">Aylık</option>
                      <option value="yearly">Yıllık</option>
                      <option value="one-time">Tek Seferlik</option>
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
                    <Label htmlFor="active">Aktif</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4 py-4">
                <div className="space-y-4">
                  <Label>Plan Özellikleri</Label>
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
                      Özellik Ekle
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Fiyat</Label>
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
                    <Label htmlFor="currency">Para Birimi</Label>
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
                    <Label htmlFor="trialDays">Deneme Süresi (Gün)</Label>
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
                  <Label>Bölgesel Fiyatlandırma (Yakında)</Label>
                  <div className="p-4 border rounded-md bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Bölgesel fiyatlandırma, farklı bölgeler için farklı fiyat
                      belirlemenizi sağlar. Bu özellik yakında aktif olacak.
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
                Vazgeç
              </Button>
              <Button disabled={isLoading} className="flex-1" type="submit">
                {isLoading && <Loader2 className="animate-spin" />}
                Planı Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abonelik Planını Sil</DialogTitle>
            <DialogDescription>
              {currentPlan?.name} planını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isLoading}
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Vazgeç
            </Button>
            <Button
              disabled={isLoading}
              variant="destructive"
              onClick={handleDeletePlan}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
