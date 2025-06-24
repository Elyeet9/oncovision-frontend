'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import fetchWithAuth from '@/utils/fetchWithAuth';

// Define the Patient interface
interface Patient {
  id_number: string;
  full_name: string;
  clinical_history: string;
}

// Define the ClinicalCase interface
interface ClinicalCase {
  id: string;
  patient_id: string;
  medical_images_count: number;
  nodules_count: number;
}

export default function PatientDetail() {
  const params = useParams();
  const router = useRouter();
  const { patient_id } = params;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinicalCases, setClinicalCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [casesLoading, setCasesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [casesError, setCasesError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatientDetails() {
      try {
        setLoading(true);
        
        // API call to fetch patient details
        const response = await fetchWithAuth(`http://127.0.0.1:8080/patients/patient_detail/${patient_id}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch patient details');
        }

        const data = await response.json();
        setPatient(data);
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('Could not load patient details. Please try again later.');
        
        // Mock data for development
        setPatient({
          id_number: patient_id as string,
          full_name: "Apellido Paterno, Nombre",
          clinical_history: "100001"
        });
      } finally {
        setLoading(false);
      }
    }

    async function fetchPatientCases() {
      try {
        setCasesLoading(true);
        
        // API call to fetch clinical cases for the patient
        const response = await fetchWithAuth(`http://127.0.0.1:8080/cases/clinical_case_list?patient_id=${patient_id}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch patient clinical cases');
        }

        const data = await response.json();
        setClinicalCases(data);
      } catch (err) {
        console.error('Error fetching clinical cases:', err);
        setCasesError('Could not load clinical cases. Please try again later.');
        
        // Mock data for development
        setClinicalCases([
          { id: "1", patient_id: patient_id as string, medical_images_count: 3, nodules_count: 2 },
          { id: "2", patient_id: patient_id as string, medical_images_count: 1, nodules_count: 0 },
        ]);
      } finally {
        setCasesLoading(false);
      }
    }

    if (patient_id) {
      fetchPatientDetails();
      fetchPatientCases();
    }
  }, [patient_id]);

  // Function to handle row click
  const handleRowClick = (id: string) => {
    router.push(`/clinical_cases/${id}`);
  };

  return (
    <div className="pt-24 pb-10 px-4 md:px-8 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Top Bar with Patient Information */}
        <div className="mb-8 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Back Button */}
            <Link 
              href="/patients" 
              className="flex items-center text-gray-800 hover:text-blue-600 mb-4 sm:mb-0 mx-4 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>

            {loading ? (
              <div className="flex-1 flex justify-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="h-6 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 text-center text-red-600">
                {error}
              </div>
            ) : patient ? (
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                {/* Patient Name and Details */}
                <div className="flex flex-col sm:flex-row sm:space-x-6 text-gray-600 mt-1">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {patient.full_name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:space-x-6 text-gray-600 mt-1">
                    <div className="flex items-center mt-1 sm:mt-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-gray-500 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      <span>DNI: {patient.id_number}</span>
                    </div>
                    <div className="flex items-center mt-1 sm:mt-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-gray-500 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span>Historia Clínica: {patient.clinical_history}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 text-center text-gray-500">
                No se encontró el paciente
              </div>
            )}
          </div>
        </div>

        {/* Clinical Cases Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center w-full">CASOS CLÍNICOS</h2>
          </div>

          {casesLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : casesError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <p>{casesError}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              {clinicalCases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 content-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID del Caso
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
                      {clinicalCases.map((clinicalCase) => (
                        <tr 
                          key={clinicalCase.id} 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleRowClick(clinicalCase.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-500">{"CASO CLÍNICO " + clinicalCase.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-500 flex items-center">
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
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm text-gray-500 flex justify-end">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                              </svg>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm">No se encontraron casos clínicos para este paciente</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}