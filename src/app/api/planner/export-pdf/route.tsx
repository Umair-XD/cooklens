import { NextRequest, NextResponse } from "next/server";
import { getServerSessionSafe } from "@/lib/auth";
import { dbConnect } from "@/lib/db/connect";
import { MealPlan, IMealPlan, IMealSlot } from "@/lib/db/models/MealPlan";
import { Recipe, IRecipe } from "@/lib/db/models/Recipe";
import { Types } from "mongoose";
import React from "react";
import * as ReactPDF from "@react-pdf/renderer";

const { Document, Page, Text, View, StyleSheet } = ReactPDF;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MEALS = ["Breakfast", "Lunch", "Dinner"] as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  weekInfo: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  dayContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 12,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    padding: 6,
    borderRadius: 4,
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  mealLabel: {
    fontSize: 11,
    fontWeight: "bold",
    width: "20%",
  },
  recipeName: {
    fontSize: 11,
    width: "35%",
  },
  calorieText: {
    fontSize: 10,
    width: "15%",
    textAlign: "center",
  },
  macroText: {
    fontSize: 9,
    width: "30%",
    textAlign: "right",
    color: "#555",
  },
});

// ---------------------------------------------------------------------------
// PDF Document component
// ---------------------------------------------------------------------------

interface PdfDocumentProps {
  plan: IMealPlan;
  recipeMap: Record<string, IRecipe>;
}

function MealPlanDocument({ plan, recipeMap }: PdfDocumentProps) {
  const slots = plan.slots as unknown as (IMealSlot & { recipeId: IRecipe })[];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Weekly Meal Plan</Text>
        <Text style={styles.weekInfo}>
          Week of {new Date(plan.weekStart).toLocaleDateString()}
        </Text>

        {DAYS.map((day, dayIndex) => {
          const daySlots = slots.filter((s) => s.dayIndex === dayIndex);
          return (
            <View key={dayIndex} style={styles.dayContainer}>
              <Text style={styles.dayHeader}>{day}</Text>
              {MEALS.map((mealLabel, mealIdx) => {
                const mealTypeKey = mealLabel.toUpperCase();
                const slot = daySlots.find(
                  (s) => (s.mealType as string).toUpperCase() === mealTypeKey,
                );
                const recipe = slot
                  ? recipeMap[slot.recipeId.toString()]
                  : null;
                return (
                  <View key={mealIdx} style={styles.mealRow}>
                    <Text style={styles.mealLabel}>{mealLabel}</Text>
                    <Text style={styles.recipeName}>
                      {recipe?.name ?? "\u2014"}
                    </Text>
                    <Text style={styles.calorieText}>
                      {recipe?.nutrition?.caloriesPerServing
                        ? `${recipe.nutrition.caloriesPerServing} kcal`
                        : "\u2014"}
                    </Text>
                    <Text style={styles.macroText}>
                      {recipe?.nutrition
                        ? `P: ${recipe.nutrition.proteinGrams}g \u00B7 C: ${recipe.nutrition.carbsGrams}g \u00B7 F: ${recipe.nutrition.fatGrams}g`
                        : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const session = await getServerSessionSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const planId = searchParams.get("planId");

  if (!planId) {
    return NextResponse.json({ error: "planId is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    const plan = await MealPlan.findOne({
      _id: new Types.ObjectId(planId),
      userId: new Types.ObjectId(session.user.id),
    }).populate("slots.recipeId");

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Build recipe map
    const slots = plan.slots as unknown as (IMealSlot & {
      recipeId: IRecipe;
    })[];
    const recipeMap: Record<string, IRecipe> = {};
    for (const slot of slots) {
      if (slot.recipeId) {
        recipeMap[slot.recipeId.toString()] = slot.recipeId;
      }
    }

    // Render PDF to buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfElement = React.createElement(MealPlanDocument as any, {
      plan,
      recipeMap,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await ReactPDF.renderToBuffer(pdfElement as any);

    return new NextResponse(pdfBuffer as unknown as Blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="meal-plan-${planId}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
