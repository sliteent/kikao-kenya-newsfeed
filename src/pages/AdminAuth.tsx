
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";

const AdminAuth = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (adminProfile?.is_active) {
          navigate('/admin');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleAuthSuccess = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Kikao Kenya</h1>
          <p className="text-muted-foreground">News Admin Portal</p>
        </div>
        
        <AuthForm
          mode={mode}
          onModeChange={setMode}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};

export default AdminAuth;
