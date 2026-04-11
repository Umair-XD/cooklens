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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Age / Weight / Height row */}
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Age</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-9 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Weight</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-9 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heightCm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Height</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-9 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Sex */}
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Sex</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <RadioGroupItem value="male" id="sex-male" />
                        Male
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <RadioGroupItem value="female" id="sex-female" />
                        Female
                      </label>
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
                  <FormLabel className="text-[12px]">Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="lightly_active">
                        Light (1-3 days/wk)
                      </SelectItem>
                      <SelectItem value="moderately_active">
                        Moderate (3-5 days/wk)
                      </SelectItem>
                      <SelectItem value="very_active">
                        Active (6-7 days/wk)
                      </SelectItem>
                      <SelectItem value="extra_active">Very Active</SelectItem>
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
                  <FormLabel className="text-[12px]">Goal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lose_weight">Lose Weight</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                      <SelectItem value="gain_weight">Gain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* TDEE display */}
            {tdeeResult !== null && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5">
                <Target className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm">
                  TDEE:{" "}
                  <span className="font-semibold text-primary">
                    {tdeeResult}
                  </span>{" "}
                  kcal/day
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-9 text-sm"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate Plan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
