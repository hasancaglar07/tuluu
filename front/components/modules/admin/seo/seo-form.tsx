"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import type { SEOFormData } from "@/types";
import SEOPreview from "./seo-preview";
import { Upload, RefreshCw } from "lucide-react";

// Zod schema for form validation
const formSchema = z.object({
  path: z
    .string()
    .min(1, "Path is required")
    .refine((val) => val.startsWith("/"), {
      message: "Path must start with /",
    }),
  title: z
    .string()
    .min(1, "Title is required")
    .max(60, "Title should be less than 60 characters"),
  description: z
    .string()
    .max(160, "Description should be less than 160 characters")
    .optional()
    .or(z.literal("")),
  ogImage: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  locale: z.string().min(1, "Locale is required"),
  robots: z.string(),
  structuredData: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Structured data must be valid JSON",
      }
    )
    .optional()
    .or(z.literal("")),
});

// Props for the SEO form component
interface SEOFormProps {
  defaultValues: SEOFormData;
  onSubmit: (data: SEOFormData) => Promise<void>;
  isNew: boolean;
}

// Reusable form component for creating and editing SEO entries
export default function SEOForm({
  defaultValues,
  onSubmit,
  isNew,
}: SEOFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values as SEOFormData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a title based on the path
  const generateTitleFromPath = () => {
    const path = form.getValues("path");
    if (!path) return;

    // Convert path to title case
    const pathWithoutSlashes = path.replace(/^\/|\/$/g, "");
    const segments = pathWithoutSlashes.split("/");
    const lastSegment = segments[segments.length - 1];

    // Convert kebab-case or snake_case to Title Case
    const title = lastSegment
      .replace(/-|_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    form.setValue("title", title);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic SEO</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Basic SEO Tab */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Path*</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="/about-us"
                        {...field}
                        disabled={!isNew}
                      />
                      {isNew && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generateTitleFromPath}
                          title="Generate title from path"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    The URL path of the page (e.g., /about-us)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title*</FormLabel>
                  <FormControl>
                    <Input placeholder="Page Title | Site Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Recommended length: 50-60 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of the page content..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Recommended length: 120-160 characters. Supports markdown.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language/Locale*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      {/* Add more languages as needed */}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The language this SEO data is for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Advanced SEO Tab */}
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="ogImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Open Graph Image</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        title="Upload image"
                        onClick={() =>
                          alert("Image upload functionality would go here")
                        }
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Image URL for social media sharing (1200x630px recommended)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="canonicalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canonical URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/page" {...field} />
                  </FormControl>
                  <FormDescription>
                    The preferred URL for this content (leave empty to use the
                    default)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="robots"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Robots Directives</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select robots directive" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="index,follow">
                        index,follow (Default)
                      </SelectItem>
                      <SelectItem value="noindex,follow">
                        noindex,follow
                      </SelectItem>
                      <SelectItem value="index,nofollow">
                        index,nofollow
                      </SelectItem>
                      <SelectItem value="noindex,nofollow">
                        noindex,nofollow
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Controls how search engines crawl and index the page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="structuredData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Structured Data (JSON-LD)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
                      className="resize-y font-mono text-sm h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    JSON-LD structured data for rich search results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <SEOPreview
                  title={form.watch("title")}
                  description={form.watch("description") || ""}
                  path={form.watch("path")}
                  ogImage={form.watch("ogImage") || ""}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isNew
              ? "Create SEO Entry"
              : "Update SEO Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
