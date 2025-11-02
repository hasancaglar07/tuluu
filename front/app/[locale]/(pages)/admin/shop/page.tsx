// "use client";

import { ShopManagementPage } from "@/components/modules/admin/shop";

// import { useState, useEffect, useCallback } from "react";
// import { useAuth } from "@clerk/nextjs";
// import { toast } from "sonner";
// import {
//   Plus,
//   Search,
//   BarChart4,
//   Tag,
//   Package,
//   DollarSign,
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
// import { ShopItemForm } from "@/components/modules/admin/shop-item-form";
// import { ShopCategoryManager } from "@/components/modules/admin/shop-category-manager";
// import { ShopItemDetailsDialog } from "@/components/modules/admin/shop-item-details-dialog";
// import { AnalyticsData, Category, ShopItem } from "@/types";
// import Image from "next/image";
// import { apiClient } from "@/lib/api-client";

// export default function ShopManagementPage() {
//   // State management
//   const [shopItems, setShopItems] = useState<ShopItem[]>([]);
//   const [shopAnalytics, setShopAnalytics] = useState<
//     AnalyticsData["analytics"] | null
//   >(null);
//   const [categories, setCategories] = useState<Category[] | []>([]);
//   const [loading, setLoading] = useState(true);
//   const [analyticsLoading, setAnalyticsLoading] = useState(true);

//   // Filter states
//   const [searchQuery, setSearchQuery] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

//   // Dialog states
//   const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
//   const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("all");

//   // Authentication
//   const { getToken } = useAuth();
//   const fetchShopItems = useCallback(async () => {
//     try {
//       setLoading(true);
//       const token = await getToken();

//       const params = new URLSearchParams();
//       if (searchQuery) params.append("search", searchQuery);
//       if (categoryFilter !== "all") params.append("category", categoryFilter);
//       if (statusFilter !== "all") params.append("status", statusFilter);

//       const response = await apiClient.get(
//         `/api/admin/shop/items?${params.toString()}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setShopItems(response.data.items);
//     } catch (error) {
//       console.error("Error fetching shop items:", error);
//       toast.error("Failed to fetch shop items");
//     } finally {
//       setLoading(false);
//     }
//   }, [searchQuery, categoryFilter, statusFilter, getToken]);

//   // ✅ fetchShopAnalytics
//   const fetchShopAnalytics = useCallback(async () => {
//     try {
//       setAnalyticsLoading(true);
//       const token = await getToken();

//       const response = await apiClient.get("/api/admin/shop/analytics", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setShopAnalytics(response.data.analytics);
//     } catch (error) {
//       console.error("Error fetching shop analytics:", error);
//       toast.error("Failed to fetch shop analytics");
//     } finally {
//       setAnalyticsLoading(false);
//     }
//   }, [getToken]);

//   // ✅ fetchCategories
//   const fetchCategories = useCallback(async () => {
//     try {
//       const token = await getToken();

//       const response = await apiClient.get("/api/admin/shop/categories", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setCategories(response.data.categories);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       toast.error("Failed to fetch categories");
//     }
//   }, [getToken]);

//   // ✅ Initial data fetch
//   useEffect(() => {
//     fetchShopItems();
//     fetchShopAnalytics();
//     fetchCategories();
//   }, [fetchCategories, fetchShopAnalytics, fetchShopItems]);

//   // Refetch items when filters change
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       fetchShopItems();
//     }, 300); // Debounce search

//     return () => clearTimeout(timeoutId);
//   }, [
//     fetchCategories,
//     fetchShopAnalytics,
//     fetchShopItems,
//     searchQuery,
//     categoryFilter,
//     statusFilter,
//   ]);

//   // Handle item creation success
//   const handleItemCreated = (newItem: ShopItem) => {
//     setShopItems((prev) => [newItem, ...prev]);
//     setIsNewItemDialogOpen(false);
//     toast.success("Shop item created successfully");
//     fetchShopAnalytics(); // Refresh analytics
//   };

//   // Handle item update success
//   const handleItemUpdated = (updatedItem: ShopItem) => {
//     setShopItems((prev) =>
//       prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
//     );
//     if (selectedItem?.id === updatedItem.id) {
//       setSelectedItem(updatedItem);
//     }
//     toast.success("Shop item updated successfully");
//     fetchShopAnalytics(); // Refresh analytics
//     fetchShopItems();
//   };

//   // Handle item deletion success
//   const handleItemDeleted = (deletedItemId: string) => {
//     setShopItems((prev) => prev.filter((item) => item.id !== deletedItemId));
//     if (selectedItem?.id === deletedItemId) {
//       setSelectedItem(null);
//     }
//     toast.success("Shop item deleted successfully");
//     fetchShopAnalytics(); // Refresh analytics
//   };

//   // Handle category updates
//   const handleCategoriesUpdated = () => {
//     fetchCategories();
//     fetchShopItems(); // Refresh items in case category names changed
//   };

//   // Filter items based on active tab
//   const filteredItems = shopItems.filter((item) => {
//     const matchesTab =
//       activeTab === "all" ||
//       (activeTab === "active" && item.status === "active") ||
//       (activeTab === "inactive" && item.status === "inactive");

//     return matchesTab;
//   });

//   // Format currency for display
//   const formatCurrency = (amount: number, currency: string) => {
//     if (currency === "gems") return `${amount} gems`;
//     if (currency === "USD") return `$${amount.toFixed(2)}`;
//     return `${amount} ${currency}`;
//   };

//   // Format large numbers with commas
//   const formatNumber = (num: number) => {
//     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Shop Management</h1>
//           <p className="text-muted-foreground">
//             Create, edit, and manage items in your in-app shop
//           </p>
//         </div>
//         <div className="flex gap-2 flex-1 justify-end">
//           <Dialog
//             open={isCategoryDialogOpen}
//             onOpenChange={setIsCategoryDialogOpen}
//           >
//             <DialogTrigger asChild>
//               <Button variant="outline">
//                 <Tag className="mr-2 h-4 w-4" />
//                 Manage Categories
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="w-full max-w-3xl">
//               <DialogHeader>
//                 <DialogTitle>Manage Shop Categories</DialogTitle>
//                 <DialogDescription>
//                   Create, edit, and organize categories for your shop items.
//                 </DialogDescription>
//               </DialogHeader>
//               <ShopCategoryManager
//                 categories={categories}
//                 onCategoriesUpdated={handleCategoriesUpdated}
//               />
//             </DialogContent>
//           </Dialog>

//           <Dialog
//             open={isNewItemDialogOpen}
//             onOpenChange={setIsNewItemDialogOpen}
//           >
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add New Item
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[800px]">
//               <DialogHeader>
//                 <DialogTitle>Create New Shop Item</DialogTitle>
//                 <DialogDescription>
//                   Fill in the details to create a new item for your shop.
//                 </DialogDescription>
//               </DialogHeader>
//               <ShopItemForm
//                 categories={categories}
//                 onClose={() => setIsNewItemDialogOpen(false)}
//                 onItemCreated={handleItemCreated}
//               />
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Analytics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {analyticsLoading ? (
//           // Loading skeleton for analytics
//           Array.from({ length: 4 }).map((_, i) => (
//             <Card key={i}>
//               <CardHeader className="pb-2">
//                 <div className="h-4 bg-muted rounded animate-pulse" />
//               </CardHeader>
//               <CardContent>
//                 <div className="h-8 bg-muted rounded animate-pulse mb-2" />
//                 <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
//               </CardContent>
//             </Card>
//           ))
//         ) : shopAnalytics ? (
//           <>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Total Revenue
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {formatNumber(shopAnalytics.totalRevenue)} gems
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   ~$
//                   {Math.round(
//                     shopAnalytics.totalRevenue / 100
//                   ).toLocaleString()}
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Total Purchases
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {formatNumber(shopAnalytics.totalPurchases)}
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Avg. {shopAnalytics.averageOrderValue.toFixed(0)} gems per
//                   purchase
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Top Selling
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {shopAnalytics.topSellingItem}
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Category: {shopAnalytics.topSellingCategory}
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Conversion Rate
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {shopAnalytics.conversionRate}
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Of shop visitors make a purchase
//                 </p>
//               </CardContent>
//             </Card>
//           </>
//         ) : null}
//       </div>

//       {/* Filters and Search */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search items..."
//             className="pl-8"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <Select value={categoryFilter} onValueChange={setCategoryFilter}>
//           <SelectTrigger className="w-full sm:w-[180px]">
//             <SelectValue placeholder="Category" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Categories</SelectItem>
//             {categories.map((category) => (
//               <SelectItem key={category.id} value={category.name}>
//                 {category.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-full sm:w-[180px]">
//             <SelectValue placeholder="Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Statuses</SelectItem>
//             <SelectItem value="active">Active</SelectItem>
//             <SelectItem value="inactive">Inactive</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Tabs and Item List */}
//       <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList>
//           <TabsTrigger value="all">All Items</TabsTrigger>
//           <TabsTrigger value="active">Active</TabsTrigger>
//           <TabsTrigger value="inactive">Inactive</TabsTrigger>
//         </TabsList>
//         <TabsContent value="all" className="mt-6">
//           {loading ? (
//             // Loading skeleton for items
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {Array.from({ length: 6 }).map((_, i) => (
//                 <Card key={i} className="overflow-hidden">
//                   <CardHeader className="p-4 pb-0">
//                     <div className="flex justify-between items-start">
//                       <div className="flex items-center gap-3 flex-1">
//                         <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
//                         <div className="space-y-2 flex-1">
//                           <div className="h-4 bg-muted rounded animate-pulse" />
//                           <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
//                         </div>
//                       </div>
//                       <div className="h-6 w-16 bg-muted rounded animate-pulse" />
//                     </div>
//                   </CardHeader>
//                   <CardContent className="p-4">
//                     <div className="space-y-2">
//                       <div className="h-3 bg-muted rounded animate-pulse" />
//                       <div className="h-3 bg-muted rounded animate-pulse" />
//                     </div>
//                   </CardContent>
//                   <Separator />
//                   <CardFooter className="p-4 pt-3">
//                     <div className="h-8 bg-muted rounded animate-pulse w-full" />
//                   </CardFooter>
//                 </Card>
//               ))}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {filteredItems.map((item) => (
//                 <ShopItemCard
//                   key={item.id}
//                   item={item}
//                   onSelect={() => setSelectedItem(item)}
//                   formatCurrency={formatCurrency}
//                   formatNumber={formatNumber}
//                 />
//               ))}
//             </div>
//           )}
//           {!loading && filteredItems.length === 0 && (
//             <div className="text-center py-10">
//               <Package className="mx-auto h-12 w-12 text-muted-foreground" />
//               <h3 className="mt-2 text-lg font-semibold">No items found</h3>
//               <p className="text-sm text-muted-foreground">
//                 Try adjusting your search or filter criteria
//               </p>
//             </div>
//           )}
//         </TabsContent>
//         <TabsContent value="active" className="mt-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredItems.map((item) => (
//               <ShopItemCard
//                 key={item.id}
//                 item={item}
//                 onSelect={() => setSelectedItem(item)}
//                 formatCurrency={formatCurrency}
//                 formatNumber={formatNumber}
//               />
//             ))}
//           </div>
//         </TabsContent>
//         <TabsContent value="inactive" className="mt-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredItems.map((item) => (
//               <ShopItemCard
//                 key={item.id}
//                 item={item}
//                 onSelect={() => setSelectedItem(item)}
//                 formatCurrency={formatCurrency}
//                 formatNumber={formatNumber}
//               />
//             ))}
//           </div>
//         </TabsContent>
//       </Tabs>

//       {/* Item Details Dialog */}
//       {selectedItem && (
//         <ShopItemDetailsDialog
//           item={selectedItem}
//           open={!!selectedItem}
//           onOpenChange={(open: boolean) => !open && setSelectedItem(null)}
//           onItemUpdated={handleItemUpdated}
//           onItemDeleted={handleItemDeleted}
//           formatCurrency={formatCurrency}
//           formatNumber={formatNumber}
//           categories={categories}
//         />
//       )}
//     </div>
//   );
// }

// // Shop Item Card Component
// function ShopItemCard({
//   item,
//   onSelect,
//   formatCurrency,
//   formatNumber,
// }: {
//   item: ShopItem;
//   onSelect: () => void;
//   formatCurrency: (amount: number, currency: string) => string;
//   formatNumber: (num: number) => string;
// }) {
//   return (
//     <Card className="overflow-hidden">
//       <CardHeader className="p-4 pb-0">
//         <div className="flex justify-between items-start">
//           <div className="flex items-center gap-3">
//             <div className="h-10 w-10 rounded-md overflow-hidden">
//               <Image
//                 src={
//                   item.image ??
//                   "https://cdn-icons-png.flaticon.com/128/10252/10252905.png"
//                 }
//                 alt={item.name}
//                 className="h-full w-full object-cover"
//                 width={80}
//                 height={80}
//               />
//             </div>
//             <div>
//               <CardTitle className="text-lg">{item.name}</CardTitle>
//               <CardDescription className="line-clamp-1">
//                 {item.description}
//               </CardDescription>
//             </div>
//           </div>
//           <Badge variant={item.status === "active" ? "default" : "secondary"}>
//             {item.status}
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="p-4">
//         <div className="grid grid-cols-2 gap-2 text-sm">
//           <div className="flex items-center gap-1">
//             <Tag className="h-4 w-4 text-muted-foreground" />
//             <span className="text-muted-foreground">Type:</span>
//             <span className="font-medium">{item.type}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//             <span className="text-muted-foreground">Price:</span>
//             <span className="font-medium">
//               {formatCurrency(item.price, item.currency)}
//             </span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Package className="h-4 w-4 text-muted-foreground" />
//             <span className="text-muted-foreground">Stock:</span>
//             <span className="font-medium">{item.stock}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <BarChart4 className="h-4 w-4 text-muted-foreground" />
//             <span className="text-muted-foreground">Purchases:</span>
//             <span className="font-medium">
//               {formatNumber(item.purchases ?? 0)}
//             </span>
//           </div>
//         </div>
//       </CardContent>
//       <Separator />
//       <CardFooter className="p-4 pt-3">
//         <Button variant="ghost" className="w-full" onClick={onSelect}>
//           View Details
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }

/**
 * Shop Management Page
 *
 * This page provides a comprehensive interface for managing shop items,
 * including creating, editing, and organizing products in the in-app store.
 *
 * Features:
 * - Shop item management (CRUD operations)
 * - Category management
 * - Analytics dashboard
 * - Search and filtering
 * - Bulk operations
 */
export default function ShopPage() {
  return <ShopManagementPage />;
}
