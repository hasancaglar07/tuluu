// "use client";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { Switch } from "@/components/ui/switch";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   CreditCard,
//   DollarSign,
//   Globe,
//   Loader2,
//   Save,
//   Settings,
// } from "lucide-react";
// import { useState, useEffect, useCallback } from "react";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { AxiosError } from "axios";
// import { useAuth } from "@clerk/nextjs";
// import { toast } from "sonner";
// import Loading from "@/components/custom/loading";
// import {
//   mapToProviderSettings,
//   organizeProviders,
//   ProviderApiResponse,
// } from "@/lib/utils";
// import { apiClient } from "@/lib/api-client";

// // Define types
// type PaymentSettings = {
//   general: GeneralSettings;
//   providers: ProviderSettings;
//   currencies: CurrencySettings;
//   regional: RegionalSettings;
// };

// type GeneralSettings = {
//   enablePayments: boolean;
//   testMode: boolean;
//   autoRetryFailedPayments: boolean;
//   sendPaymentReceipts: boolean;
//   companyName: string;
//   companyAddress: string;
//   billingEmail: string;
//   billingPhone: string;
// };

// type ProviderSettings = {
//   stripeEnabled: boolean;
//   stripePublicKey: string;
//   stripeSecretKey: string;
//   stripeWebhookSecret: string;
//   paypalEnabled: boolean;
//   paypalClientId: string;
//   paypalSecret: string;
//   googlePayEnabled: boolean;
//   googleMerchantId: string;
// };

// type CurrencySettings = {
//   defaultCurrency: string;
//   autoUpdateExchangeRates: boolean;
//   gemsEnabled: boolean;
//   gemsExchangeRate: number;
//   gemsDailyBonus: number;
//   heartsEnabled: boolean;
//   heartsGemsCost: number;
//   heartsRefillTime: number;
// };

// type RegionalSettings = {
//   regionalPricingEnabled: boolean;
//   taxCalculationEnabled: boolean;
//   regions: Region[];
// };

// type Region = {
//   id: string;
//   name: string;
//   currency: string;
//   priceMultiplier: number;
//   taxRate: number;
//   status: "active" | "pending" | "inactive";
// };

// const regionSchema = z.object({
//   name: z.string().min(2, {
//     message: "Region Name must be at least 2 characters.",
//   }),
//   currency: z.string().min(3, {
//     message: "Currency must be a valid currency code.",
//   }),
//   priceMultiplier: z.number(),
//   taxRate: z.number(),
//   status: z.enum(["active", "pending", "inactive"]),
// });

// export default function PaymentSettingsPage() {
//   const [settings, setSettings] = useState<PaymentSettings | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isAddRegionDialogOpen, setIsAddRegionDialogOpen] = useState(false);
//   const { getToken } = useAuth();

//   // Form for adding a new region
//   const addRegionForm = useForm<z.infer<typeof regionSchema>>({
//     resolver: zodResolver(regionSchema),
//     defaultValues: {
//       name: "",
//       currency: "USD",
//       priceMultiplier: 1.0,
//       taxRate: 0,
//       status: "active",
//     },
//   });

//   const {
//     register: registerRegion,
//     handleSubmit: handleRegionSubmit,
//     formState: { errors: regionErrors },
//     reset: resetRegionForm,
//   } = addRegionForm;

//   // Fetch settings on mount
//   useEffect(() => {
//     const fetchSettings = async () => {
//       setLoading(true);
//       try {
//         const token = await getToken();

//         const res = await apiClient.get("/api/admin/payments/settings", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             includeSecrets: false, // or "true" if you want secrets
//             version: 1, // or specify a version string
//             isActive: true, // or "false" or whatever is valid
//           },
//         });

//         setSettings(res.data.data);
//       } catch (err) {
//         const error = err as AxiosError<{
//           message?: string;
//           errors?: Record<string, string[]>;
//         }>;

//         const apiErrors = error.response?.data?.errors;
//         const message = error.response?.data?.message;

//         if (apiErrors && typeof apiErrors === "object") {
//           Object.entries(apiErrors).forEach(([field, messages]) => {
//             if (Array.isArray(messages)) {
//               messages.forEach((msg) => toast.error(`${field}: ${msg}`));
//             }
//           });
//         } else {
//           toast.error(message || "An unknown error occurred.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSettings();
//   }, [getToken]);

//   // Form state management (using useState for simplicity, consider react-hook-form for complex forms)
//   const [generalForm, setGeneralForm] = useState({
//     enablePayments: settings?.general.enablePayments || false,
//     testMode: settings?.general.testMode || false,
//     autoRetryFailedPayments: settings?.general.autoRetryFailedPayments || false,
//     sendPaymentReceipts: settings?.general.sendPaymentReceipts || false,
//     companyName: settings?.general.companyName || "",
//     companyAddress: settings?.general.companyAddress || "",
//     billingEmail: settings?.general.billingEmail || "",
//     billingPhone: settings?.general.billingPhone || "",
//   });

//   const [providersForm, setProvidersForm] = useState({
//     stripeEnabled: settings?.providers.stripeEnabled || false,
//     stripePublicKey: settings?.providers.stripePublicKey || "",
//     stripeSecretKey: settings?.providers.stripeSecretKey || "",
//     stripeWebhookSecret: settings?.providers.stripeWebhookSecret || "",
//     paypalEnabled: settings?.providers.paypalEnabled || false,
//     paypalClientId: settings?.providers.paypalClientId || "",
//     paypalSecret: settings?.providers.paypalSecret || "",
//     googlePayEnabled: settings?.providers.googlePayEnabled || false,
//     googleMerchantId: settings?.providers.googleMerchantId || "",
//   });

//   const [currenciesForm, setCurrenciesForm] = useState({
//     defaultCurrency: settings?.currencies.defaultCurrency || "USD",
//     autoUpdateExchangeRates:
//       settings?.currencies.autoUpdateExchangeRates || false,
//     gemsEnabled: settings?.currencies.gemsEnabled || false,
//     gemsExchangeRate: settings?.currencies.gemsExchangeRate || 0,
//     gemsDailyBonus: settings?.currencies.gemsDailyBonus || 0,
//     heartsEnabled: settings?.currencies.heartsEnabled || false,
//     heartsGemsCost: settings?.currencies.heartsGemsCost || 0,
//     heartsRefillTime: settings?.currencies.heartsRefillTime || 0,
//   });

//   // Update form state when settings are loaded
//   useEffect(() => {
//     if (settings) {
//       setGeneralForm(settings.general);
//       setProvidersForm(
//         mapToProviderSettings(settings.providers as ProviderApiResponse)
//       );
//       setCurrenciesForm(settings.currencies);
//       console.log(settings);
//     }
//   }, [settings]);

//   // Generic save handler
//   const saveSettings = useCallback(
//     async (
//       tab: string,
//       data:
//         | GeneralSettings
//         | ProviderSettings
//         | CurrencySettings
//         | RegionalSettings
//     ) => {
//       setLoading(true);

//       try {
//         const token = await getToken();
//         const formattedData =
//           tab === "providers" ? organizeProviders(data) : data;
//         await apiClient.patch(
//           `/api/admin/payments/settings`,
//           {
//             tab,
//             data: {
//               [tab]: formattedData,
//             },
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         toast("Payment settings saved successfully.");
//       } catch (err) {
//         const error = err as AxiosError<{
//           message?: string;
//           errors?: Record<string, string[]>;
//         }>;

//         const apiErrors = error.response?.data?.errors;
//         const message = error.response?.data?.message;

//         if (apiErrors && typeof apiErrors === "object") {
//           Object.entries(apiErrors).forEach(([field, messages]) => {
//             if (Array.isArray(messages)) {
//               messages.forEach((msg) => toast.error(`${field}: ${msg}`));
//             }
//           });
//         } else {
//           toast.error(message || "An unknown error occurred.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     },
//     [getToken]
//   );

//   // Form submission handlers
//   const handleGeneralSave = async () => {
//     await saveSettings("general", generalForm);
//   };

//   const handleProvidersSave = async () => {
//     await saveSettings("providers", providersForm);
//   };

//   const handleCurrenciesSave = async () => {
//     await saveSettings("currencies", currenciesForm);
//   };

//   const handleRegionalSave = async () => {
//     if (settings) {
//       await saveSettings("regional", settings.regional);
//     }
//   };

//   const handleAddRegion = async (data: z.infer<typeof regionSchema>) => {
//     setLoading(true);
//     try {
//       const token = await getToken();

//       const response = await apiClient.post(
//         process.env.NEXT_PUBLIC_API_URL +
//           "/api/admin/payments/settings/regions",
//         data,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const newRegion = response.data.data.region;

//       setSettings((prevSettings) => {
//         if (!prevSettings) return prevSettings; // or handle fallback

//         return {
//           ...prevSettings,
//           regional: {
//             ...prevSettings.regional,
//             regions: [...prevSettings.regional.regions, newRegion],
//           },
//         };
//       });

//       toast("Region added successfully.");
//       setIsAddRegionDialogOpen(false);
//       resetRegionForm();
//     } catch (err) {
//       const error = err as AxiosError<{
//         message?: string;
//         errors?: Record<string, string[]>;
//       }>;

//       const apiErrors = error.response?.data?.errors;
//       const message = error.response?.data?.message;

//       if (apiErrors && typeof apiErrors === "object") {
//         Object.entries(apiErrors).forEach(([field, messages]) => {
//           if (Array.isArray(messages)) {
//             messages.forEach((msg) => toast.error(`${field}: ${msg}`));
//           }
//         });
//       } else {
//         toast.error(message || "An unknown error occurred.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!settings) {
//     return <Loading />;
//   }

//   return (
//     <div className="container mx-auto py-6 px-4">
//       <div className="flex flex-col gap-2 mb-6">
//         <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
//         <p className="text-muted-foreground">
//           Configure payment providers, currencies, and other payment-related
//           settings
//         </p>
//       </div>

//       <Tabs defaultValue="general" className="w-full">
//         <TabsList className="mb-6">
//           <TabsTrigger value="general">
//             <Settings className="mr-2 h-4 w-4" />
//             General
//           </TabsTrigger>
//           <TabsTrigger value="providers">
//             <CreditCard className="mr-2 h-4 w-4" />
//             Payment Providers
//           </TabsTrigger>
//           <TabsTrigger value="currencies">
//             <DollarSign className="mr-2 h-4 w-4" />
//             Currencies
//           </TabsTrigger>
//           <TabsTrigger value="regional">
//             <Globe className="mr-2 h-4 w-4" />
//             Regional Settings
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="general">
//           <Card>
//             <CardHeader>
//               <CardTitle>General Payment Settings</CardTitle>
//               <CardDescription>
//                 Configure basic payment settings for your application
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h6 className="font-medium">Enable Payments</h6>
//                     <p className="text-sm text-muted-foreground">
//                       Allow users to make payments in your application
//                     </p>
//                   </div>
//                   <Switch
//                     checked={generalForm.enablePayments}
//                     onCheckedChange={(checked) =>
//                       setGeneralForm({
//                         ...generalForm,
//                         enablePayments: checked,
//                       })
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h6 className="font-medium">Test Mode</h6>
//                     <p className="text-sm text-muted-foreground">
//                       Process payments in test mode (no real charges)
//                     </p>
//                   </div>
//                   <Switch
//                     checked={generalForm.testMode}
//                     onCheckedChange={(checked) =>
//                       setGeneralForm({ ...generalForm, testMode: checked })
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h6 className="font-medium">Auto-retry Failed Payments</h6>
//                     <p className="text-sm text-muted-foreground">
//                       Automatically retry failed payments after 24 hours
//                     </p>
//                   </div>
//                   <Switch
//                     checked={generalForm.autoRetryFailedPayments}
//                     onCheckedChange={(checked) =>
//                       setGeneralForm({
//                         ...generalForm,
//                         autoRetryFailedPayments: checked,
//                       })
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h6 className="font-medium">Send Payment Receipts</h6>
//                     <p className="text-sm text-muted-foreground">
//                       Automatically send email receipts for successful payments
//                     </p>
//                   </div>
//                   <Switch
//                     checked={generalForm.sendPaymentReceipts}
//                     onCheckedChange={(checked) =>
//                       setGeneralForm({
//                         ...generalForm,
//                         sendPaymentReceipts: checked,
//                       })
//                     }
//                   />
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-4">
//                 <h6 className="font-medium">Invoice Settings</h6>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="company-name">Company Name</Label>
//                     <Input
//                       id="company-name"
//                       value={generalForm.companyName}
//                       onChange={(e) =>
//                         setGeneralForm({
//                           ...generalForm,
//                           companyName: e.target.value,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="company-address">Company Address</Label>
//                     <Input
//                       id="company-address"
//                       value={generalForm.companyAddress}
//                       onChange={(e) =>
//                         setGeneralForm({
//                           ...generalForm,
//                           companyAddress: e.target.value,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="company-email">Billing Email</Label>
//                     <Input
//                       id="company-email"
//                       value={generalForm.billingEmail}
//                       onChange={(e) =>
//                         setGeneralForm({
//                           ...generalForm,
//                           billingEmail: e.target.value,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="company-phone">Billing Phone</Label>
//                     <Input
//                       id="company-phone"
//                       value={generalForm.billingPhone}
//                       onChange={(e) =>
//                         setGeneralForm({
//                           ...generalForm,
//                           billingPhone: e.target.value,
//                         })
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button disabled={loading} onClick={handleGeneralSave}>
//                   {loading && <Loader2 className="animate-spin" />}
//                   <Save className="mr-2 h-4 w-4" />
//                   Save Changes
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="providers">
//           <Card>
//             <CardHeader>
//               <CardTitle>Payment Providers</CardTitle>
//               <CardDescription>
//                 Connect and configure payment providers for your application
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="border rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 bg-[#6772E5] rounded-md flex items-center justify-center text-white font-bold">
//                         S
//                       </div>
//                       <div>
//                         <h6 className="font-medium">Stripe</h6>
//                         <p className="text-sm text-muted-foreground">
//                           Process credit card payments
//                         </p>
//                       </div>
//                     </div>
//                     <Switch
//                       checked={providersForm.stripeEnabled}
//                       onCheckedChange={(checked) =>
//                         setProvidersForm({
//                           ...providersForm,
//                           stripeEnabled: checked,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="stripe-public-key">Public Key</Label>
//                       <Input
//                         id="stripe-public-key"
//                         value={providersForm.stripePublicKey}
//                         type="password"
//                         onChange={(e) =>
//                           setProvidersForm({
//                             ...providersForm,
//                             stripePublicKey: e.target.value,
//                           })
//                         }
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="stripe-secret-key">Secret Key</Label>
//                       <Input
//                         id="stripe-secret-key"
//                         value={providersForm.stripeSecretKey}
//                         type="password"
//                         onChange={(e) =>
//                           setProvidersForm({
//                             ...providersForm,
//                             stripeSecretKey: e.target.value,
//                           })
//                         }
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="stripe-webhook-secret">
//                         Webhook Secret
//                       </Label>
//                       <Input
//                         id="stripe-webhook-secret"
//                         value={providersForm.stripeWebhookSecret}
//                         type="password"
//                         onChange={(e) =>
//                           setProvidersForm({
//                             ...providersForm,
//                             stripeWebhookSecret: e.target.value,
//                           })
//                         }
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 bg-[#003087] rounded-md flex items-center justify-center text-white font-bold">
//                         P
//                       </div>
//                       <div>
//                         <h6 className="font-medium">PayPal</h6>
//                         <p className="text-sm text-muted-foreground">
//                           Process PayPal payments
//                         </p>
//                       </div>
//                     </div>
//                     <Switch
//                       checked={providersForm.paypalEnabled}
//                       onCheckedChange={(checked) =>
//                         setProvidersForm({
//                           ...providersForm,
//                           paypalEnabled: checked,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="paypal-client-id">Client ID</Label>
//                       <Input
//                         id="paypal-client-id"
//                         placeholder="Enter PayPal client ID"
//                         value={providersForm.paypalClientId}
//                         onChange={(e) =>
//                           setProvidersForm({
//                             ...providersForm,
//                             paypalClientId: e.target.value,
//                           })
//                         }
//                         disabled={!providersForm.paypalEnabled}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="paypal-secret">Client Secret</Label>
//                       <Input
//                         id="paypal-secret"
//                         placeholder="Enter PayPal client secret"
//                         value={providersForm.paypalSecret}
//                         onChange={(e) =>
//                           setProvidersForm({
//                             ...providersForm,
//                             paypalSecret: e.target.value,
//                           })
//                         }
//                         disabled={!providersForm.paypalEnabled}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 bg-[#5F6368] rounded-md flex items-center justify-center text-white font-bold">
//                         G
//                       </div>
//                       <div>
//                         <h6 className="font-medium">Google Pay</h6>
//                         <p className="text-sm text-muted-foreground">
//                           Process Google Pay payments
//                         </p>
//                       </div>
//                     </div>
//                     <Switch
//                       checked={providersForm.googlePayEnabled}
//                       onCheckedChange={(checked) =>
//                         setProvidersForm({
//                           ...providersForm,
//                           googlePayEnabled: checked,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="google-merchant-id">Merchant ID</Label>
//                       <Input
//                         id="google-merchant-id"
//                         placeholder="Enter Google merchant ID"
//                         value={providersForm.googleMerchantId}
//                         onChange={(e) =>
//                           setProvidersForm({
//                             ...providersForm,
//                             googleMerchantId: e.target.value,
//                           })
//                         }
//                         disabled={!providersForm.googlePayEnabled}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button onClick={handleProvidersSave}>
//                   {loading && <Loader2 className="animate-spin" />}
//                   <Save className="mr-2 h-4 w-4" />
//                   Save Changes
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="currencies">
//           <Card>
//             <CardHeader>
//               <CardTitle>Currency Settings</CardTitle>
//               <CardDescription>
//                 Configure currencies and exchange rates for your application
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h6 className="font-medium">Default Currency</h6>
//                     <p className="text-sm text-muted-foreground">
//                       The primary currency used for transactions
//                     </p>
//                   </div>
//                   <select
//                     className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                     value={currenciesForm.defaultCurrency}
//                     onChange={(e) =>
//                       setCurrenciesForm({
//                         ...currenciesForm,
//                         defaultCurrency: e.target.value,
//                       })
//                     }
//                   >
//                     <option value="USD">USD - US Dollar</option>
//                     <option value="EUR">EUR - Euro</option>
//                     <option value="GBP">GBP - British Pound</option>
//                     <option value="JPY">JPY - Japanese Yen</option>
//                     <option value="CAD">CAD - Canadian Dollar</option>
//                   </select>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h6 className="font-medium">Auto-update Exchange Rates</h6>
//                     <p className="text-sm text-muted-foreground">
//                       Automatically update exchange rates daily
//                     </p>
//                   </div>
//                   <Switch
//                     checked={currenciesForm.autoUpdateExchangeRates}
//                     onCheckedChange={(checked) =>
//                       setCurrenciesForm({
//                         ...currenciesForm,
//                         autoUpdateExchangeRates: checked,
//                       })
//                     }
//                   />
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-4">
//                 <h6 className="font-medium">In-App Currencies</h6>
//                 <p className="text-sm text-muted-foreground">
//                   Configure virtual currencies used within your application
//                 </p>

//                 <div className="border rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
//                         G
//                       </div>
//                       <div>
//                         <h6 className="font-medium">Gems</h6>
//                         <p className="text-sm text-muted-foreground">
//                           Primary in-app currency
//                         </p>
//                       </div>
//                     </div>
//                     <Switch
//                       checked={currenciesForm.gemsEnabled}
//                       onCheckedChange={(checked) =>
//                         setCurrenciesForm({
//                           ...currenciesForm,
//                           gemsEnabled: checked,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="gems-exchange-rate">
//                         Exchange Rate (USD to Gems)
//                       </Label>
//                       <Input
//                         id="gems-exchange-rate"
//                         type="number"
//                         value={String(currenciesForm.gemsExchangeRate)}
//                         onChange={(e) =>
//                           setCurrenciesForm({
//                             ...currenciesForm,
//                             gemsExchangeRate: Number(e.target.value),
//                           })
//                         }
//                       />
//                       <p className="text-xs text-muted-foreground">
//                         $1.00 = 100 Gems
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="gems-daily-bonus">Daily Bonus</Label>
//                       <Input
//                         id="gems-daily-bonus"
//                         type="number"
//                         value={String(currenciesForm.gemsDailyBonus)}
//                         onChange={(e) =>
//                           setCurrenciesForm({
//                             ...currenciesForm,
//                             gemsDailyBonus: Number(e.target.value),
//                           })
//                         }
//                       />
//                       <p className="text-xs text-muted-foreground">
//                         Gems awarded for daily streak
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
//                         H
//                       </div>
//                       <div>
//                         <h6 className="font-medium">Hearts</h6>
//                         <p className="text-sm text-muted-foreground">
//                           Secondary in-app currency
//                         </p>
//                       </div>
//                     </div>
//                     <Switch
//                       checked={currenciesForm.heartsEnabled}
//                       onCheckedChange={(checked) =>
//                         setCurrenciesForm({
//                           ...currenciesForm,
//                           heartsEnabled: checked,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="hearts-gems-cost">Cost in Gems</Label>
//                       <Input
//                         id="hearts-gems-cost"
//                         type="number"
//                         value={String(currenciesForm.heartsGemsCost)}
//                         onChange={(e) =>
//                           setCurrenciesForm({
//                             ...currenciesForm,
//                             heartsGemsCost: Number(e.target.value),
//                           })
//                         }
//                       />
//                       <p className="text-xs text-muted-foreground">
//                         10 Gems = 1 Heart
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="hearts-refill-time">
//                         Refill Time (hours)
//                       </Label>
//                       <Input
//                         id="hearts-refill-time"
//                         type="number"
//                         value={String(currenciesForm.heartsRefillTime)}
//                         onChange={(e) =>
//                           setCurrenciesForm({
//                             ...currenciesForm,
//                             heartsRefillTime: Number(e.target.value),
//                           })
//                         }
//                       />
//                       <p className="text-xs text-muted-foreground">
//                         Time to regenerate 1 heart
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button disabled={loading} onClick={handleCurrenciesSave}>
//                   {loading && <Loader2 className="animate-spin" />}
//                   <Save className="mr-2 h-4 w-4" />
//                   Save Changes
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="regional">
//           <Card>
//             <CardHeader>
//               <CardTitle>Regional Payment Settings</CardTitle>
//               <CardDescription>
//                 Configure region-specific payment settings and pricing
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h6 className="font-medium">Regional Pricing</h6>
//                     <p className="text-sm text-muted-foreground">
//                       Enable region-specific pricing for subscriptions and
//                       products
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.regional.regionalPricingEnabled}
//                     onCheckedChange={(checked) => {
//                       setSettings((prevSettings) => {
//                         if (!prevSettings) return prevSettings;

//                         // Safe to update
//                         return {
//                           ...prevSettings,
//                           regional: {
//                             ...prevSettings.regional,
//                             regionalPricingEnabled: checked,
//                           },
//                         };
//                       });
//                     }}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h6 className="font-medium">Tax Calculation</h6>
//                     <p className="text-sm text-muted-foreground">
//                       Automatically calculate and apply taxes based on user
//                       location
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.regional.taxCalculationEnabled}
//                     onCheckedChange={(checked) => {
//                       setSettings((prevSettings) => {
//                         if (!prevSettings) return prevSettings;

//                         // Safe to update
//                         return {
//                           ...prevSettings,
//                           regional: {
//                             ...prevSettings.regional,
//                             taxCalculationEnabled: checked,
//                           },
//                         };
//                       });
//                     }}
//                   />
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-4">
//                 <h6 className="font-medium">Regional Price Adjustments</h6>
//                 <p className="text-sm text-muted-foreground">
//                   Set price multipliers for different regions
//                 </p>

//                 <div className="border rounded-lg overflow-hidden">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-muted">
//                         <th className="text-left p-3 text-sm font-semibold">
//                           Region
//                         </th>
//                         <th className="text-left p-3 text-sm font-semibold">
//                           Currency
//                         </th>
//                         <th className="text-left p-3 text-sm font-semibold">
//                           Price Multiplier
//                         </th>
//                         <th className="text-left p-3 text-sm font-semibold">
//                           Tax Rate
//                         </th>
//                         <th className="text-left p-3 text-sm font-semibold">
//                           Status
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {settings.regional.regions.map((region) => (
//                         <tr key={region.name} className="border-b border-muted">
//                           <td className="p-3 text-sm">{region.name}</td>
//                           <td className="p-3 text-sm">{region.currency}</td>
//                           <td className="p-3 text-sm">
//                             {region.priceMultiplier}x
//                           </td>
//                           <td className="p-3 text-sm">{region.taxRate}%</td>
//                           <td className="p-3 text-sm">
//                             <Badge
//                               variant="outline"
//                               className={
//                                 region.status === "active"
//                                   ? "bg-green-100 text-green-800"
//                                   : region.status === "pending"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : "bg-red-100 text-red-800"
//                               }
//                             >
//                               {region.status}
//                             </Badge>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="flex justify-end">
//                   <Dialog
//                     open={isAddRegionDialogOpen}
//                     onOpenChange={setIsAddRegionDialogOpen}
//                   >
//                     <DialogTrigger asChild>
//                       <Button variant="outline">Add Region</Button>
//                     </DialogTrigger>
//                     <DialogContent className="w-full max-w-3xl">
//                       <DialogHeader>
//                         <DialogTitle>Add New Region</DialogTitle>
//                         <DialogDescription>
//                           Configure pricing and tax settings for a new region.
//                         </DialogDescription>
//                       </DialogHeader>

//                       <form onSubmit={handleRegionSubmit(handleAddRegion)}>
//                         <div className="grid gap-4 py-4">
//                           <div className="grid grid-cols-4 items-center gap-4">
//                             <Label htmlFor="name" className="text-right">
//                               Region Name
//                             </Label>
//                             <Input
//                               id="name"
//                               placeholder="e.g. Australia"
//                               className="col-span-3"
//                               {...registerRegion("name")}
//                             />
//                             {regionErrors.name && (
//                               <p className="col-span-4 text-red-500 text-sm">
//                                 {regionErrors.name.message}
//                               </p>
//                             )}
//                           </div>
//                           <div className="grid grid-cols-4 items-center gap-4">
//                             <Label
//                               htmlFor="region-currency"
//                               className="text-right"
//                             >
//                               Currency
//                             </Label>
//                             <select
//                               id="region-currency"
//                               className="flex h-10 col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                               {...registerRegion("currency")}
//                             >
//                               <option value="AUD">
//                                 AUD - Australian Dollar
//                               </option>
//                               <option value="CAD">CAD - Canadian Dollar</option>
//                               <option value="EUR">EUR - Euro</option>
//                               <option value="GBP">GBP - British Pound</option>
//                               <option value="JPY">JPY - Japanese Yen</option>
//                               <option value="USD">USD - US Dollar</option>
//                             </select>
//                             {regionErrors.currency && (
//                               <p className="col-span-4 text-red-500 text-sm">
//                                 {regionErrors.currency.message}
//                               </p>
//                             )}
//                           </div>
//                           <div className="grid grid-cols-4 items-center gap-4">
//                             <Label
//                               htmlFor="price-multiplier"
//                               className="text-right"
//                             >
//                               Price Multiplier
//                             </Label>
//                             <Input
//                               id="price-multiplier"
//                               type="number"
//                               step="0.1"
//                               defaultValue="1.0"
//                               className="col-span-3"
//                               {...registerRegion("priceMultiplier", {
//                                 valueAsNumber: true,
//                               })}
//                             />
//                             {regionErrors.priceMultiplier && (
//                               <p className="col-span-4 text-red-500 text-sm">
//                                 {regionErrors.priceMultiplier.message}
//                               </p>
//                             )}
//                           </div>
//                           <div className="grid grid-cols-4 items-center gap-4">
//                             <Label htmlFor="tax-rate" className="text-right">
//                               Tax Rate (%)
//                             </Label>
//                             <Input
//                               id="tax-rate"
//                               type="number"
//                               step="0.1"
//                               defaultValue="0"
//                               className="col-span-3"
//                               {...registerRegion("taxRate", {
//                                 valueAsNumber: true,
//                               })}
//                             />
//                             {regionErrors.taxRate && (
//                               <p className="col-span-4 text-red-500 text-sm">
//                                 {regionErrors.taxRate.message}
//                               </p>
//                             )}
//                           </div>
//                           <div className="grid grid-cols-4 items-center gap-4">
//                             <Label
//                               htmlFor="region-status"
//                               className="text-right"
//                             >
//                               Status
//                             </Label>
//                             <select
//                               id="region-status"
//                               className="flex h-10 col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                               {...registerRegion("status")}
//                             >
//                               <option value="active">Active</option>
//                               <option value="pending">Pending</option>
//                               <option value="inactive">Inactive</option>
//                             </select>
//                             {regionErrors.status && (
//                               <p className="col-span-4 text-red-500 text-sm">
//                                 {regionErrors.status.message}
//                               </p>
//                             )}
//                           </div>
//                         </div>

//                         <DialogFooter>
//                           <Button type="submit" disabled={loading}>
//                             {loading && <Loader2 className="animate-spin" />}
//                             Add Region
//                           </Button>
//                         </DialogFooter>
//                       </form>
//                     </DialogContent>
//                   </Dialog>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button onClick={handleRegionalSave}>
//                   <Save className="mr-2 h-4 w-4" />
//                   Save Changes
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

import { PaymentSettingsManagementPage } from "@/components/modules/admin/payments/settings";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default function page() {
  return <PaymentSettingsManagementPage />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Page - Title here`,
    description: `Page - Description here`,
    icons: {
      icon: `path to asset file`,
    },
  };
}
