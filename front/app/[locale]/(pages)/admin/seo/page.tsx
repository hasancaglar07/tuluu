"use client";

import { useState, useEffect } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, Edit2, Trash2 } from "lucide-react";
import type { SEOEntry } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";

// Main SEO Admin Panel page that lists all SEO entries with filtering and sorting capabilities
export default function SEOAdminPage() {
  const router = useLocalizedRouter();
  const [seoEntries, setSeoEntries] = useState<SEOEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [localeFilter, setLocaleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastModified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { getToken } = useAuth();

  // Fetch SEO entries from the API
  useEffect(() => {
    const fetchSEOEntries = async () => {
      try {
        const token = await getToken();

        const response = await apiClient.get("/api/admin/seo", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setSeoEntries(response.data);
      } catch (error) {
        console.error("Delete account failed:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    };

    fetchSEOEntries();
  }, [getToken]);

  // Filter and sort the SEO entries based on user selections
  const filteredEntries = seoEntries
    .filter((entry) => {
      // Filter by search query (path or title)
      const matchesSearch =
        entry.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by locale if a specific locale is selected
      const matchesLocale =
        localeFilter === "all" || entry.locale === localeFilter;

      return matchesSearch && matchesLocale;
    })
    .sort((a, b) => {
      // Sort by the selected field
      if (sortBy === "lastModified") {
        return sortOrder === "asc"
          ? new Date(a.lastModified).getTime() -
              new Date(b.lastModified).getTime()
          : new Date(b.lastModified).getTime() -
              new Date(a.lastModified).getTime();
      } else if (sortBy === "path") {
        return sortOrder === "asc"
          ? a.path.localeCompare(b.path)
          : b.path.localeCompare(a.path);
      } else if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });

  // Handle deleting an SEO entry
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this SEO entry?")) {
      try {
        const response = await fetch(`/api/admin/seo/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete SEO entry");

        // Remove the deleted entry from the state
        setSeoEntries(seoEntries.filter((entry) => entry._id !== id));
      } catch (error) {
        console.error("Error deleting SEO entry:", error);
      }
    }
  };

  // Toggle sort order when clicking on a sortable column
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SEO Management</h1>
        <Button onClick={() => router.push("/admin/seo/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New SEO Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SEO Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by path or title..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Locale filter */}
            <Select value={localeFilter} onValueChange={setLocaleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by locale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locales</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                {/* Add more locales as needed */}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading SEO entries...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-4">
              {searchQuery || localeFilter !== "all"
                ? "No SEO entries match your filters."
                : "No SEO entries found. Create your first one!"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("path")}
                    >
                      Path{" "}
                      {sortBy === "path" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("title")}
                    >
                      Title{" "}
                      {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Locale</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("lastModified")}
                    >
                      Last Modified{" "}
                      {sortBy === "lastModified" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell className="font-medium">
                        {entry.path}
                      </TableCell>
                      <TableCell>{entry.title}</TableCell>
                      <TableCell>{entry.locale}</TableCell>
                      <TableCell>
                        {new Date(entry.lastModified).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/seo/${entry._id}`)
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(entry._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
