// "use client";

import { InventoryManagementPage } from "@/components/modules/admin/shop/inventory/inventory-management-page";

// import { useState } from "react";
// import {
//   Search,
//   Filter,
//   Package,
//   AlertTriangle,
//   CheckCircle2,
//   Clock,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// // Mock data for inventory items
// const inventoryItems = [
//   {
//     id: "1",
//     name: "Streak Freeze",
//     category: "Power-ups",
//     stock: "Unlimited",
//     status: "In Stock",
//     purchases: 12450,
//     lastUpdated: "2023-05-15",
//   },
//   {
//     id: "2",
//     name: "XP Boost (1 hour)",
//     category: "Power-ups",
//     stock: "Unlimited",
//     status: "In Stock",
//     purchases: 8320,
//     lastUpdated: "2023-06-02",
//   },
//   {
//     id: "3",
//     name: "Astronaut Outfit",
//     category: "Outfits",
//     stock: "Unlimited",
//     status: "In Stock",
//     purchases: 5670,
//     lastUpdated: "2023-07-10",
//   },
//   {
//     id: "4",
//     name: "Gem Pack (Small)",
//     category: "Currency",
//     stock: "Unlimited",
//     status: "In Stock",
//     purchases: 23450,
//     lastUpdated: "2023-04-20",
//   },
//   {
//     id: "5",
//     name: "Holiday Bundle",
//     category: "Special Offers",
//     stock: "Limited (250/1000)",
//     status: "Low Stock",
//     purchases: 750,
//     lastUpdated: "2023-11-25",
//   },
//   {
//     id: "6",
//     name: "Bonus Lesson: Idioms",
//     category: "Lessons",
//     stock: "Unlimited",
//     status: "In Stock",
//     purchases: 3210,
//     lastUpdated: "2023-08-15",
//   },
//   {
//     id: "7",
//     name: "Summer Beach Outfit",
//     category: "Outfits",
//     stock: "Limited (0/500)",
//     status: "Out of Stock",
//     purchases: 500,
//     lastUpdated: "2023-08-01",
//   },
//   {
//     id: "8",
//     name: "Halloween Bundle",
//     category: "Special Offers",
//     stock: "Limited (50/500)",
//     status: "Expiring Soon",
//     purchases: 450,
//     lastUpdated: "2023-10-15",
//   },
// ];

// // Mock data for inventory analytics
// const inventoryAnalytics = {
//   totalItems: 8,
//   inStock: 6,
//   lowStock: 1,
//   outOfStock: 1,
//   expiringItems: 1,
// };

// export default function InventoryManagementPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [activeTab, setActiveTab] = useState("all");

//   // Filter items based on search query, category, and status
//   const filteredItems = inventoryItems.filter((item) => {
//     const matchesSearch = item.name
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase());
//     const matchesCategory =
//       categoryFilter === "all" || item.category === categoryFilter;
//     const matchesStatus =
//       statusFilter === "all" ||
//       item.status.toLowerCase().includes(statusFilter.toLowerCase());
//     const matchesTab =
//       activeTab === "all" ||
//       (activeTab === "in-stock" && item.status === "In Stock") ||
//       (activeTab === "low-stock" && item.status === "Low Stock") ||
//       (activeTab === "out-of-stock" && item.status === "Out of Stock") ||
//       (activeTab === "expiring" && item.status === "Expiring Soon");

//     return matchesSearch && matchesCategory && matchesStatus && matchesTab;
//   });

//   // Format large numbers with commas
//   const formatNumber = (num) => {
//     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   };

//   // Get status badge variant
//   const getStatusBadgeVariant = (status) => {
//     switch (status) {
//       case "In Stock":
//         return "default";
//       case "Low Stock":
//         return "warning";
//       case "Out of Stock":
//         return "destructive";
//       case "Expiring Soon":
//         return "outline";
//       default:
//         return "secondary";
//     }
//   };

//   // Get status icon
//   const StatusIcon = ({ status }) => {
//     switch (status) {
//       case "In Stock":
//         return <CheckCircle2 className="h-4 w-4 text-green-500" />;
//       case "Low Stock":
//         return <AlertTriangle className="h-4 w-4 text-amber-500" />;
//       case "Out of Stock":
//         return <AlertTriangle className="h-4 w-4 text-red-500" />;
//       case "Expiring Soon":
//         return <Clock className="h-4 w-4 text-blue-500" />;
//       default:
//         return <Package className="h-4 w-4" />;
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">
//             Inventory Management
//           </h1>
//           <p className="text-muted-foreground">
//             Monitor and manage your shop inventory
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline">
//             <Filter className="mr-2 h-4 w-4" />
//             Advanced Filters
//           </Button>
//           <Button>
//             <Package className="mr-2 h-4 w-4" />
//             Update Stock
//           </Button>
//         </div>
//       </div>

//       {/* Analytics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Total Items
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {inventoryAnalytics.totalItems}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               In Stock
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">
//               {inventoryAnalytics.inStock}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Low Stock
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-amber-600">
//               {inventoryAnalytics.lowStock}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Out of Stock
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-red-600">
//               {inventoryAnalytics.outOfStock}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Expiring Soon
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-blue-600">
//               {inventoryAnalytics.expiringItems}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Filters and Search */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search inventory..."
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
//             <SelectItem value="Power-ups">Power-ups</SelectItem>
//             <SelectItem value="Outfits">Outfits</SelectItem>
//             <SelectItem value="Currency">Currency</SelectItem>
//             <SelectItem value="Special Offers">Special Offers</SelectItem>
//             <SelectItem value="Lessons">Lessons</SelectItem>
//           </SelectContent>
//         </Select>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-full sm:w-[180px]">
//             <SelectValue placeholder="Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Statuses</SelectItem>
//             <SelectItem value="in stock">In Stock</SelectItem>
//             <SelectItem value="low stock">Low Stock</SelectItem>
//             <SelectItem value="out of stock">Out of Stock</SelectItem>
//             <SelectItem value="expiring">Expiring Soon</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Tabs and Inventory Table */}
//       <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList>
//           <TabsTrigger value="all">All Items</TabsTrigger>
//           <TabsTrigger value="in-stock">In Stock</TabsTrigger>
//           <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
//           <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
//           <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
//         </TabsList>
//         <TabsContent value="all" className="mt-6">
//           <Card>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Item Name</TableHead>
//                     <TableHead>Category</TableHead>
//                     <TableHead>Stock</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Purchases</TableHead>
//                     <TableHead>Last Updated</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredItems.map((item) => (
//                     <TableRow key={item.id}>
//                       <TableCell className="font-medium">{item.name}</TableCell>
//                       <TableCell>{item.category}</TableCell>
//                       <TableCell>{item.stock}</TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <StatusIcon status={item.status} />
//                           <Badge variant={getStatusBadgeVariant(item.status)}>
//                             {item.status}
//                           </Badge>
//                         </div>
//                       </TableCell>
//                       <TableCell>{formatNumber(item.purchases)}</TableCell>
//                       <TableCell>{item.lastUpdated}</TableCell>
//                       <TableCell className="text-right">
//                         <Button variant="ghost" size="sm">
//                           Update
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//               {filteredItems.length === 0 && (
//                 <div className="text-center py-10">
//                   <Package className="mx-auto h-12 w-12 text-muted-foreground" />
//                   <h3 className="mt-2 text-lg font-semibold">No items found</h3>
//                   <p className="text-sm text-muted-foreground">
//                     Try adjusting your search or filter criteria
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Other tab contents would be identical to the "all" tab but with filtered data */}
//         <TabsContent value="in-stock" className="mt-6">
//           <Card>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Item Name</TableHead>
//                     <TableHead>Category</TableHead>
//                     <TableHead>Stock</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Purchases</TableHead>
//                     <TableHead>Last Updated</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredItems.map((item) => (
//                     <TableRow key={item.id}>
//                       <TableCell className="font-medium">{item.name}</TableCell>
//                       <TableCell>{item.category}</TableCell>
//                       <TableCell>{item.stock}</TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <StatusIcon status={item.status} />
//                           <Badge variant={getStatusBadgeVariant(item.status)}>
//                             {item.status}
//                           </Badge>
//                         </div>
//                       </TableCell>
//                       <TableCell>{formatNumber(item.purchases)}</TableCell>
//                       <TableCell>{item.lastUpdated}</TableCell>
//                       <TableCell className="text-right">
//                         <Button variant="ghost" size="sm">
//                           Update
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="low-stock" className="mt-6">
//           {/* Similar table structure as above */}
//         </TabsContent>

//         <TabsContent value="out-of-stock" className="mt-6">
//           {/* Similar table structure as above */}
//         </TabsContent>

//         <TabsContent value="expiring" className="mt-6">
//           {/* Similar table structure as above */}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

/**
 * Inventory Management Page
 *
 * This page provides tools for monitoring and managing shop inventory,
 * including stock levels, availability status, and inventory analytics.
 *
 * Features:
 * - Real-time inventory tracking
 * - Stock level management
 * - Low stock alerts
 * - Inventory analytics
 * - Bulk stock updates
 */
export default function InventoryPage() {
  return <InventoryManagementPage />
}
