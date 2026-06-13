import React, { useState, useEffect, useCallback } from "react";
import { Document } from "@/entities/Document";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, Plus, Download, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import DocumentGrid from "../components/documents/DocumentGrid";
import DocumentFilters from "../components/documents/DocumentFilters";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    security_level: "all",
    is_important: "all"
  });
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    loadDocuments();
  }, []);

  const filterDocuments = useCallback(() => {
    let filtered = documents;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        doc.category.toLowerCase().replace(/_/g, ' ').includes(query)
      );
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(doc => doc.category === filters.category);
    }

    // Security level filter
    if (filters.security_level !== "all") {
      filtered = filtered.filter(doc => doc.security_level === filters.security_level);
    }

    // Important filter
    if (filters.is_important !== "all") {
      const isImportant = filters.is_important === "true";
      filtered = filtered.filter(doc => doc.is_important === isImportant);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, filters]);

  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await Document.list("-created_date");
      setDocuments(data);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDocuments();
    setIsRefreshing(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      category: "all",
      security_level: "all",
      is_important: "all"
    });
  };

  const exportDocumentList = () => {
    const csvContent = [
      ["Name", "Category", "Security Level", "Important", "Created Date", "Expiry Date", "Tags"].join(','),
      ...filteredDocuments.map(doc => [
        `"${doc.name}"`,
        `"${doc.category.replace(/_/g, ' ')}"`,
        `"${doc.security_level}"`,
        doc.is_important ? "Yes" : "No",
        new Date(doc.created_date).toLocaleDateString(),
        doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : "",
        `"${doc.tags?.join(', ') || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document-list.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters = searchQuery.trim() || 
                         filters.category !== "all" || 
                         filters.security_level !== "all" || 
                         filters.is_important !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Document Library</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-slate-600">
                {isLoading ? "Loading..." : `${documents.length} total documents`}
                {!isLoading && hasActiveFilters && (
                  <span className="ml-2">• {filteredDocuments.length} shown</span>
                )}
              </p>
              {hasActiveFilters && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Filters Active
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 lg:flex-none"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {!isLoading && documents.length > 0 && (
              <Button
                variant="outline"
                onClick={exportDocumentList}
                className="flex-1 lg:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                Export List
              </Button>
            )}
            <Link to={createPageUrl("Upload")} className="flex-1 lg:flex-none">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Upload New
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search documents, tags, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                ×
              </Button>
            )}
          </div>

          {/* Filters and View Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <DocumentFilters filters={filters} setFilters={setFilters} />
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        <DocumentGrid 
          documents={filteredDocuments}
          isLoading={isLoading}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
}