console.log("ProtectedPage loaded")
import ImageSelector from "@/components/imageselector";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser(); 
  const user = userData?.user; 
 
  console.log("User in ProtectedPage:", user);

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <ImageSelector/>

  );
}
