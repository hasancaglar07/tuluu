"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Flag,
  AlertTriangle,
  Bug,
  MessageSquare,
  CreditCard,
  Pencil,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";

interface Report {
  id: string;
  type: "bug" | "content_issue" | "user_report" | "payment_issue";
  status: "open" | "in_progress" | "resolved" | "closed";
  title: string;
  description: string;
  date: string;
  priority: "low" | "medium" | "high" | "critical";
}

interface User {
  id: string;
  name: string;
  reports?: Report[];
}

interface UserReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function UserReportsDialog({
  open,
  onOpenChange,
  user,
}: UserReportsDialogProps) {
  const [activeTab, setActiveTab] = useState("submitted");
  const [statusFilter, setStatusFilter] = useState("all");

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  // Function to get report priority color
  const getReportPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-orange-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to get report status color
  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to get report type icon
  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4" />;
      case "content_issue":
        return <MessageSquare className="h-4 w-4" />;
      case "user_report":
        return <Flag className="h-4 w-4" />;
      case "payment_issue":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Filter reports based on status
  const filteredReports =
    user.reports?.filter(
      (report) => statusFilter === "all" || report.status === statusFilter
    ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Kullanıcı Raporları
          </DialogTitle>
          <DialogDescription>
            {user.name} kullanıcısı hakkında veya kullanıcı tarafından gönderilen raporları görüntüleyin.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="submitted">Kullanıcının Gönderdikleri</TabsTrigger>
              <TabsTrigger value="received">Kullanıcı Hakkında</TabsTrigger>
            </TabsList>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Duruma göre filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="in_progress">İşlemde</SelectItem>
                <SelectItem value="resolved">Çözüldü</SelectItem>
                <SelectItem value="closed">Kapalı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="submitted" className="mt-4 space-y-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-gray-100">
                          {getReportTypeIcon(report.type)}
                        </div>
                        <h3 className="font-medium">{report.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getReportPriorityColor(report.priority)}
                        >
                          {report.priority}
                        </Badge>
                        <Badge className={getReportStatusColor(report.status)}>
                          {report.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {report.type.replace("_", " ")} •{" "}
                      {formatDate(report.date)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{report.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-0">
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-2" />
                      Durumu Güncelle
                    </Button>
                    <Button variant="outline" size="sm">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Ata
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Rapor Bulunamadı</h3>
                <p className="text-sm text-gray-500">
                  {activeTab === "submitted"
                    ? "Bu kullanıcı henüz rapor göndermedi."
                    : "Bu kullanıcı hakkında rapor bulunmuyor."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-4">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Rapor Bulunamadı</h3>
              <p className="text-sm text-gray-500">
                Bu kullanıcı hakkında rapor bulunmuyor.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
