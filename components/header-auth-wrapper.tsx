import { createClient } from "@/utils/supabase/server";
import HeaderAuth from "./header-auth";

export default async function HeaderAuthWrapper() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log('[Server] Auth State:', { user: user?.email, error: error?.message });
  
  if (error) {
    console.error('[Server] Error fetching user:', error);
    return <HeaderAuth initialEmail={null} />;
  }

  return <HeaderAuth initialEmail={user?.email || null} />;
} 