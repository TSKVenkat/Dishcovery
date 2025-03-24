"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { data,error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }  
  
  const userId = data?.user?.id;  
  if (userId) {
    
    await supabase.from("user_profiles").insert([{ user_id: userId, form_submitted: false }]);
  }
  return encodedRedirect(
      "success",
      "/sign-in",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return encodedRedirect("error", "/sign-in", "User not found");
  }

  const userId = userData.user.id;
  const {data:selectdata,error:selecterror}=await supabase.from("user_profiles").select("form_submitted").eq("user_id", userId).single();
  if(selecterror){
    return encodedRedirect("error", "/sign-in", "Error fetching user profile")
  }
  if(!selectdata?.form_submitted){
    return encodedRedirect("success", "/protected/form", "Please fill in the following form details")

  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};


export const handleFormSubmit=async(form:Record<string,string>)=>{
  const supabase = await createClient();


  const formDataString = `Age: ${form.age}, Gender: ${form.gender}, Pregnancy Status: ${form.pregnancyStatus}, 
  Diet Preferences: ${form.dietPreferences}, Specific Diet: ${form.specificDiet}, 
  Fitness Goals: ${form.fitnessGoals}, Additional Info: ${form.additionalInfo || "None"}`;

  const {data,error}= await supabase.auth.getUser();
  if (error||!data?.user){
    console.log("Error with user session");
    return {error};
  }
  const userid=data.user.id;
  const {error: upserterror } = await supabase
  .from("user_profiles")
  .upsert([
    {
      user_id: userid, 
      about: formDataString, 
    },
  ], { onConflict: "user_id" });

  if (upserterror) {
    console.error("Error upserting data:", upserterror);
    return{error:upserterror}
  } else {
    const {error:updateError}=await supabase.from("user_profiles").update({ form_submitted: true }).eq("user_id", userid);

    if(updateError){
      console.error("Error updating form submission status:", updateError);
      return { error: updateError };
    }else{
      encodedRedirect("success","/protected","Your details have successfully been stored")

      
    }


  }
};




