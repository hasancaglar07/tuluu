"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";
import { Plus, GripVertical, X, Edit, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import axios, { type AxiosError } from "axios";
import { Category } from "@/types";

interface ShopCategoryManagerProps {
  categories?: Category[];
  onCategoriesUpdated?: () => void;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CategoriesReorderResponse {
  success: boolean;
  message: string;
}

export function ShopCategoryManager({
  categories: initialCategories = [],
  onCategoriesUpdated,
}: ShopCategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { getToken } = useAuth();

  // Update categories when prop changes
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Handle drag and drop reordering with proper typing
  const handleDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistically update UI
    setCategories(items);

    try {
      const token = await getToken();
      const categoryIds = items.map((item) => item.id);

      await axios.put<ApiResponse<CategoriesReorderResponse>>(
        process.env.NEXT_PUBLIC_API_URL + "/api/admin/shop/categories",
        { categoryIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Categories reordered successfully");
      onCategoriesUpdated?.();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<never>>;
      toast.error(
        axiosError.response?.data?.error || "Failed to reorder categories"
      );
      // Revert on error
      setCategories(initialCategories);
    }
  };

  // Add a new category
  const handleAddCategory = async (): Promise<void> => {
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      const token = await getToken();

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/admin/shop/categories",
        {
          name: newCategoryName,
          color: getRandomColor(),
          description: "",
          sortOrder: categories.length,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        const newCategory = response.data.data;
        setCategories((prev) => [...prev, newCategory]);
        setNewCategoryName("");
        toast.success("Category created successfully");
        onCategoriesUpdated?.();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<never>>;
      toast.error(
        axiosError.response?.data?.error || "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const token = await getToken();

      await axios.delete<ApiResponse<{ success: boolean }>>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/shop/categories/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCategories((prev) => prev.filter((category) => category.id !== id));
      toast.success("Category deleted successfully");
      onCategoriesUpdated?.();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<never>>;
      toast.error(
        axiosError.response?.data?.error || "Failed to delete category"
      );
    } finally {
      setLoading(false);
    }
  };

  // Start editing a category
  const handleEditStart = (category: Category): void => {
    setEditingCategory(category.id);
    setEditValue(category.name);
  };

  // Save edited category
  const handleEditSave = async (): Promise<void> => {
    if (!editValue.trim() || !editingCategory) return;

    try {
      const token = await getToken();

      const response = await axios.put<ApiResponse<Category>>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/shop/categories/${editingCategory}`,
        {
          name: editValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.data) {
        const updatedCategory = response.data.data;
        setCategories((prev) =>
          prev.map((category) =>
            category.id === editingCategory ? updatedCategory : category
          )
        );

        setEditingCategory(null);
        setEditValue("");
        toast.success("Category updated successfully");
        onCategoriesUpdated?.();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<never>>;
      toast.error(
        axiosError.response?.data?.error || "Failed to update category"
      );
    }
  };

  // Generate a random color for new categories
  const getRandomColor = (): string => {
    const colors = [
      "#4f46e5",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#84cc16",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle keyboard events
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === "Enter") {
      handleAddCategory();
    }
  };

  const handleEditKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === "Enter") {
      handleEditSave();
    } else if (event.key === "Escape") {
      setEditingCategory(null);
      setEditValue("");
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex gap-2">
        <Input
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1"
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={handleAddCategory}
          disabled={!newCategoryName.trim() || loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add
        </Button>
      </div>

      <Separator />

      <div className="text-sm text-muted-foreground mb-2">
        Drag to reorder categories as they will appear in the shop
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="categories"
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={true}
        >
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {categories.map((category, index) => (
                <Draggable
                  key={category.id}
                  draggableId={category.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center justify-between p-3 border rounded-md bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {editingCategory === category.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 w-[200px]"
                            autoFocus
                            onKeyDown={handleEditKeyDown}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                        )}

                        <Badge variant="outline" className="ml-2">
                          {category.itemCount} items
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        {editingCategory === category.id ? (
                          <Button
                            disabled={loading}
                            size="sm"
                            variant="ghost"
                            onClick={handleEditSave}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            disabled={loading}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStart(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          disabled={loading}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No categories yet. Add your first category above.
        </div>
      )}
    </div>
  );
}
