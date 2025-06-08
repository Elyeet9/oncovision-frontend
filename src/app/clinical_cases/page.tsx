'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

// Define a type for your clinical case
interface ClinicalCase {
  id: string;
  patient_id: string;
  medical_images_count: number;
  nodules_count: number;
}

export default function ClinicalCases() {
  const [clinicalCases, setClinicalCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Function to fetch clinical cases from your backend
    async function fetchClinicalCases() {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch('http://127.0.0.1:8080/cases/clinical_case_list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add any authentication headers if needed
            },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch clinical cases');
        }
        
        const data = await response.json();
        setClinicalCases(data);
      } catch (err) {
        console.error('Error fetching clinical cases:', err);
        setError('Could not load clinical cases. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchClinicalCases();
  }, []);

  // Function to handle row click
  const handleRowClick = (id: string) => {
    router.push(`/clinical_cases/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-10 px-4 md:px-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Casos clínicos</h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div className="text-gray-600 dark:text-gray-400">
                  {clinicalCases.length} {clinicalCases.length === 1 ? 'caso encontrado' : 'casos encontrados'}
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Nuevo caso
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID del Caso
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID del Paciente
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Imágenes Médicas
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Nódulos
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {clinicalCases.length > 0 ? (
                        clinicalCases.map((clinicalCase) => (
                          <tr 
                            key={clinicalCase.id} 
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => handleRowClick(clinicalCase.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{"CASO CLÍNICO " + clinicalCase.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">{clinicalCase.patient_id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {clinicalCase.medical_images_count}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {clinicalCase.nodules_count}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No se encontraron casos clínicos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}