"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types/shop";
import { apiClient } from "@/lib/api-client";
import { FormattedMessage } from "react-intl";

interface ShopCategoryManagerProps {
  categories: Category[];
  onCategoriesUpdated: () => void;
}

/**
 * ShopCategoryManager - Component for managing shop categories
 *
 * @component
 * @param {Object} props - Component props
 * @param {Category[]} props.categories - List of categories
 * @param {Function} props.onCategoriesUpdated - Callback when categories are updated
 */
export function ShopCategoryManager({
  categories,
  onCategoriesUpdated,
}: ShopCategoryManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const { getToken } = useAuth();

  // Reset form data
  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingCategory(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      const token = await getToken();

      if (editingCategory) {
        // Update existing category
        await apiClient.put(
          `/api/admin/shop/categories/${editingCategory.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success(
          <FormattedMessage
            id="shop.success.category-updated"
            defaultMessage="Category updated successfully"
          />
        );
      } else {
        // Create new category
        await apiClient.post("/api/admin/shop/categories", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(
          <FormattedMessage
            id="shop.success.category-created"
            defaultMessage="Category created successfully"
          />
        );
      }

      onCategoriesUpdated();
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(
        <FormattedMessage
          id="shop.error.save-category"
          defaultMessage="Failed to save category"
        />
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle category deletion
  const handleDelete = async (categoryId: string) => {
    try {
      const token = await getToken();

      await apiClient.delete(`/api/admin/shop/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onCategoriesUpdated();
      toast.success(
        <FormattedMessage
          id="shop.success.category-deleted"
          defaultMessage="Category deleted successfully"
        />
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        <FormattedMessage
          id="shop.error.delete-category"
          defaultMessage="Failed to delete category"
        />
      );
    }
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          <FormattedMessage
            id="shop.categories.title"
            defaultMessage="Categories"
          />
        </h3>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              <FormattedMessage
                id="shop.categories.add"
                defaultMessage="Add Category"
              />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? (
                  <FormattedMessage
                    id="shop.categories.edit.title"
                    defaultMessage="Edit Category"
                  />
                ) : (
                  <FormattedMessage
                    id="shop.categories.create.title"
                    defaultMessage="Create Category"
                  />
                )}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? (
                  <FormattedMessage
                    id="shop.categories.edit.description"
                    defaultMessage="Update the category details."
                  />
                ) : (
                  <FormattedMessage
                    id="shop.categories.create.description"
                    defaultMessage="Create a new category for organizing shop items."
                  />
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium">
                  <FormattedMessage
                    id="shop.categories.form.name"
                    defaultMessage="Name"
                  />
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Category name"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium">
                  <FormattedMessage
                    id="shop.categories.form.description"
                    defaultMessage="Description"
                  />
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Category description (optional)"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  <FormattedMessage
                    id="shop.categories.form.cancel"
                    defaultMessage="Cancel"
                  />
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <FormattedMessage
                      id="shop.categories.form.saving"
                      defaultMessage="Saving..."
                    />
                  ) : editingCategory ? (
                    <FormattedMessage
                      id="shop.categories.form.update"
                      defaultMessage="Update"
                    />
                  ) : (
                    <FormattedMessage
                      id="shop.categories.form.create"
                      defaultMessage="Create"
                    />
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <FormattedMessage
                id="shop.categories.table.name"
                defaultMessage="Name"
              />
            </TableHead>
            <TableHead>
              <FormattedMessage
                id="shop.categories.table.description"
                defaultMessage="Description"
              />
            </TableHead>
            <TableHead>
              <FormattedMessage
                id="shop.categories.table.items"
                defaultMessage="Items"
              />
            </TableHead>
            <TableHead>
              <FormattedMessage
                id="shop.categories.table.status"
                defaultMessage="Status"
              />
            </TableHead>
            <TableHead className="text-right">
              <FormattedMessage
                id="shop.categories.table.actions"
                defaultMessage="Actions"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.description || "—"}</TableCell>
              <TableCell>{category.itemCount}</TableCell>
              <TableCell>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? (
                    <FormattedMessage
                      id="shop.categories.status.active"
                      defaultMessage="Active"
                    />
                  ) : (
                    <FormattedMessage
                      id="shop.categories.status.inactive"
                      defaultMessage="Inactive"
                    />
                  )}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          <FormattedMessage
                            id="shop.categories.delete.title"
                            defaultMessage="Delete Category"
                          />
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <FormattedMessage
                            id="shop.categories.delete.description"
                            defaultMessage="Are you sure you want to delete this category? This action cannot be undone."
                          />
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          <FormattedMessage
                            id="shop.categories.delete.cancel"
                            defaultMessage="Cancel"
                          />
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(category.id)}
                        >
                          <FormattedMessage
                            id="shop.categories.delete.confirm"
                            defaultMessage="Delete"
                          />
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {categories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            <FormattedMessage
              id="shop.categories.empty"
              defaultMessage="No categories found. Create your first category to get started."
            />
          </p>
        </div>
      )}
    </div>
  );
}
