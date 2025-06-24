'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      toast.success('Inicio de sesión exitoso');
      router.push('/clinical_cases');
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión. Por favor, inténtelo de nuevo.');
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#00b2ca] rounded-lg shadow-lg overflow-hidden">
          <div className="px-10 pt-10 pb-8 text-center">
            <h1 className="text-white text-4xl font-bold tracking-wide mb-2 text-shadow-lg">
              ONCOVISION
            </h1>
            
            <div className="border-t border-white my-6"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <input
                    type="text" // Changed from email to text
                    id="username" // Changed from email to username
                    value={username} // Keep the state variable name for now
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Usuario" // Changed from Correo electrónico to Usuario
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
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#00b2ca]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </span>
                ) : (
                  'INGRESAR'
                )}
              </button>
              
              <div className="text-center">
                <Link href="/auth/forgot-password" className="text-sm text-white hover:underline">
                  ¿Olvidó la contraseña?
                </Link>
              </div>
            </form>
            
            <div className="border-t border-white my-6"></div>
            
            <div className="text-center">
              <Link 
                href="/auth/register" 
                className="inline-block bg-transparent border border-white text-white font-medium py-2 px-6 rounded-lg hover:bg-white/10 transition-colors"
              >
                Crear nueva cuenta
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}