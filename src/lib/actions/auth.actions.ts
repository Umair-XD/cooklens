"use server";

import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  // Clear the next-auth session token cookie
  const cookieStore = await cookies();
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");
  redirect("/login");
}

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required").optional(),
});

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;

  const validation = registerSchema.safeParse({ email, password, displayName });

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.errors.map((err) => ({
        field: err.path[0] as string,
        message: err.message,
      })),
    };
  }

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        success: false,
        errors: [{ field: "email", message: "Email already in use" }],
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      displayName: displayName || email.split("@")[0],
      role: "USER",
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      errors: [
        { field: "general", message: "Registration failed. Please try again." },
      ],
    };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      errors: [{ field: "general", message: "Invalid credentials" }],
    };
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        errors: [{ field: "general", message: "Invalid credentials" }],
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        errors: [{ field: "general", message: "Invalid credentials" }],
      };
    }

    return { success: true, userId: user._id.toString() };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      errors: [
        { field: "general", message: "Login failed. Please try again." },
      ],
    };
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    displayName?: string;
    photoUrl?: string;
    email?: string;
  },
) {
  try {
    await dbConnect();

    const updateData: Record<string, unknown> = {};
    if (data.displayName) updateData.displayName = data.displayName;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.email) updateData.email = data.email.toLowerCase();

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return {
        success: false,
        errors: [{ field: "general", message: "User not found" }],
      };
    }

    return {
      success: true,
      user: {
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
      },
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      errors: [
        {
          field: "general",
          message: "Profile update failed. Please try again.",
        },
      ],
    };
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: {
    cuisineTypes?: string[];
    dietaryRestrictions?: string[];
    dislikedIngredients?: string[];
  },
) {
  try {
    await dbConnect();

    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true },
    );

    if (!user) {
      return {
        success: false,
        errors: [{ field: "general", message: "User not found" }],
      };
    }

    return { success: true, preferences: user.preferences };
  } catch (error) {
    console.error("Preferences update error:", error);
    return {
      success: false,
      errors: [
        {
          field: "general",
          message: "Preferences update failed. Please try again.",
        },
      ],
    };
  }
}
