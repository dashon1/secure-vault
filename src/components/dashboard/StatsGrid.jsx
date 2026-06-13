import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Shield, Clock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsGrid({ documents, expiringDocuments, criticalDocuments, isLoading }) {
  const stats = [
    {
      title: "Total Documents",
      value: documents.length,
      icon: FileText,
      bgColor: "bg-blue-500",
      description: "Securely stored"
    },
    {
      title: "Critical Security",
      value: criticalDocuments.length,
      icon: Shield,
      bgColor: "bg-red-500",
      description: "High-priority files"
    },
    {
      title: "Expiring Soon",
      value: expiringDocuments.length,
      icon: Clock,
      bgColor: "bg-orange-500",
      description: "Within 30 days"
    },
    {
      title: "Storage Used",
      value: `${Math.round(documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0) / (1024 * 1024))}MB`,
      icon: AlertTriangle,
      bgColor: "bg-green-500",
      description: "Encrypted storage"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-slate-200/60">
          <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 ${stat.bgColor} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`} />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </p>
                )}
                <p className="text-xs text-slate-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} bg-opacity-15 group-hover:bg-opacity-25 transition-all`}>
                <stat.icon className={`w-6 h-6 ${stat.bgColor.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}