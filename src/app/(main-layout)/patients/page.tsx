'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import fetchWithAuth from '@/utils/fetchWithAuth';

// Define a type for patient data
interface Patient {
  full_name: string;
  id_number: string;
  clinical_history: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Add search state
  const [nameSearch, setNameSearch] = useState('');
  const [lastNameSearch, setLastNameSearch] = useState('');
  const [idNumberSearch, setIdNumberSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  // Function to reset search fields and reload all patients
  const resetSearch = async () => {
    setNameSearch('');
    setLastNameSearch('');
    setIdNumberSearch('');
    setHistorySearch('');
    await fetchPatients();
  };

  const fetchPatients = async (name = '', lastName = '', idNumber = '', history = '') => {
    try {
      setLoading(true);
      let url = 'http://127.0.0.1:8080/patients/patient_list';
      
      // Add query parameters if provided
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      if (lastName) params.append('last_name', lastName);
      if (idNumber) params.append('id_number', idNumber);
      if (history) params.append('clinical_history', history);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetchWithAuth(url, {method: 'GET',});
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Could not load patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    const loadingToast = toast.loading('Registrando paciente...');
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8080/patients/patient_create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          names: nameSearch,
          last_names: lastNameSearch,
          id_number: idNumberSearch,
          clinical_history: historySearch,
        }),
      });
      
      if (!response.ok) {
        // Get the error message from the response
        const errorData = await response.json();
        console.error('Error creating clinical case:', errorData.error);
        throw new Error('Failed to create clinical case: ' + errorData.error);
      }
      
      // Reset the filters and fetch patients
      resetSearch();
      
      // Show success message
      toast.dismiss(loadingToast);
      toast.success('Paciente registrado correctamente');
    } catch (err) {
      console.error('Error creating clinical case:', err);
      toast.dismiss(loadingToast);
      toast.error('Error al registrar paciente. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchPatients(nameSearch, lastNameSearch, idNumberSearch, historySearch);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Function to handle row click
  const handleRowClick = (id: string) => {
    router.push(`/patients/${id}`);
  };

  return (
    <>
      <div className="pt-24 pb-10 px-4 md:px-8 min-h-screen bg-gray-50 dark:bg-gray-900 main">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Pacientes</h1>
          
          {/* Search and filter fields */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 filter-box">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="w-full sm:w-auto relative">
                  <div className="relative input-group name">
                    <input
                      id="nameSearch"
                      type="text"
                      value={nameSearch}
                      onChange={(e) => setNameSearch(e.target.value)}
                      placeholder="Nombre PX."
                      className="w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 filter-text"
                    />
                    {nameSearch && (
                      <button
                        onClick={() => setNameSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 filter-text"
                        aria-label="Clear name search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full sm:w-auto relative">
                  <div className="relative input-group name">
                    <input
                      id="lastNameSearch"
                      type="text"
                      value={lastNameSearch}
                      onChange={(e) => setLastNameSearch(e.target.value)}
                      placeholder="Apellido PX."
                      className="w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 filter-text"
                    />
                    {lastNameSearch && (
                      <button
                        onClick={() => setLastNameSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear last name search"
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
                      id="idNumberSearch"
                      type="text"
                      value={idNumberSearch}
                      onChange={(e) => setIdNumberSearch(e.target.value)}
                      placeholder="DNI PX."
                      className="w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 filter-text"
                    />
                    {idNumberSearch && (
                      <button
                        onClick={() => setIdNumberSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear ID search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full sm:w-auto relative">
                  <div className="relative input-group clinical-history">
                    <input
                      id="historySearch"
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Historia clínica"
                      className="w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 filter-text"
                    />
                    {historySearch && (
                      <button
                        onClick={() => setHistorySearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear history search"
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
                {(nameSearch || idNumberSearch || historySearch) && (
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
                  onClick={handleAddPatient}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors filter-button"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 filter-button-icon">
                    <path fillRule="evenodd" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15"/>
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
                onClick={() => fetchPatients()}
                className="mt-3 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div className="text-gray-600 dark:text-gray-400">
                  {patients.length} {patients.length === 1 ? 'paciente encontrado' : 'pacientes encontrados'}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 content-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre Completo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número de Identificación
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Historia Clínica
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"/>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patients.length > 0 ? (
                        patients.map((patient) => (
                          <tr 
                            key={patient.id_number} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleRowClick(patient.id_number)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-500">
                                {patient.full_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-2 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                  </svg>
                                  {patient.id_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-2 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                  </svg>
                                  {patient.clinical_history}
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
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No se encontraron pacientes
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