
export default function Home() {
  return (
    <div>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 main">
        <div className="text-center p-6">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Bienvenido a OncoVision</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Tu plataforma para la gestión de casos clínicos y pacientes oncológicos.
          </p>
        </div>
      </main>
    </div>
  );
}
