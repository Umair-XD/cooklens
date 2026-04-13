"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, User, Activity, Flag, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const formSchema = z.object({
  age: z.coerce.number().min(1).max(120),
  weightKg: z.coerce.number().min(1).max(500),
  heightCm: z.coerce.number().min(50).max(300),
  sex: z.enum(["male", "female"]),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active",
  ]),
  goal: z.enum(["lose_weight", "maintain", "gain_weight"]),
});

export type PlannerFormValues = z.infer<typeof formSchema>;

interface PlannerFormProps {
  onSubmit: (values: PlannerFormValues) => void;
  isLoading: boolean;
  tdeeResult: number | null;
}

export default function PlannerForm({
  onSubmit,
  isLoading,
  tdeeResult,
}: PlannerFormProps) {
  const form = useForm<PlannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 25,
      weightKg: 70,
      heightCm: 175,
      sex: "male",
      activityLevel: "sedentary",
      goal: "maintain",
    },
  });

  return (
    <Card className="border-none shadow-premium glass">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <CardTitle className="text-xl">Your Profile</CardTitle>
        </div>
        <CardDescription>
          Personalize your plan based on your body stats and goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Age */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel className="text-sm font-medium">Age</FormLabel>
                      <span className="text-xs font-semibold text-primary">{field.value} yrs</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weight / Height Grid */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" className="bg-background/50 border-muted-foreground/20 focus:border-primary/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="heightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" className="bg-background/50 border-muted-foreground/20 focus:border-primary/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sex */}
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium">Biological Sex</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2 bg-background/40 px-3 py-2 rounded-md border border-border/50 flex-1 cursor-pointer hover:bg-background/60 transition-colors">
                          <RadioGroupItem value="male" id="sex-male" />
                          <label htmlFor="sex-male" className="text-sm cursor-pointer flex-1">Male</label>
                        </div>
                        <div className="flex items-center space-x-2 bg-background/40 px-3 py-2 rounded-md border border-border/50 flex-1 cursor-pointer hover:bg-background/60 transition-colors">
                          <RadioGroupItem value="female" id="sex-female" />
                          <label htmlFor="sex-female" className="text-sm cursor-pointer flex-1">Female</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Activity Level */}
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <FormLabel className="text-sm font-medium">Activity Level</FormLabel>
                    </div>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (Office job)</SelectItem>
                        <SelectItem value="lightly_active">Light (1-3 days/wk)</SelectItem>
                        <SelectItem value="moderately_active">Moderate (3-5 days/wk)</SelectItem>
                        <SelectItem value="very_active">Active (6-7 days/wk)</SelectItem>
                        <SelectItem value="extra_active">Extra Active (Athlete)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Goal */}
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-1">
                      <Flag className="h-4 w-4 text-muted-foreground" />
                      <FormLabel className="text-sm font-medium">Nutrition Goal</FormLabel>
                    </div>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lose_weight">Lose Weight (-500 kcal)</SelectItem>
                        <SelectItem value="maintain">Maintain Weight</SelectItem>
                        <SelectItem value="gain_weight">Gain Weight (+500 kcal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* TDEE Summary */}
            {tdeeResult !== null && (
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Your Daily Target</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">{tdeeResult}</span>
                  <span className="text-sm font-medium text-muted-foreground">kcal / day</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-md font-semibold shadow-lg group relative overflow-hidden"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Crafting Plan...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate AI Plan
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
