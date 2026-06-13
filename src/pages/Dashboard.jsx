import React, { useState, useEffect } from "react";
import { Document } from "@/entities/Document";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Eye,
  Upload as UploadIcon
} from "lucide-react";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentDocuments from "../components/dashboard/RecentDocuments";
import SecurityOverview from "../components/dashboard/SecurityOverview";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    const data = await Document.list("-created_date", 50);
    setDocuments(data);
    setIsLoading(false);
  };

  const getExpiringDocuments = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return documents.filter(doc => {
      if (!doc.expiry_date) return false;
      const expiryDate = new Date(doc.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= now;
    });
  };

  const getCriticalDocuments = () => {
    return documents.filter(doc => doc.security_level === "critical");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Your Documents, 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Secured</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Military-grade encryption for your most important documents. 
                Organize, access, and protect what matters most.
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-12">
              <Link to={createPageUrl("Upload")}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
                  <UploadIcon className="w-5 h-5 mr-2" />
                  Upload Documents
                </Button>
              </Link>
              <Link to={createPageUrl("Documents")}>
                <Button variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-all">
                  <Eye className="w-5 h-5 mr-2" />
                  Browse Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Stats Grid */}
        <StatsGrid 
          documents={documents}
          expiringDocuments={getExpiringDocuments()}
          criticalDocuments={getCriticalDocuments()}
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Documents - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentDocuments 
              documents={documents} 
              isLoading={isLoading}
              onReload={loadDocuments}
            />
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            <SecurityOverview 
              documents={documents}
              expiringDocuments={getExpiringDocuments()}
              isLoading={isLoading}
            />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}