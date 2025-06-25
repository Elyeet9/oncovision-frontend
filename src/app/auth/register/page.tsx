'use client';

export default function Register() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#00b2ca] rounded-lg shadow-lg overflow-hidden p-10">
          <h1 className="text-white text-3xl font-bold tracking-wide text-center mb-6">REGISTRARSE</h1>
          
          {/* Registration form will go here */}
          <p className="text-white text-center">Página en construcción</p>
          
          <div className="mt-6 text-center">
            <a href="/auth/login" className="text-white hover:underline">
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}