"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Upload,
  Languages,
  Filter,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { toast } from "sonner";
import { TranslationTable } from "@/components/modules/admin/translation-table";
import { TranslationKeyDialog } from "@/components/modules/admin/translation-key-dialog";
import { ImportTranslationsDialog } from "@/components/modules/admin/import-translations-dialog";
import { LanguageManagementDialog } from "@/components/modules/admin/language-management-dialog";

// Mock data for demonstration
const MOCK_LANGUAGES = [
  { code: "en", name: "English", isDefault: true, completionPercentage: 100 },
  { code: "es", name: "Spanish", isDefault: false, completionPercentage: 87 },
  { code: "fr", name: "French", isDefault: false, completionPercentage: 76 },
  { code: "de", name: "German", isDefault: false, completionPercentage: 65 },
  { code: "it", name: "Italian", isDefault: false, completionPercentage: 42 },
  { code: "ja", name: "Japanese", isDefault: false, completionPercentage: 31 },
];

const MOCK_MODULES = [
  { id: "quests", name: "Quests", count: 45 },
  { id: "shop", name: "Shop", count: 67 },
  { id: "lessons", name: "Lessons", count: 124 },
  { id: "settings", name: "Settings", count: 38 },
  { id: "users", name: "Users", count: 29 },
  { id: "dashboard", name: "Dashboard", count: 52 },
  { id: "payments", name: "Payments", count: 41 },
];

export default function TranslationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);

  const handleExportTranslations = () => {
    // In a real implementation, this would generate and download JSON files
    toast("Translations exported", {
      description: "All translation files have been exported successfully.",
    });
  };

  const totalTranslations = MOCK_MODULES.reduce(
    (acc, module) => acc + module.count,
    0
  );
  const missingTranslations = 87; // This would be calculated in a real implementation

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Translation Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage translations for all parts of your application
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsLanguageDialogOpen(true)}
          >
            <Languages className="mr-2 h-4 w-4" />
            Manage Languages
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExportTranslations}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddKeyDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Translation Key
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Translation Status</CardTitle>
            <CardDescription>Overall translation completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />

              <div className="pt-4">
                <h4 className="text-sm font-medium mb-3">Languages</h4>
                <div className="space-y-3">
                  {MOCK_LANGUAGES.map((language) => (
                    <div
                      key={language.code}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <span className="text-sm">{language.name}</span>
                        {language.isDefault && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {language.completionPercentage}%
                        </span>
                        <div className="w-20">
                          <Progress
                            value={language.completionPercentage}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Translation Keys</CardTitle>
            <CardDescription>Key distribution by module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Total Keys</span>
                <span>{totalTranslations}</span>
              </div>
              <Separator />
              <div className="space-y-3">
                {MOCK_MODULES.map((module) => (
                  <div
                    key={module.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{module.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {module.count} keys
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Missing Translations</CardTitle>
            <CardDescription>Keys that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Missing Translations</span>
                <span>{missingTranslations}</span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMissingOnly(true)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Show Missing Only
              </Button>

              <div className="pt-2">
                <h4 className="text-sm font-medium mb-3">
                  Top Missing by Language
                </h4>
                <div className="space-y-3">
                  {MOCK_LANGUAGES.filter(
                    (lang) => lang.completionPercentage < 100
                  )
                    .sort(
                      (a, b) => a.completionPercentage - b.completionPercentage
                    )
                    .slice(0, 3)
                    .map((language) => (
                      <div
                        key={language.code}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{language.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(
                            ((100 - language.completionPercentage) *
                              totalTranslations) /
                              100
                          )}{" "}
                          missing
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search translations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {MOCK_MODULES.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {MOCK_LANGUAGES.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showMissingOnly ? "default" : "outline"}
            className="w-full sm:w-auto"
            onClick={() => setShowMissingOnly(!showMissingOnly)}
          >
            {showMissingOnly ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Missing Only
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Missing Only
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-4">
            <TranslationTable
              searchQuery={searchQuery}
              selectedModule={selectedModule}
              selectedLanguage={selectedLanguage}
              showMissingOnly={showMissingOnly}
            />
          </TabsContent>
          <TabsContent value="grid" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Grid view would be implemented here */}
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  quest.daily.title
                </p>
                <h3 className="font-medium mb-3">Daily Quest</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Spanish</span>
                    <span className="text-xs">Misión diaria</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">French</span>
                    <span className="text-xs">Quête quotidienne</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">German</span>
                    <span className="text-xs text-red-500">Missing</span>
                  </div>
                </div>
              </Card>
              {/* More cards would be here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TranslationKeyDialog
        open={isAddKeyDialogOpen}
        onOpenChange={setIsAddKeyDialogOpen}
      />

      <ImportTranslationsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />

      <LanguageManagementDialog
        open={isLanguageDialogOpen}
        onOpenChange={setIsLanguageDialogOpen}
      />
    </div>
  );
}
