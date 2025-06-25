import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import './AuthForm.css';

function AuthForm() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="auth-container">
        <h1>Welcome to Bleater</h1>
        <div className="auth-widget">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']}
            socialLayout="horizontal"
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="auth-container">
        <h1>Welcome {session.user.email}</h1>
        <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </div>
    );
  }
}

export default AuthForm;
