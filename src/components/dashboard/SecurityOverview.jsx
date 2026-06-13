import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function SecurityOverview({ documents, expiringDocuments, isLoading }) {
  const securityLevels = {
    critical: documents.filter(d => d.security_level === "critical").length,
    high: documents.filter(d => d.security_level === "high").length,
    standard: documents.filter(d => d.security_level === "standard").length
  };

  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-slate-200/60">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Shield className="w-5 h-5 text-blue-600" />
          Security Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Security Levels */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Security Classification</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Critical</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {securityLevels.critical}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">High</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {securityLevels.high}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Standard</span>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {securityLevels.standard}
                </Badge>
              </div>
            </div>
          </div>

          {/* Expiring Documents */}
          {expiringDocuments.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Expiring Soon
              </h4>
              <div className="space-y-2">
                {expiringDocuments.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{doc.name}</p>
                        <p className="text-xs text-orange-700">
                          Expires {format(new Date(doc.expiry_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {expiringDocuments.length > 3 && (
                  <p className="text-xs text-slate-500 text-center">
                    +{expiringDocuments.length - 3} more documents expiring soon
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Security Status */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Security Status</span>
            </div>
            <p className="text-sm text-green-800">All documents encrypted with AES-256</p>
            <p className="text-sm text-green-800">Zero-knowledge architecture active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}