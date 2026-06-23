import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else if (data.user) {
      // Look up role to route correctly
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
      const role = profile?.role;
      if (role === 'superadmin') navigate('/admin');
      else if (role === 'writer') navigate('/writer');
      else if (role === 'subscriber') navigate('/subscriber');
      else navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions"
      });
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://pembimbingmu.lovable.app/login",
    "name": "Login - Pembimbingmu",
    "description": "Masuk ke akun Pembimbingmu untuk mengakses layanan bimbingan skripsi terbaik",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Pembimbingmu", 
      "url": "https://pembimbingmu.lovable.app"
    }
  };

  return (
    <>
      <SEO 
        title="Login - Masuk ke Akun Pembimbingmu | Platform Bimbingan Skripsi"
        description="Masuk ke akun Pembimbingmu untuk mengakses layanan bimbingan skripsi, analisis CV, dan konsultasi akademik dengan mentor berpengalaman."
        canonical="https://pembimbingmu.lovable.app/login"
        jsonLd={structuredData}
      />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Selamat Datang Kembali</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {/* Registration Callout Box */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 sm:p-6 text-center space-y-3">
              <p className="text-sm text-foreground font-medium">
                Baru membeli akses? Daftarkan password Anda sekarang
              </p>
              <Button 
                asChild 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground touch-target"
              >
                <Link to="/register">Daftar Sekarang</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Login Form */}
          <Card>
            <CardHeader className="space-y-1 text-center p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Masuk ke Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              {/* Google Login */}
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground touch-target"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm sm:text-base">Masuk dengan Google</span>
              </Button>

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">ATAU</span>
                </div>
              </div>

              {/* Email/Password Login */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Alamat Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 sm:h-12 text-base touch-target"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 sm:h-12 text-base touch-target"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground touch-target"
                >
                  <span className="text-sm sm:text-base">{isLoading ? 'Loading...' : 'Masuk'}</span>
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center space-y-3">
                <button
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:text-primary/80 underline touch-target block w-full py-2"
                >
                  Lupa password?
                </button>
                <div className="text-sm text-muted-foreground">
                  Belum dapat akses?{' '}
                  <a href="http://lynk.id/pembimbingmu/xwek5peo1noy" className="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer">
                    Dapatkan sekarang
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}