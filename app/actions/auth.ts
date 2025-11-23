"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signIn(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message, values: { email: data.email } };
  }
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function signUp(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const password = formData.get("password") as string;
  if (password !== confirmPassword) {
    return { error: "كلمات المرور غير متطابقة.", values: { email, fullName } };
  }
  const data = {
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message, values: { email, fullName } };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
