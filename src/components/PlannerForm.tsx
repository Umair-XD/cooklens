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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  age: z.coerce.number().min(1, "Age must be positive").max(120, "Age must be 120 or less"),
  weightKg: z.coerce.number().min(1, "Weight must be positive").max(500, "Weight must be 500 or less"),
  heightCm: z.coerce.number().min(50, "Height must be positive").max(300, "Height must be 300 or less"),
  sex: z.enum(["male", "female"], { required_error: "Please select your sex" }),
  activityLevel: z.enum(
    ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"],
    { required_error: "Please select your activity level" },
  ),
  goal: z.enum(["lose_weight", "maintain", "gain_weight"], {
    required_error: "Please select your goal",
  }),
});

export type PlannerFormValues = z.infer<typeof formSchema>;

interface PlannerFormProps {
  onSubmit: (values: PlannerFormValues) => void;
  isLoading: boolean;
  tdeeResult: number | null;
}

export default function PlannerForm({ onSubmit, isLoading, tdeeResult }: PlannerFormProps) {
  const form = useForm<PlannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weightKg: undefined,
      heightCm: undefined,
      sex: undefined,
      activityLevel: undefined,
      goal: "maintain",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meal Planner</CardTitle>
        <CardDescription>
          Enter your stats to generate a personalized 7-day meal plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="70" {...field} />
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
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="175" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sex</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <FormLabel htmlFor="male" className="font-normal">Male</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <FormLabel htmlFor="female" className="font-normal">Female</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="lightly_active">
                        Lightly Active (exercise 1-3 days/week)
                      </SelectItem>
                      <SelectItem value="moderately_active">
                        Moderately Active (exercise 3-5 days/week)
                      </SelectItem>
                      <SelectItem value="very_active">
                        Very Active (exercise 6-7 days/week)
                      </SelectItem>
                      <SelectItem value="extra_active">
                        Extra Active (very hard exercise / physical job)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lose_weight">Lose Weight (-500 kcal)</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                      <SelectItem value="gain_weight">Gain Weight (+500 kcal)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tdeeResult !== null && (
              <div className="rounded-md bg-primary/10 p-4 text-center">
                <p className="text-sm font-medium text-primary">
                  Your estimated TDEE: {tdeeResult} kcal/day
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Generating Plan..." : "Generate 7-Day Plan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
