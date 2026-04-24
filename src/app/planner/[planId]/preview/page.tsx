"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MealPlanPDF from "@/components/MealPlanPDF";

export default function PlanPreviewPage() {
  const params = useParams();
  const planId = params?.planId as string;
  const [data, setData] = useState<{ plan: any; recipeMap: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Preparing your data...");

  useEffect(() => {
    if (!planId) return;

    fetch(`/api/planner/${planId}/data`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setStatus("Generating PDF...");
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [planId]);

  useEffect(() => {
    if (data?.plan) {
      const generateAndRedirect = async () => {
        try {
          // Dynamically import the pdf function to keep it on the client
          const { pdf } = await import("@react-pdf/renderer");
          
          const blob = await pdf(
            <MealPlanPDF plan={data.plan} recipeMap={data.recipeMap} />
          ).toBlob();
          
          const url = URL.createObjectURL(blob);
          
          // Open the PDF directly in the current tab
          // This uses the browser's native PDF viewer (full tab)
          window.location.replace(url);
        } catch (err) {
          console.error("PDF generation failed:", err);
          setLoading(false);
        }
      };
      
      generateAndRedirect();
    }
  }, [data]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-medium">{status}</p>
        {!loading && (
          <p className="text-destructive text-sm font-bold">
            Failed to generate preview. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
