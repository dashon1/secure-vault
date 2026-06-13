import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Shield, Download, Eye, FileText } from "lucide-react";

const COLORS = {
  identification: '#3b82f6',
  insurance: '#22c55e',
  legal_contracts: '#a855f7',
  medical_records: '#ef4444',
  financial_statements: '#eab308',
  tax_documents: '#f97316',
  property_deeds: '#6366f1',
  education_certificates: '#06b6d4',
  employment_records: '#ec4899',
  travel_documents: '#14b8a6',
  warranties: '#84cc16',
  other: '#6b7280'
};

export default function AnalyticsPage() {
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const docs = await base44.entities.Document.list();
      const acts = await base44.entities.ActivityLog.list("-created_date", 50);
      setDocuments(docs);
      setActivities(acts);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  // Category Distribution
  const categoryData = Object.entries(
    documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    color: COLORS[name]
  }));

  // Security Level Distribution
  const securityData = Object.entries(
    documents.reduce((acc, doc) => {
      acc[doc.security_level] = (acc[doc.security_level] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Storage by Category
  const storageData = Object.entries(
    documents.reduce((acc, doc) => {
      const size = doc.file_size || 0;
      acc[doc.category] = (acc[doc.category] || 0) + size;
      return acc;
    }, {})
  ).map(([name, bytes]) => ({
    name: name.replace(/_/g, ' '),
    size: (bytes / (1024 * 1024)).toFixed(2) // Convert to MB
  }));

  // Activity Timeline (last 7 days)
  const activityTimeline = activities.reduce((acc, activity) => {
    const date = new Date(activity.created_date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const timelineData = Object.entries(activityTimeline).map(([date, count]) => ({ date, count }));

  // Stats
  const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
  const avgSize = totalSize / (documents.length || 1);
  const totalViews = documents.reduce((sum, doc) => sum + (doc.view_count || 0), 0);
  const totalDownloads = documents.reduce((sum, doc) => sum + (doc.download_count || 0), 0);
  const importantDocs = documents.filter(d => d.is_important).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Insights and statistics about your document vault</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Storage</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(totalSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-slate-900">{totalViews}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Downloads</p>
                  <p className="text-2xl font-bold text-slate-900">{totalDownloads}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Important Docs</p>
                  <p className="text-2xl font-bold text-slate-900">{importantDocs}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Documents by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Security Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Security Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={securityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Storage and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Storage by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage by Category (MB)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="size" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}