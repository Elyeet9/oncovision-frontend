'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ClinicalCase {
  id: string;
  title: string;
  patientName: string;
  date: string;
  status: string;
  // Add more fields later as needed
}

export default function ClinicalCaseDetail() {
  const params = useParams();
//   const router = useRouter();
  const { id } = params;
  
  const [clinicalCase, setClinicalCase] = useState<ClinicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // This would be replaced with an actual API call in production
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock data for development
      const mockCase: ClinicalCase = {
        id: id as string,
        title: 'Caso clínico detallado',
        patientName: 'Paciente de ejemplo',
        date: '2025-05-15',
        status: 'Active'
      };
      
      setClinicalCase(mockCase);
      setLoading(false);
    }, 500);
  }, [id]);

  return (
    <div className="pt-16 pb-10 px-4 md:px-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/clinical_cases" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver a la lista
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
            <p>{error}</p>
          </div>
        ) : clinicalCase ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">{clinicalCase.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Información del caso</h2>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">ID:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{clinicalCase.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Paciente:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{clinicalCase.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {new Date(clinicalCase.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${clinicalCase.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
                          clinicalCase.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                        {clinicalCase.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Detalles adicionales</h2>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">
                    Los detalles completos del caso se implementarán próximamente.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Acciones</h2>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Editar caso
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  Ver imágenes
                </button>
                <button className="px-4 py-2 border border-red-600 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                  Eliminar caso
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded relative">
            <p>No se encontró el caso clínico.</p>
          </div>
        )}
      </div>
    </div>
  );
}