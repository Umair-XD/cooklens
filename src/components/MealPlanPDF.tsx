"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  weekInfo: { fontSize: 10, textAlign: "center", marginBottom: 20, color: "#666" },
  dayContainer: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0", paddingBottom: 12 },
  dayHeader: { fontSize: 14, fontWeight: "bold", marginBottom: 8, backgroundColor: "#f0f0f0", padding: 6, borderRadius: 4 },
  mealRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, paddingHorizontal: 8 },
  mealLabel: { fontSize: 11, fontWeight: "bold", width: "20%" },
  recipeName: { fontSize: 11, width: "35%" },
  calorieText: { fontSize: 10, width: "15%", textAlign: "center" },
  macroText: { fontSize: 9, width: "30%", textAlign: "right", color: "#555" },
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["Breakfast", "Lunch", "Dinner"];

interface MealPlanPDFProps {
  plan: any;
  recipeMap: any;
}

export default function MealPlanPDF({ plan, recipeMap }: MealPlanPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Weekly Meal Plan</Text>

        {DAYS.map((day, dayIndex) => {
          const daySlots = (plan.slots || []).filter((s: any) => s.dayIndex === dayIndex);
          return (
            <View key={dayIndex} style={styles.dayContainer}>
              <Text style={styles.dayHeader}>{day}</Text>
              {MEALS.map((mealLabel, mealIdx) => {
                const mealTypeKey = mealLabel.toUpperCase();
                const slot = daySlots.find(
                  (s: any) => String(s.mealType).toUpperCase() === mealTypeKey
                );
                const recipeIdStr = slot?.recipeId?._id || slot?.recipeId;
                const recipe = recipeIdStr ? recipeMap[recipeIdStr] : null;

                return (
                  <View key={mealIdx} style={styles.mealRow}>
                    <Text style={styles.mealLabel}>{mealLabel}</Text>
                    <Text style={styles.recipeName}>{recipe?.name ?? "—"}</Text>
                    <Text style={styles.calorieText}>
                      {recipe?.nutrition?.caloriesPerServing ? `${recipe.nutrition.caloriesPerServing} kcal` : "—"}
                    </Text>
                    <Text style={styles.macroText}>
                      {recipe?.nutrition ? `P: ${recipe.nutrition.proteinGrams}g · C: ${recipe.nutrition.carbsGrams}g · F: ${recipe.nutrition.fatGrams}g` : ""}
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
