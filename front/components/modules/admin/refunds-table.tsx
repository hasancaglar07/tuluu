"use client";

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
import { Input } from "@/components/ui/input";
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
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Search,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Mock data for refunds
const refunds = [
  {
    id: "REF-1234",
    transactionId: "TX-5678",
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    amount: 9.99,
    reason: "Accidental purchase",
    status: "pending",
    date: "2023-05-10",
    type: "Monthly Subscription",
  },
  {
    id: "REF-1235",
    transactionId: "TX-5679",
    user: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    amount: 99.99,
    reason: "Not satisfied with service",
    status: "approved",
    date: "2023-05-09",
    type: "Yearly Subscription",
  },
  {
    id: "REF-1236",
    transactionId: "TX-5680",
    user: {
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    amount: 4.99,
    reason: "Feature not working as expected",
    status: "rejected",
    date: "2023-05-08",
    type: "XP Boost",
  },
  {
    id: "REF-1237",
    transactionId: "TX-5681",
    user: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    amount: 19.99,
    reason: "Purchased wrong item",
    status: "pending",
    date: "2023-05-07",
    type: "Gem Pack",
  },
  {
    id: "REF-1238",
    transactionId: "TX-5682",
    user: {
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    amount: 9.99,
    reason: "Duplicate charge",
    status: "approved",
    date: "2023-05-06",
    type: "Monthly Subscription",
  },
];

export function RefundsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const filteredRefunds = refunds.filter(
    (refund) =>
      refund.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const viewRefundDetails = (refund: any) => {
    setSelectedRefund(refund);
    setAdminNote("");
    setIsDetailsOpen(true);
  };

  const handleApproveRefund = () => {
    // In a real app, you would call an API to approve the refund
    setIsDetailsOpen(false);
  };

  const handleRejectRefund = () => {
    // In a real app, you would call an API to reject the refund
    setIsDetailsOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search refunds..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Refund ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRefunds.map((refund) => (
              <TableRow key={refund.id}>
                <TableCell className="font-medium">{refund.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={refund.user.avatar || "/placeholder.svg"}
                        alt={refund.user.name}
                      />
                      <AvatarFallback>
                        {refund.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {refund.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {refund.user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>${refund.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate" title={refund.reason}>
                    {refund.reason}
                  </div>
                </TableCell>
                <TableCell>{refund.date}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(refund.status)}
                  >
                    {refund.status.charAt(0).toUpperCase() +
                      refund.status.slice(1)}
                  </Badge>
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
                      <DropdownMenuItem
                        onClick={() => viewRefundDetails(refund)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {refund.status === "pending" && (
                        <>
                          <DropdownMenuItem>
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="w-full max-w-3xl">
          <DialogHeader>
            <DialogTitle>Refund Request Details</DialogTitle>
            <DialogDescription>
              Complete information about refund request {selectedRefund?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRefund && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Refund ID
                  </h3>
                  <p className="text-sm">{selectedRefund.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Transaction ID
                  </h3>
                  <p className="text-sm">{selectedRefund.transactionId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    User
                  </h3>
                  <p className="text-sm">{selectedRefund.user.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h3>
                  <p className="text-sm">{selectedRefund.user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Amount
                  </h3>
                  <p className="text-sm">${selectedRefund.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Status
                  </h3>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedRefund.status)}
                  >
                    {selectedRefund.status.charAt(0).toUpperCase() +
                      selectedRefund.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Date
                  </h3>
                  <p className="text-sm">{selectedRefund.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Type
                  </h3>
                  <p className="text-sm">{selectedRefund.type}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Reason for Refund
                </h3>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {selectedRefund.reason}
                </div>
              </div>

              {selectedRefund.status === "pending" && (
                <div className="space-y-2">
                  <Label htmlFor="adminNote">Admin Note</Label>
                  <Textarea
                    id="adminNote"
                    placeholder="Add a note about this refund request..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
                {selectedRefund.status === "pending" && (
                  <>
                    <Button variant="destructive" onClick={handleRejectRefund}>
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject Refund
                    </Button>
                    <Button onClick={handleApproveRefund}>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve Refund
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
