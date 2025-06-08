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
  
  // Add search state
  const [caseIdSearch, setCaseIdSearch] = useState('');
  const [patientIdSearch, setPatientIdSearch] = useState('');

  // Function to reset search fields and reload all cases
  const resetSearch = async () => {
    setCaseIdSearch('');
    setPatientIdSearch('');
    await fetchClinicalCases();
  };

  const fetchClinicalCases = async (caseId = '', patientId = '') => {
    try {
      setLoading(true);
      let url = 'http://127.0.0.1:8080/cases/clinical_case_list';
      
      // Add query parameters if provided
      const params = new URLSearchParams();
      if (caseId) params.append('case_id', caseId);
      if (patientId) params.append('patient_id', patientId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
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
  };

  const handleAddCase = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8080/cases/clinical_case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientIdSearch,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create clinical case');
      }
      
      // Refresh the list after creating a new case
      await fetchClinicalCases();
      
      // Clear the search fields
      setCaseIdSearch('');
      setPatientIdSearch('');
      
      // Show success message
      alert('Caso clínico creado exitosamente');
    } catch (err) {
      console.error('Error creating clinical case:', err);
      alert('Error al crear el caso clínico. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchClinicalCases(caseIdSearch, patientIdSearch);
  };

  useEffect(() => {
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
          
          {/* Search and filter fields */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-auto">
                  <label htmlFor="caseIdSearch" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    ID de Caso
                  </label>
                  <input
                    id="caseIdSearch"
                    type="text"
                    value={caseIdSearch}
                    onChange={(e) => setCaseIdSearch(e.target.value)}
                    placeholder="Buscar por ID"
                    className="w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label htmlFor="patientIdSearch" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    ID de Paciente
                  </label>
                  <input
                    id="patientIdSearch"
                    type="text"
                    value={patientIdSearch}
                    onChange={(e) => setPatientIdSearch(e.target.value)}
                    placeholder="Buscar por paciente"
                    className="w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                    onClick={resetSearch}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={loading}
                    aria-label="Clear all filters"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                    Limpiar
                </button>
                <button 
                  onClick={handleFilter}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrar
                </button>
                <button 
                  onClick={handleAddCase}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Agregar
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
              <p>{error}</p>
              <button 
                onClick={() => fetchClinicalCases()}
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