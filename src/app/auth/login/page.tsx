'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  // Use useEffect to check authentication on client-side only
  useEffect(() => {
    setIsClient(true);
    // Check if user is already authenticated
    if (localStorage.getItem('accessToken')) {
      router.push('/');
    }
  }, [router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast.success('Inicio de sesión exitoso');
        router.push('/');
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión. Por favor, inténtelo de nuevo.');
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };
  
  // If we haven't confirmed we're on the client yet, don't render form
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-t-4 border-[#00b2ca] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#00b2ca] rounded-lg shadow-lg overflow-hidden">
          <div className="px-10 pt-10 pb-8 text-center">
            <h1 className="text-white text-4xl font-bold tracking-wide mb-2 text-shadow-lg">
              ONCOVISION
            </h1>
            
            <div className="border-t border-white my-6"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form content remains the same */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario"
                    className="w-full pl-4 pr-10 py-3 bg-white/10 text-white placeholder-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 border border-white"
                    required
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full pl-4 pr-10 py-3 bg-white/10 text-white placeholder-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 border border-white"
                    required
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-[#00b2ca] font-medium py-3 px-4 rounded-lg shadow-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#00b2ca]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </span>
                ) : (
                  'INGRESAR'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}