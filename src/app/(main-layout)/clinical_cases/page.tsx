'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import fetchWithAuth from '@/utils/fetchWithAuth';
import { API_URL } from '@/utils/config';

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
      let url = `${API_URL}/cases/clinical_case_list`;
      
      // Add query parameters if provided
      const params = new URLSearchParams();
      if (caseId) params.append('case_id', caseId);
      if (patientId) params.append('patient_id', patientId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetchWithAuth(url, {method: 'GET'});
      
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
    const loadingToast = toast.loading('Creando caso clínico...');
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/cases/clinical_case`, {
        method: 'POST',
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
      toast.dismiss(loadingToast);
      toast.success('Caso creado correctamente');
    } catch (err) {
      console.error('Error creating clinical case:', err);
      toast.dismiss(loadingToast);
      toast.error('Error al crear el caso clínico. Por favor, inténtalo de nuevo.');
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
      <div className="pt-24 pb-10 px-4 md:px-8 min-h-screen bg-gray-50 dark:bg-gray-900 main">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Casos clínicos</h1>
          
          {/* Search and filter fields */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 filter-box">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-auto relative">
                  <div className="relative input-group clinical-history">
                    <input
                      id="caseIdSearch"
                      type="text"
                      value={caseIdSearch}
                      onChange={(e) => setCaseIdSearch(e.target.value)}
                      placeholder="ID Caso Clínico"
                      className="w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 filter-text"
                    />
                    {caseIdSearch && (
                      <button
                        onClick={() => setCaseIdSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear case ID search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full sm:w-auto relative">
                  <div className="relative input-group person">
                    <input
                      id="patientIdSearch"
                      type="text"
                      value={patientIdSearch}
                      onChange={(e) => setPatientIdSearch(e.target.value)}
                      placeholder="DNI PX."
                      className="w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 filter-text"
                    />
                    {patientIdSearch && (
                      <button
                        onClick={() => setPatientIdSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear patient ID search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                {(caseIdSearch || patientIdSearch) && (
                  <button
                    onClick={resetSearch}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors filter-button"
                    disabled={loading}
                    aria-label="Clear all filters"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 filter-button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Limpiar
                  </button>
                )}
                <button 
                  onClick={handleFilter}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors filter-button"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 filter-button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
                <button 
                  onClick={handleAddCase}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors filter-button"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 filter-button-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
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
                  <table className="min-w-full divide-y divide-gray-200 content-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID del Caso
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID del Paciente
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Imágenes Médicas
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nódulos
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"/>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clinicalCases.length > 0 ? (
                        clinicalCases.map((clinicalCase) => (
                          <tr 
                            key={clinicalCase.id} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleRowClick(clinicalCase.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-500 flex items-center">{"CASO CLÍNICO " + clinicalCase.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-2 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                  </svg>
                                  {clinicalCase.patient_id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-2 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                  </svg>
                                  {clinicalCase.medical_images_count}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-2 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                  </svg>
                                  {clinicalCase.nodules_count}
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-right'>
                              <div className="text-sm text-gray-500 flex justify-end">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-gray-500">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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