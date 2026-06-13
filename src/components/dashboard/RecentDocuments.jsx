import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Star, Copy, Eye, Download, FileImage, File } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DocumentPreviewModal from "../documents/DocumentPreviewModal";

const categoryColors = {
  identification: "bg-blue-100 text-blue-800 border-blue-200",
  insurance: "bg-green-100 text-green-800 border-green-200",
  legal_contracts: "bg-purple-100 text-purple-800 border-purple-200",
  medical_records: "bg-red-100 text-red-800 border-red-200",
  financial_statements: "bg-yellow-100 text-yellow-800 border-yellow-200",
  tax_documents: "bg-orange-100 text-orange-800 border-orange-200",
  property_deeds: "bg-indigo-100 text-indigo-800 border-indigo-200",
  education_certificates: "bg-cyan-100 text-cyan-800 border-cyan-200",
  employment_records: "bg-pink-100 text-pink-800 border-pink-200",
  travel_documents: "bg-teal-100 text-teal-800 border-teal-200",
  warranties: "bg-lime-100 text-lime-800 border-lime-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

const securityColors = {
  standard: "bg-slate-100 text-slate-700",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

const getFileIcon = (document) => {
  const fileType = document.file_type?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) return FileImage;
  if (['pdf'].includes(fileType)) return FileText;
  if (['doc', 'docx'].includes(fileType)) return FileText;
  return File;
};

export default function RecentDocuments({ documents, isLoading, onReload }) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const recentDocuments = documents.slice(0, 8);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openPreview = (document) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedDocument(null);
  };

  const handleDelete = () => {
    closePreview();
    if (onReload) onReload();
  };

  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-slate-200/60">
      <CardHeader className="border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-900">Recent Documents</CardTitle>
          <Link to={createPageUrl("Documents")}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : recentDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents yet</h3>
            <p className="text-slate-500 mb-6">Start by uploading your first document to SecureVault</p>
            <Link to={createPageUrl("Upload")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Upload Your First Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentDocuments.map((document) => {
              const FileIcon = getFileIcon(document);
              return (
                <div 
                  key={document.id} 
                  className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={(e) => {
                    if (e.target.closest('button') || e.target.closest('a')) return;
                    openPreview(document);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                      <FileIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 truncate">{document.name}</h4>
                        {document.is_important && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Uploaded {format(new Date(document.created_date), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span>{document.file_type?.toUpperCase()}</span>
                        {document.file_size && (
                          <>
                            <span>•</span>
                            <span>{Math.round(document.file_size / 1024)} KB</span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className={categoryColors[document.category]}>
                          {document.category.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="secondary" className={securityColors[document.security_level]}>
                          {document.security_level}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {document.file_url && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700"
                            title="View document"
                          >
                            <a
                              href={document.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-700"
                            title="Download document"
                          >
                            <a
                              href={document.file_url}
                              download={document.name}
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(document.file_url, document.id)}
                            className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-700"
                            title="Copy link"
                          >
                            <Copy className={`w-4 h-4 ${copiedId === document.id ? 'text-green-600' : ''}`} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <DocumentPreviewModal
        document={selectedDocument}
        isOpen={isPreviewOpen}
        onClose={closePreview}
        onDelete={handleDelete}
        onReload={onReload}
      />
    </Card>
  );
}