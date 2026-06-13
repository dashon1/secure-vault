import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    {
      title: "Upload Document",
      description: "Add new files to your vault",
      icon: Upload,
      href: createPageUrl("Upload"),
      color: "bg-blue-50 hover:bg-blue-100 text-blue-700"
    },
    {
      title: "Browse Library",
      description: "Search your documents",
      icon: FileText,
      href: createPageUrl("Documents"),
      color: "bg-purple-50 hover:bg-purple-100 text-purple-700"
    }
  ];

  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-slate-200/60">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start h-auto p-4 ${action.color} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <action.icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm opacity-80">{action.description}</div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}