// "use client";

import { PromotionsManagementPage } from "@/components/modules/admin/shop/promotions/promotions-management-page";

// import { useState } from "react";
// import {
//   Plus,
//   Search,
//   Calendar,
//   Tag,
//   Percent,
//   Gift,
//   BarChart4,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import { Progress } from "@/components/ui/progress";

// // Mock data for promotions
// const promotions = [
//   {
//     id: "1",
//     name: "Summer Sale",
//     description: "20% off all items for the summer season",
//     type: "discount",
//     discount: "20%",
//     startDate: "2023-06-01",
//     endDate: "2023-08-31",
//     status: "active",
//     eligibility: "All users",
//     redemptions: 3450,
//     target: 5000,
//     progress: 69,
//   },
//   {
//     id: "2",
//     name: "New User Bundle",
//     description: "Special bundle for new users with starter items",
//     type: "bundle",
//     discount: "500 gems value",
//     startDate: "2023-01-01",
//     endDate: "2023-12-31",
//     status: "active",
//     eligibility: "New users only",
//     redemptions: 1250,
//     target: null,
//     progress: null,
//   },
//   {
//     id: "3",
//     name: "Halloween Special",
//     description: "Limited-time Halloween items and discounts",
//     type: "seasonal",
//     discount: "15%",
//     startDate: "2023-10-15",
//     endDate: "2023-11-05",
//     status: "upcoming",
//     eligibility: "All users",
//     redemptions: 0,
//     target: 2000,
//     progress: 0,
//   },
//   {
//     id: "4",
//     name: "Premium Subscription Discount",
//     description: "25% off annual premium subscriptions",
//     type: "discount",
//     discount: "25%",
//     startDate: "2023-05-01",
//     endDate: "2023-05-31",
//     status: "expired",
//     eligibility: "Free users only",
//     redemptions: 875,
//     target: 1000,
//     progress: 88,
//   },
//   {
//     id: "5",
//     name: "Weekend XP Boost",
//     description: "Double XP on all lessons during weekends",
//     type: "boost",
//     discount: "2x XP",
//     startDate: "2023-06-03",
//     endDate: "2023-08-27",
//     status: "active",
//     eligibility: "All users",
//     redemptions: 5670,
//     target: null,
//     progress: null,
//   },
//   {
//     id: "6",
//     name: "Black Friday Sale",
//     description: "Up to 50% off on all shop items",
//     type: "discount",
//     discount: "Up to 50%",
//     startDate: "2023-11-24",
//     endDate: "2023-11-27",
//     status: "upcoming",
//     eligibility: "All users",
//     redemptions: 0,
//     target: 10000,
//     progress: 0,
//   },
// ];

// // Mock data for promotion analytics
// const promotionAnalytics = {
//   activePromotions: 3,
//   upcomingPromotions: 2,
//   expiredPromotions: 1,
//   totalRedemptions: 11245,
//   conversionRate: "8.3%",
// };

// export default function PromotionsPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [activeTab, setActiveTab] = useState("all");

//   // Filter promotions based on search query, type, and status
//   const filteredPromotions = promotions.filter((promo) => {
//     const matchesSearch =
//       promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       promo.description.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesType = typeFilter === "all" || promo.type === typeFilter;
//     const matchesStatus =
//       statusFilter === "all" || promo.status === statusFilter;
//     const matchesTab =
//       activeTab === "all" ||
//       (activeTab === "active" && promo.status === "active") ||
//       (activeTab === "upcoming" && promo.status === "upcoming") ||
//       (activeTab === "expired" && promo.status === "expired");

//     return matchesSearch && matchesType && matchesStatus && matchesTab;
//   });

//   // Format large numbers with commas
//   const formatNumber = (num) => {
//     return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "—";
//   };

//   // Get status badge variant
//   const getStatusBadgeVariant = (status) => {
//     switch (status) {
//       case "active":
//         return "default";
//       case "upcoming":
//         return "secondary";
//       case "expired":
//         return "outline";
//       default:
//         return "secondary";
//     }
//   };

//   // Get promotion type icon
//   const getPromoTypeIcon = (type) => {
//     switch (type) {
//       case "discount":
//         return <Percent className="h-5 w-5" />;
//       case "bundle":
//         return <Gift className="h-5 w-5" />;
//       case "seasonal":
//         return <Calendar className="h-5 w-5" />;
//       case "boost":
//         return <BarChart4 className="h-5 w-5" />;
//       default:
//         return <Tag className="h-5 w-5" />;
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">
//             Promotions & Discounts
//           </h1>
//           <p className="text-muted-foreground">
//             Create and manage special offers and promotions
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="mr-2 h-4 w-4" />
//                 New Promotion
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[800px]">
//               <DialogHeader>
//                 <DialogTitle>Create New Promotion</DialogTitle>
//                 <DialogDescription>
//                   Set up a new promotion or discount for your shop items.
//                 </DialogDescription>
//               </DialogHeader>
//               {/* Promotion form would go here */}
//               <div className="py-6 text-center text-muted-foreground">
//                 Promotion form would be implemented here
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Analytics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Active Promotions
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {promotionAnalytics.activePromotions}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Upcoming
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {promotionAnalytics.upcomingPromotions}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Expired
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {promotionAnalytics.expiredPromotions}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Total Redemptions
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {formatNumber(promotionAnalytics.totalRedemptions)}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Conversion Rate
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {promotionAnalytics.conversionRate}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Filters and Search */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search promotions..."
//             className="pl-8"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <Select value={typeFilter} onValueChange={setTypeFilter}>
//           <SelectTrigger className="w-full sm:w-[180px]">
//             <SelectValue placeholder="Type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Types</SelectItem>
//             <SelectItem value="discount">Discount</SelectItem>
//             <SelectItem value="bundle">Bundle</SelectItem>
//             <SelectItem value="seasonal">Seasonal</SelectItem>
//             <SelectItem value="boost">Boost</SelectItem>
//           </SelectContent>
//         </Select>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-full sm:w-[180px]">
//             <SelectValue placeholder="Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Statuses</SelectItem>
//             <SelectItem value="active">Active</SelectItem>
//             <SelectItem value="upcoming">Upcoming</SelectItem>
//             <SelectItem value="expired">Expired</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Tabs and Promotion Cards */}
//       <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList>
//           <TabsTrigger value="all">All Promotions</TabsTrigger>
//           <TabsTrigger value="active">Active</TabsTrigger>
//           <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
//           <TabsTrigger value="expired">Expired</TabsTrigger>
//         </TabsList>
//         <TabsContent value="all" className="mt-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredPromotions.map((promo) => (
//               <PromotionCard
//                 key={promo.id}
//                 promo={promo}
//                 getStatusBadgeVariant={getStatusBadgeVariant}
//                 getPromoTypeIcon={getPromoTypeIcon}
//                 formatNumber={formatNumber}
//               />
//             ))}
//           </div>
//           {filteredPromotions.length === 0 && (
//             <div className="text-center py-10">
//               <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
//               <h3 className="mt-2 text-lg font-semibold">
//                 No promotions found
//               </h3>
//               <p className="text-sm text-muted-foreground">
//                 Try adjusting your search or filter criteria
//               </p>
//             </div>
//           )}
//         </TabsContent>

//         {/* Other tab contents would be identical to the "all" tab but with filtered data */}
//         <TabsContent value="active" className="mt-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredPromotions.map((promo) => (
//               <PromotionCard
//                 key={promo.id}
//                 promo={promo}
//                 getStatusBadgeVariant={getStatusBadgeVariant}
//                 getPromoTypeIcon={getPromoTypeIcon}
//                 formatNumber={formatNumber}
//               />
//             ))}
//           </div>
//         </TabsContent>

//         <TabsContent value="upcoming" className="mt-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredPromotions.map((promo) => (
//               <PromotionCard
//                 key={promo.id}
//                 promo={promo}
//                 getStatusBadgeVariant={getStatusBadgeVariant}
//                 getPromoTypeIcon={getPromoTypeIcon}
//                 formatNumber={formatNumber}
//               />
//             ))}
//           </div>
//         </TabsContent>

//         <TabsContent value="expired" className="mt-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredPromotions.map((promo) => (
//               <PromotionCard
//                 key={promo.id}
//                 promo={promo}
//                 getStatusBadgeVariant={getStatusBadgeVariant}
//                 getPromoTypeIcon={getPromoTypeIcon}
//                 formatNumber={formatNumber}
//               />
//             ))}
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// // Promotion Card Component
// function PromotionCard({
//   promo,
//   getStatusBadgeVariant,
//   getPromoTypeIcon,
//   formatNumber,
// }) {
//   return (
//     <Card>
//       <CardHeader className="pb-2">
//         <div className="flex justify-between items-start">
//           <div className="flex items-center gap-3">
//             <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
//               {getPromoTypeIcon(promo.type)}
//             </div>
//             <div>
//               <CardTitle className="text-lg">{promo.name}</CardTitle>
//               <CardDescription className="line-clamp-1">
//                 {promo.description}
//               </CardDescription>
//             </div>
//           </div>
//           <Badge variant={getStatusBadgeVariant(promo.status)}>
//             {promo.status}
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="pb-2">
//         <div className="grid grid-cols-2 gap-2 text-sm mb-4">
//           <div>
//             <span className="text-muted-foreground">Type:</span>
//             <span className="ml-1 font-medium capitalize">{promo.type}</span>
//           </div>
//           <div>
//             <span className="text-muted-foreground">Discount:</span>
//             <span className="ml-1 font-medium">{promo.discount}</span>
//           </div>
//           <div>
//             <span className="text-muted-foreground">Start:</span>
//             <span className="ml-1 font-medium">{promo.startDate}</span>
//           </div>
//           <div>
//             <span className="text-muted-foreground">End:</span>
//             <span className="ml-1 font-medium">{promo.endDate}</span>
//           </div>
//           <div className="col-span-2">
//             <span className="text-muted-foreground">Eligibility:</span>
//             <span className="ml-1 font-medium">{promo.eligibility}</span>
//           </div>
//         </div>

//         {promo.target && (
//           <div className="space-y-1">
//             <div className="flex justify-between text-sm">
//               <span className="text-muted-foreground">Redemptions:</span>
//               <span className="font-medium">
//                 {formatNumber(promo.redemptions)} / {formatNumber(promo.target)}
//               </span>
//             </div>
//             <Progress value={promo.progress} className="h-2" />
//           </div>
//         )}
//       </CardContent>
//       <Separator />
//       <CardFooter className="pt-4">
//         <div className="flex justify-between w-full">
//           <Button variant="ghost" size="sm">
//             View Details
//           </Button>
//           <Button variant="outline" size="sm">
//             Edit
//           </Button>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }

/**
 * Promotions Management Page
 *
 * This page allows administrators to create and manage promotional campaigns,
 * discounts, and special offers for the shop.
 *
 * Features:
 * - Promotion creation and editing
 * - Discount management
 * - Campaign analytics
 * - Redemption tracking
 * - Seasonal promotions
 */
export default function PromotionsPage() {
  return <PromotionsManagementPage />;
}
