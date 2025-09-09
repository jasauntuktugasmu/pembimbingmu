import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase.rpc('is_email_authorized', {
        email_to_check: normalizedEmail
      });

      if (error) {
        throw error;
      }

      if (data === true) {
        setIsEmailVerified(true);
        toast({
          title: "Email terverifikasi",
          description: "Silakan buat password Anda"
        });
      } else {
        setErrorMessage("Email ini tidak memiliki akses. Pastikan Anda menggunakan email yang sama saat pembelian.");
      }
    } catch (error) {
      console.error('Error checking email:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memverifikasi email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password tidak sama",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error", 
        description: "Password minimal 6 karakter",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      // Auto sign in the user after successful signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (signInError) {
        throw signInError;
      }

      toast({
        title: "Registrasi berhasil",
        description: "Akun Anda telah dibuat dan Anda sudah masuk."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat membuat akun",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://pembimbingmu.lovable.app/register",
    "name": "Register - Pembimbingmu",
    "description": "Daftar akun baru di Pembimbingmu untuk mengakses layanan bimbingan skripsi",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Pembimbingmu",
      "url": "https://pembimbingmu.lovable.app"
    }
  };

  return (
    <>
      <SEO 
        title="Daftar Akun Baru - Pembimbingmu | Platform Bimbingan Skripsi"
        description="Daftarkan akun baru di Pembimbingmu untuk mengakses layanan bimbingan skripsi, analisis CV, dan konsultasi akademik."
        canonical="https://pembimbingmu.lovable.app/register"
        jsonLd={structuredData}
      />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Daftarkan Akun Anda</CardTitle>
              {!isEmailVerified && (
                <CardDescription>
                  Masukkan email Anda untuk memulai pendaftaran
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {!isEmailVerified ? (
                // Part 1: Email Verification
                <form onSubmit={checkEmail} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Alamat Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    {errorMessage && (
                      <p className="text-sm text-destructive mt-2">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? 'Loading...' : 'Cek Email'}
                  </Button>
                </form>
              ) : (
                // Part 3: Password Creation Form
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Buat Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Konfirmasi Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? 'Loading...' : 'Daftar Akun'}
                  </Button>
                </form>
              )}
              
              {/* Footer Link */}
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  Sudah punya akun? Masuk
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}