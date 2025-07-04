'use client';

import { useState, useEffect, useRef, useCallback, ChangeEvent, DragEvent } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import fetchWithAuth from '@/utils/fetchWithAuth';
import { API_URL } from '@/utils/config';


interface LungNodule {
  id: string;
  medical_imaging_id: string;
  malignancy_type: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  confidence: number;
}

interface MedicalImaging {
  id: string;
  state: string;
  full_image: string;
  processed_image: string;
  lung_nodules: LungNodule[];
}

interface ClinicalCase {
  id: string;
  description: string;
  patient_id: string;
  clinical_history: string;
  medical_images: MedicalImaging[];
}

export default function ClinicalCaseDetail() {
  const params = useParams();
  const { id } = params;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [clinicalCase, setClinicalCase] = useState<ClinicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Wrap in useCallback to memoize the function and prevent unnecessary rerenders
  const fetchClinicalCaseDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // API call to fetch case details
      const response = await fetchWithAuth(`${API_URL}/cases/clinical_case_detail/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }

      const data = await response.json();
      setClinicalCase(data);
    } catch (err) {
      console.error('Error fetching case details:', err);
      setError('Could not load case details. Please try again later.');
      toast.error('Error al cargar los detalles del caso');
    } finally {
      setLoading(false);
    }
  }, [id]); // Only recreate this function if id changes

  useEffect(() => {
    if (id) {
      fetchClinicalCaseDetails();
    }
  }, [id, fetchClinicalCaseDetails]); // Include both dependencies

  // File upload states
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Handle file selection from input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
  };

  // Handle drag events
  const handleDrag = (e: DragEvent<HTMLDivElement | HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      addFiles(newFiles);
    }
  };

  // Add files function
  const addFiles = (newFiles: File[]) => {
    // Check file types - allow only PNG, JPG, JPEG, and DCM
    const validFiles = newFiles.filter(file => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      return fileType === 'image/png' || 
             fileType === 'image/jpeg' || 
             fileType === 'image/jpg' || 
             fileName.endsWith('.dcm');
    });
    
    if (validFiles.length !== newFiles.length) {
      setUploadError('Algunos archivos no son válidos. Solo se permiten archivos PNG, JPG y DCM.');
      setTimeout(() => setUploadError(null), 5000);
    }
    
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setUploadSuccess(false); // Reset success state when new files are added
  };

  // Remove file function
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setUploadSuccess(false); // Reset success state when files are changed
  };

  // Open file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    const loadingToast = toast.loading('Subiendo imágenes...');
    setUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('case_id', id as string);
      
      const response = await fetchWithAuth(`${API_URL}/cases/upload_images`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload images');
      }
      
      setUploadSuccess(true);
      setFiles([]);
      
      // Refresh case details after successful upload
      fetchClinicalCaseDetails();
      
      toast.dismiss(loadingToast);
      toast.success('Imágenes cargadas correctamente');
    } catch (err) {
      console.error('Error uploading files:', err);
      setUploadError('Error al cargar las imágenes. Por favor, inténtelo de nuevo.');
      toast.dismiss(loadingToast);
      toast.error('Error al subir las imágenes');
    } finally {
      setUploading(false);
    }
  };

  // Preview images section
  const [selectedPreviewImages, setSelectedPreviewImages] = useState<string[]>([]);
  const [processingPreviewImages, setProcessingPreviewImages] = useState(false);
  const [processPreviewError, setProcessPreviewError] = useState<string | null>(null);
  const [processPreviewSuccess, setProcessPreviewSuccess] = useState(false);
  const [deletingPreviewImageId, setDeletingPreviewImageId] = useState<string | null>(null);
  const [bulkPreviewDeleting, setBulkPreviewDeleting] = useState(false);

  // Loaded images section
  const [selectedLoadedImages, setSelectedLoadedImages] = useState<string[]>([]);
  const [processingLoadedImages, setProcessingLoadedImages] = useState(false);
  const [processLoadedError, setProcessLoadedError] = useState<string | null>(null);
  const [processLoadedSuccess, setProcessLoadedSuccess] = useState(false);
  const [deletingLoadedImageId, setDeletingLoadedImageId] = useState<string | null>(null);
  const [bulkLoadedDeleting, setBulkLoadedDeleting] = useState(false);

  // Analyzed images section
  const [selectedAnalyzedImageId, setSelectedAnalyzedImageId] = useState<string | null>(null);
  const [selectedAnalyzedImage, setSelectedAnalyzedImage] = useState<MedicalImaging | null>(null);

  // Full screen image viewer state
  const [isFullScreenActive, setIsFullScreenActive] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState(0);
  const [analyzedImages, setAnalyzedImages] = useState<MedicalImaging[]>([]);

  // useEffect to only consider images with 'analyzed' state
  useEffect(() => {
    if (selectedAnalyzedImageId && clinicalCase?.medical_images) {
      const selectedImage = clinicalCase.medical_images.find(
        img => img.id === selectedAnalyzedImageId && img.state === 'analyzed'
      );
      setSelectedAnalyzedImage(selectedImage || null);
    } else {
      setSelectedAnalyzedImage(null);
    }
  }, [selectedAnalyzedImageId, clinicalCase?.medical_images]);

  // useEffect to update analyzed images when clinical case changes
  useEffect(() => {
    if (clinicalCase?.medical_images) {
      const filtered = clinicalCase.medical_images.filter(img => img.state === 'analyzed');
      setAnalyzedImages(filtered);
      
      // Update fullScreenImageIndex when selectedAnalyzedImageId changes
      if (selectedAnalyzedImageId) {
        const index = filtered.findIndex(img => img.id === selectedAnalyzedImageId);
        if (index !== -1) {
          setFullScreenImageIndex(index);
        }
      }
    }
  }, [clinicalCase?.medical_images, selectedAnalyzedImageId]);

  // Modify the handleAnalyzedImageClick function to ensure we're only selecting analyzed images
  const handleAnalyzedImageClick = (imageId: string) => {
    // First check if the image has the correct state
    if (clinicalCase?.medical_images) {
      const image = clinicalCase.medical_images.find(img => img.id === imageId);
      if (image && image.state === 'analyzed') {
        setSelectedAnalyzedImageId(prevId => prevId === imageId ? null : imageId);
      }
    }
  };

  // Function to handle image selection with a specific state
  const toggleImageSelection = (imageId: string, selectionState: 'preview' | 'ready', setSelectedFunc: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelectedFunc(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId) 
        : [...prev, imageId]
    );
  };

  // Refactored function to handle image processing with different states
  const handleProcessImages = async (
    imageIds: string[], 
    newState: 'ready' | 'processing', 
    setProcessingFunc: React.Dispatch<React.SetStateAction<boolean>>,
    setErrorFunc: React.Dispatch<React.SetStateAction<string | null>>,
    setSuccessFunc: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedFunc: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (imageIds.length === 0) return;
      
    const actionText = newState === 'ready' ? 'cargando' : 'analizando';
    const loadingToast = toast.loading(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} imágenes...`);
  
    setProcessingFunc(true);
    setErrorFunc(null);
    
    try {
      const response = await fetchWithAuth(`${API_URL}/cases/medical_imaging`, {
        method: 'PUT',
        body: JSON.stringify({
          image_ids: imageIds,
          new_state: newState
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update image status to ${newState}`);
      }
      
      setSuccessFunc(true);
      setSelectedFunc([]);
      
      // Refresh case details to show updated statuses
      await fetchClinicalCaseDetails();
      
      toast.dismiss(loadingToast);
      toast.success(`Imágenes ${actionText}s correctamente`);
    
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessFunc(false), 5000);
    } catch (err) {
      console.error(`Error updating image status to ${newState}:`, err);
      setErrorFunc(`Error al actualizar el estado de las imágenes. Por favor, inténtelo de nuevo.`);
      toast.dismiss(loadingToast);
      toast.error(`Error al ${actionText} las imágenes`);
    } finally {
      setProcessingFunc(false);
    }
  };

  // Refactored function to handle image deletion
  const handleDeleteImage = async (
    imageId: string, 
    setDeletingFunc: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (confirm('¿Está seguro que desea eliminar esta imagen?')) {
      const loadingToast = toast.loading('Eliminando imagen...');
      setDeletingFunc(imageId);
      try {
        const response = await fetchWithAuth(`${API_URL}/cases/medical_imaging/${imageId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete image');
        }

        // Refresh case details after deletion
        await fetchClinicalCaseDetails();
        toast.dismiss(loadingToast);
        toast.success('Imagen eliminada correctamente');
        
      } catch (err) {
        console.error('Error deleting image:', err);
        toast.dismiss(loadingToast);
        toast.error('Error al eliminar la imagen');
      } finally {
        setDeletingFunc(null);
      }
    }
  };

  // Refactored function to handle bulk image deletion
  const handleBulkDeleteImages = async (
    imageIds: string[], 
    setBulkDeletingFunc: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedFunc: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (imageIds.length === 0) return;
    
    if (confirm(`¿Está seguro que desea eliminar ${imageIds.length} ${imageIds.length === 1 ? 'imagen' : 'imágenes'}?`)) {
      const loadingToast = toast.loading('Eliminando imágenes...');
      setBulkDeletingFunc(true);
      try {
        const response = await fetchWithAuth(`${API_URL}/cases/medical_imaging`, {
          method: 'DELETE',
          body: JSON.stringify({
            image_ids: imageIds
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete images');
        }
        
        // Clear selection and refresh case details
        setSelectedFunc([]);
        await fetchClinicalCaseDetails();
        toast.dismiss(loadingToast);
        toast.success(`${imageIds.length} ${imageIds.length === 1 ? 'imagen eliminada' : 'imágenes eliminadas'} correctamente`);
    } catch (err) {
        console.error('Error deleting images:', err);
        toast.dismiss(loadingToast);
        toast.error('Error al eliminar las imágenes');
      } finally {
        setBulkDeletingFunc(false);
      }
    }
  };

  // Convenience wrappers for the refactored functions
  const handleProcessPreviewImages = () => {
    handleProcessImages(
      selectedPreviewImages, 
      'ready', 
      setProcessingPreviewImages,
      setProcessPreviewError,
      setProcessPreviewSuccess,
      setSelectedPreviewImages
    );
  };

  const handleProcessLoadedImages = () => {
    handleProcessImages(
      selectedLoadedImages, 
      'processing', 
      setProcessingLoadedImages,
      setProcessLoadedError,
      setProcessLoadedSuccess,
      setSelectedLoadedImages
    );
  };

  const handleDeletePreviewImage = (imageId: string) => {
    handleDeleteImage(imageId, setDeletingPreviewImageId);
  };

  const handleDeleteLoadedImage = (imageId: string) => {
    handleDeleteImage(imageId, setDeletingLoadedImageId);
  };

  const handleBulkDeletePreviewImages = () => {
    handleBulkDeleteImages(selectedPreviewImages, setBulkPreviewDeleting, setSelectedPreviewImages);
  };

  const handleBulkDeleteLoadedImages = () => {
    handleBulkDeleteImages(selectedLoadedImages, setBulkLoadedDeleting, setSelectedLoadedImages);
  };

  // Add keyboard navigation support for full screen viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullScreenActive) return;
      
      switch (e.key) {
        case 'Escape':
          setIsFullScreenActive(false);
          break;
        case 'ArrowRight':
          if (fullScreenImageIndex < analyzedImages.length - 1) {
            setFullScreenImageIndex(fullScreenImageIndex + 1);
            setSelectedAnalyzedImageId(analyzedImages[fullScreenImageIndex + 1].id);
          }
          break;
        case 'ArrowLeft':
          if (fullScreenImageIndex > 0) {
            setFullScreenImageIndex(fullScreenImageIndex - 1);
            setSelectedAnalyzedImageId(analyzedImages[fullScreenImageIndex - 1].id);
          }
          break;
        case 'h':
        case 'H':
          setShowHighlights(!showHighlights);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreenActive, fullScreenImageIndex, analyzedImages, showHighlights, setSelectedAnalyzedImageId]);

  // Add this effect to disable body scrolling when full screen is active
  useEffect(() => {
    if (isFullScreenActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreenActive]);
  
  const generatePDF = async () => {
    if (!selectedAnalyzedImage || !clinicalCase?.id) return;
    
    // Show loading state
    const loadingToast = toast.loading('Generando PDF...');
    
    try {
      // Call backend API to generate PDF
      const response = await fetchWithAuth(`${API_URL}/cases/generate_pdf/${clinicalCase.id}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }
      
      // Get the PDF as a blob
      const pdfBlob = await response.blob();
      
      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      
      // Create an invisible link to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `reporte_tomografia_caso_${clinicalCase.id}_${selectedAnalyzedImage.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(blobUrl);
      
      toast.dismiss(loadingToast);
      toast.success('PDF generado con éxito');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss(loadingToast);
      toast.error('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <div className="pt-24 pb-10 px-4 md:px-8 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Top Bar with Patient Information */}
        <div className="mb-8 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Back Button */}
            <Link 
              href="/clinical_cases" 
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
            ) : clinicalCase ? (
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                {/* Patient Name and Details */}
                <div className="text-center sm:text-left flex-grow px-4">
                  <div className="flex flex-col sm:flex-row sm:space-x-6 text-gray-600 mt-1">
                    <div className="flex items-center mt-1 sm:mt-0">
                      <h1 className="text-2xl font-bold text-gray-800">
                        CASO CLÍNICO {clinicalCase.id}
                      </h1>
                    </div>
                    <div className="flex items-center mt-1 sm:mt-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-gray-500 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      <span>DNI: {clinicalCase.patient_id}</span>
                    </div>
                    <div className="flex items-center mt-1 sm:mt-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-gray-500 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span>Historia Clínica: {clinicalCase.clinical_history}</span>
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

        {/* Upload Box */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-6">CARGAR IMÁGENES TOMOGRÁFICAS</h2>
          
          <form 
            className="w-full" 
            onSubmit={(e) => e.preventDefault()}
            onDragEnter={handleDrag}
          >
            <div 
              className={`relative border-2 ${dragActive ? 'border-blue-500' : 'border-dashed border-gray-300'} 
              rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all
              ${dragActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={openFileDialog}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.dcm"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Upload Icon */}
              <div className="mb-4 rounded-full bg-gray-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <p className="text-gray-700 font-medium">
                Arrastre y suelte las imágenes o haga clic aquí
              </p>
              <p className="text-gray-500 text-sm mt-1">
                (.png, .jpg, .dcm)
              </p>
            </div>
            
            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Archivos seleccionados:</h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        title="Eliminar archivo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors
                      ${uploading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cargando...
                      </>
                    ) : 'CARGAR'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Status messages */}
            {uploadError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                <p className="text-sm">{uploadError}</p>
              </div>
            )}
            
            {uploadSuccess && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                <p className="text-sm">Imágenes cargadas correctamente.</p>
              </div>
            )}
          </form>
        </div>

        {/* Image Preview section */}
        {clinicalCase?.medical_images && clinicalCase.medical_images.some(img => img.state === 'preview') && (
          <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6" data-section="preview-images">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">PREVISUALIZACIÓN DE IMÁGENES TOMOGRÁFICAS</h2>
            
            {/* Horizontal scrolling image gallery */}
            <div className="relative">
              <div className="overflow-x-auto pb-4 sd:hide-scrollbar">
                <div className="inline-flex space-x-4 min-w-full">
                  {clinicalCase.medical_images
                    .filter(img => img.state === 'preview')
                    .map((image) => (
                      <div 
                        key={image.id}
                        onClick={() => toggleImageSelection(image.id, 'preview', setSelectedPreviewImages)}
                        className={`
                          flex-shrink-0 w-64 h-64 border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200
                          ${selectedPreviewImages.includes(image.id) 
                            ? 'border-blue-500 ring-2 ring-blue-300' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        {/* Image preview */}
                        <div className="relative w-full h-full p-2">
                          {/* Delete button - always visible */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the click from selecting the image
                              handleDeletePreviewImage(image.id);
                            }}
                            className="absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-colors"
                            title="Eliminar imagen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {/* Loading indicator when deleting */}
                          {deletingPreviewImageId === image.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          )}

                          <Image
                            src={`${API_URL}/${image.full_image}`}
                            alt={`Medical Image ${image.id}`}
                            fill
                            sizes="(max-width: 640px) 100vw, 256px"
                            className="object-cover rounded"
                            style={{ padding: '24px' }}
                            priority={selectedPreviewImages.includes(image.id)}
                          />

                          {/* Image title */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-2">
                            {image.full_image.split('/').pop()}
                          </div>
                          
                          {/* Selection indicator - moved to top-left to not overlap with delete button */}
                          {selectedPreviewImages.includes(image.id) && (
                            <div className="absolute top-4 left-4 bg-blue-500 rounded-full p-1 z-10">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Scroll indicators/buttons (optional) */}
              {clinicalCase.medical_images.filter(img => img.state === 'preview').length > 3 && (
                <>
                  <button 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
                    onClick={() => {
                      const currentSection = document.querySelector('[data-section="preview-images"]');
                      const container = currentSection?.querySelector('.overflow-x-auto');
                      if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
                    onClick={() => {
                      const container = document.querySelector('.overflow-x-auto');
                      if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Checkbox to select all preview images */}
            <div className="mt-4 flex items-center">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedPreviewImages.length === clinicalCase.medical_images.filter(img => img.state === 'preview').length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all preview images
                      const allPreviewIds = clinicalCase.medical_images
                        .filter(img => img.state === 'preview')
                        .map(img => img.id);
                      setSelectedPreviewImages(allPreviewIds);
                    } else {
                      // Deselect all preview images
                      setSelectedPreviewImages([]);
                    }
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Seleccionar todas las imágenes</span>
              </label>
            </div>
            
            {/* Selection info and process/delete buttons */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-gray-600 mb-4 sm:mb-0">
                {selectedPreviewImages.length === 0 ? (
                  <p>Seleccione las imágenes que desea procesar</p>
                ) : (
                  <p>{selectedPreviewImages.length} {selectedPreviewImages.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}</p>
                )}
              </div>
              
              {selectedPreviewImages.length > 0 && (
                <div className="flex space-x-4">
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={handleBulkDeletePreviewImages}
                    disabled={bulkPreviewDeleting || processingPreviewImages}
                    className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors
                      ${(bulkPreviewDeleting || processingPreviewImages) ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {bulkPreviewDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        BORRAR
                      </>
                    )}
                  </button>
                  
                  {/* Process Button */}
                  <button
                    type="button"
                    onClick={handleProcessPreviewImages}
                    disabled={processingPreviewImages || bulkPreviewDeleting}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors
                      ${(processingPreviewImages || bulkPreviewDeleting) ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {processingPreviewImages ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : 'CARGAR'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Status messages */}
            {processPreviewError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                <p className="text-sm">{processPreviewError}</p>
              </div>
            )}
            
            {processPreviewSuccess && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                <p className="text-sm">Las imágenes han sido enviadas para procesamiento.</p>
              </div>
            )}
          </div>
        )}

        {/* Loaded images section */}
        {clinicalCase?.medical_images && clinicalCase.medical_images.some(img => img.state === 'ready') && (
          <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6" data-section="loaded-images">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">IMÁGENES TOMOGRÁFICAS CARGADAS</h2>
            
            {/* Horizontal scrolling image gallery */}
            <div className="relative">
              <div className="overflow-x-auto pb-4 sd:hide-scrollbar">
                <div className="inline-flex space-x-4 min-w-full">
                  {clinicalCase.medical_images
                    .filter(img => img.state === 'ready')
                    .map((image) => (
                      <div 
                        key={image.id}
                        onClick={() => toggleImageSelection(image.id, 'ready', setSelectedLoadedImages)}
                        className={`
                          flex-shrink-0 w-64 h-64 border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200
                          ${selectedLoadedImages.includes(image.id) 
                            ? 'border-blue-500 ring-2 ring-blue-300' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        {/* Image preview */}
                        <div className="relative w-full h-full p-2">
                          {/* Delete button - always visible */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the click from selecting the image
                              handleDeleteLoadedImage(image.id);
                            }}
                            className="absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-colors"
                            title="Eliminar imagen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {/* Loading indicator when deleting */}
                          {deletingLoadedImageId === image.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          )}

                          <Image
                            src={`${API_URL}/${image.processed_image}`}
                            alt={`Medical Image ${image.id}`}
                            fill
                            sizes="(max-width: 640px) 100vw, 256px"
                            className="object-cover rounded"
                            style={{ padding: '24px' }}
                            priority={selectedLoadedImages.includes(image.id)}
                          />

                          {/* Image title */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-2">
                            {image.full_image.split('/').pop()}
                          </div>
                          
                          {/* Selection indicator */}
                          {selectedLoadedImages.includes(image.id) && (
                            <div className="absolute top-4 left-4 bg-blue-500 rounded-full p-1 z-10">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Scroll indicators/buttons for loaded images */}
              {clinicalCase.medical_images.filter(img => img.state === 'ready').length > 3 && (
                <>
                  <button 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
                    onClick={() => {
                      // Find the container within this specific section
                      const currentSection = document.querySelector('[data-section="loaded-images"]');
                      const container = currentSection?.querySelector('.overflow-x-auto');
                      if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
                    onClick={() => {
                      // Find the container within this specific section
                      const currentSection = document.querySelector('[data-section="loaded-images"]');
                      const container = currentSection?.querySelector('.overflow-x-auto');
                      if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Checkbox to select all loaded images */}
            <div className="mt-4 flex items-center">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedLoadedImages.length === clinicalCase.medical_images.filter(img => img.state === 'ready').length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all loaded images
                      const allLoadedIds = clinicalCase.medical_images
                        .filter(img => img.state === 'ready')
                        .map(img => img.id);
                      setSelectedLoadedImages(allLoadedIds);
                    } else {
                      // Deselect all loaded images
                      setSelectedLoadedImages([]);
                    }
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Seleccionar todas las imágenes</span>
              </label>
            </div>

            {/* Selection info and process/delete buttons */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="text-gray-600 mb-4 sm:mb-0">
                {selectedLoadedImages.length === 0 ? (
                  <p>Seleccione las imágenes que desea analizar</p>
                ) : (
                  <p>{selectedLoadedImages.length} {selectedLoadedImages.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}</p>
                )}
              </div>
              
              {selectedLoadedImages.length > 0 && (
                <div className="flex space-x-4">
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={handleBulkDeleteLoadedImages}
                    disabled={bulkLoadedDeleting || processingLoadedImages}
                    className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors
                      ${(bulkLoadedDeleting || processingLoadedImages) ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {bulkLoadedDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        BORRAR
                      </>
                    )}
                  </button>
                  
                  {/* Process Button - Now "ANALIZAR" instead of "CARGAR" */}
                  <button
                    type="button"
                    onClick={handleProcessLoadedImages}
                    disabled={processingLoadedImages || bulkLoadedDeleting}
                    className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors
                      ${(processingLoadedImages || bulkLoadedDeleting) ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {processingLoadedImages ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        ANALIZAR
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            {/* Status messages */}
            {processLoadedError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                <p className="text-sm">{processLoadedError}</p>
              </div>
            )}
            
            {processLoadedSuccess && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                <p className="text-sm">Las imágenes han sido enviadas para análisis.</p>
              </div>
            )}
          </div>
        )}

        {/* Analyzed images section */}
        {clinicalCase?.medical_images && clinicalCase.medical_images.some(img => img.state === 'analyzed') && (
          <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6" data-section="analyzed-images">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">IMÁGENES TOMOGRÁFICAS ANALIZADAS</h2>
            {clinicalCase.medical_images.filter(img => img.state === 'analyzed').length > 0 ? (
              <>
                {/* Horizontal scrolling image gallery for analyzed images */}
                <div className="relative">
                  <div className="overflow-x-auto pb-4 sd:hide-scrollbar">
                    <div className="inline-flex space-x-4 min-w-full">
                      {clinicalCase.medical_images
                        .filter(img => img.state === 'analyzed')
                        .map((image) => (
                          <div 
                            key={image.id}
                            onClick={() => handleAnalyzedImageClick(image.id)}
                            className={`
                              flex-shrink-0 w-64 h-64 border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200
                              ${selectedAnalyzedImageId === image.id 
                                ? 'border-blue-500 ring-2 ring-blue-300' 
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            {/* Image preview with properly positioned dots for thumbnails */}
                            <div className="relative w-full h-full p-2">
                              <div className="relative w-full h-full flex items-center justify-center">
                                <Image
                                  src={`${API_URL}/${image.processed_image}`}
                                  alt={`Analyzed Medical Image ${image.id}`}
                                  fill
                                  sizes="(max-width: 640px) 100vw, 256px"
                                  className="object-contain"
                                  style={{ padding: '12px' }}
                                />
                                
                                {/* Overlay container that matches the actual image dimensions */}
                                <div className="absolute" style={{
                                  width: '100%',
                                  height: '100%',
                                  maxWidth: 'calc(100% - 24px)',
                                  maxHeight: 'calc(100% - 24px)',
                                  position: 'absolute',
                                  pointerEvents: 'none'
                                }}>
                                  {image.lung_nodules.map((nodule) => (
                                    <div
                                      key={nodule.id}
                                      className="absolute w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"
                                      style={{
                                        left: `${nodule.x_position * 100}%`,
                                        top: `${nodule.y_position * 100}%`,
                                        transform: 'translate(-50%, -50%)'
                                      }}
                                    />
                                  ))}
                                </div>
                                
                                {/* Other elements */}
                                <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-semibold rounded-full px-2 py-1 z-10">
                                  {image.lung_nodules.length} {image.lung_nodules.length === 1 ? 'nódulo' : 'nódulos'}
                                </div>
                                
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-2 z-10">
                                  {image.full_image.split('/').pop()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* Scroll indicators/buttons for analyzed images */}
                  {clinicalCase.medical_images.filter(img => img.state === 'analyzed').length > 3 && (
                    <>
                      <button 
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
                        onClick={() => {
                          const currentSection = document.querySelector('[data-section="analyzed-images"]');
                          const container = currentSection?.querySelector('.overflow-x-auto');
                          if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
                        onClick={() => {
                          const currentSection = document.querySelector('[data-section="analyzed-images"]');
                          const container = currentSection?.querySelector('.overflow-x-auto');
                          if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                
                {/* Selection info */}
                <div className="mt-2 text-sm text-gray-600 text-center">
                  {selectedAnalyzedImageId ? 
                    "Imagen seleccionada. Ver el reporte detallado a continuación." :
                    "Seleccione una imagen para ver el reporte detallado."
                  }
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-center py-8">
                No hay imágenes analizadas disponibles
              </div>
            )}
          </div>
        )}

        {/* Detailed Report Section - Only shown when an image is selected */}
        {selectedAnalyzedImage && (
          <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">REPORTE DE TOMOGRAFÍAS ANALIZADAS</h2>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col lg:flex-row">
                {/* Left side - Full size image display */}
                <div className="lg:w-1/2 mb-6 lg:mb-0 lg:pr-6">
                  <div className="relative w-full aspect-square border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    {/* Full size image */}
                    <div className="relative w-full h-full">
                      <Image
                        src={`${API_URL}/${selectedAnalyzedImage.processed_image}`}
                        alt={`Full Medical Image Analysis`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain"
                      />
                      
                      {/* Show nodule markers */}
                      {selectedAnalyzedImage.lung_nodules.map((nodule) => (
                        <div
                          key={nodule.id}
                          className="absolute w-4 h-4 bg-yellow-500/50 rounded-full border-2 border-white/50 shadow-md"
                          style={{
                            left: `${nodule.x_position * 100}%`,
                            top: `${nodule.y_position * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10
                          }}
                        >
                          {/* Add a number label to match nodules in the list */}
                          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white/50">
                            {selectedAnalyzedImage.lung_nodules.indexOf(nodule) + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Image filename */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-sm p-2 rounded">
                      {selectedAnalyzedImage.processed_image.split('/').pop()}
                    </div>
                  </div>
                  
                  {/* Image controls */}
                  <div className="mt-4 flex justify-center space-x-4">
                    <button 
                      onClick={() => {
                        setIsFullScreenActive(true);
                        const index = analyzedImages.findIndex(img => img.id === selectedAnalyzedImage.id);
                        if (index !== -1) {
                          setFullScreenImageIndex(index);
                        }
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                      Ver pantalla completa
                    </button>
                  </div>
                </div>
                
                {/* Right side - Nodules report */}
                <div className="lg:w-1/2 lg:pl-6 lg:border-l lg:border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Nódulos detectados
                  </h3>
                  
                  {selectedAnalyzedImage.lung_nodules.length > 0 ? (
                    <ul className="space-y-4">
                      {selectedAnalyzedImage.lung_nodules.map((nodule, index) => {
                        // Convert confidence to percentage with 2 decimal places
                        const confidencePercentage = (nodule.confidence * 100).toFixed(2);
                        
                        // Determine severity class based on malignancy type
                        let severityClass = "bg-gray-100 border-gray-300";
                        let textClass = "text-gray-800";
                        
                        if (nodule.malignancy_type.toLowerCase() === "benigno") {
                          severityClass = "bg-green-50 border-green-200";
                          textClass = "text-green-800";
                        } else if (nodule.malignancy_type.toLowerCase() === "maligno") {
                          severityClass = "bg-red-50 border-red-200";
                          textClass = "text-red-800";
                        } else if (nodule.malignancy_type.toLowerCase() === "sospechoso") {
                          severityClass = "bg-yellow-50 border-yellow-200";
                          textClass = "text-yellow-800";
                        }
                        
                        return (
                          <li 
                            key={nodule.id} 
                            className={`p-4 rounded-lg border ${severityClass} transition-all hover:shadow-md`}
                          >
                            <div className="flex items-center">
                              {/* Numbered marker matching the image */}
                              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500 text-white font-bold mr-3">
                                {index + 1}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className={`font-semibold ${textClass}`}>
                                  Nódulo {index + 1}: {nodule.malignancy_type}
                                </h4>
                                
                                <div className="mt-2">
                                  <div className="flex items-center mb-1">
                                    <span className="text-sm text-gray-600 mr-2">Confianza:</span>
                                    <span className="text-sm font-semibold">{confidencePercentage}%</span>
                                  </div>
                                  
                                  {/* Progress bar showing confidence */}
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        nodule.confidence < 0.5 ? "bg-green-500" :
                                        nodule.confidence > 0.7 ? "bg-red-500" : 
                                        "bg-yellow-500"
                                      }`}
                                      style={{ width: `${confidencePercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Dimensions information */}
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Posición:</span> 
                                    <div className="text-xs mt-1">
                                      X: {(nodule.x_position * 100).toFixed(1)}%<br />
                                      Y: {(nodule.y_position * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Dimensiones:</span> 
                                    <div className="text-xs mt-1">
                                      Ancho: {(nodule.width * 100).toFixed(1)}%<br />
                                      Alto: {(nodule.height * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2 text-gray-600">No se detectaron nódulos en esta imagen.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={generatePDF}
                  className="flex items-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Generar PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen image viewer */}
        {isFullScreenActive && analyzedImages.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative max-w-full max-h-full aspect-square">
                <Image
                  src={`${API_URL}/${analyzedImages[fullScreenImageIndex].full_image}`}
                  alt="Fullscreen medical image"
                  width={2000}
                  height={2000}
                  className="object-contain max-w-full max-h-full"
                  priority
                />
                
                {/* Show nodule markers in fullscreen if highlights are enabled */}
                {showHighlights && analyzedImages[fullScreenImageIndex].lung_nodules.map((nodule) => (
                  <div key={nodule.id}>
                    {/* Rectangular bounding box for the nodule */}
                    <div
                      className="absolute border-1 border-yellow-500/80 bg-yellow-500/30 rounded-sm"
                      style={{
                        left: `${nodule.x_position * 100}%`,
                        top: `${nodule.y_position * 100}%`,
                        width: `${nodule.width * 1.4 * 100}%`,
                        height: `${nodule.height * 1.4 * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Fullscreen controls */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-6 text-white">
              {/* Previous image button */}
              <button 
                onClick={() => {
                  if (fullScreenImageIndex > 0) {
                    setFullScreenImageIndex(fullScreenImageIndex - 1);
                    setSelectedAnalyzedImageId(analyzedImages[fullScreenImageIndex - 1].id);
                  }
                }}
                disabled={fullScreenImageIndex === 0}
                className={`p-3 rounded-full bg-black/50 hover:bg-black/70 ${fullScreenImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Toggle highlights button */}
              <button 
                onClick={() => setShowHighlights(!showHighlights)}
                className="p-3 rounded-full bg-black/50 hover:bg-black/70"
              >
                {showHighlights ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              
              {/* Close button */}
              <button 
                onClick={() => setIsFullScreenActive(false)}
                className="p-3 rounded-full bg-black/50 hover:bg-black/70"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Next image button */}
              <button 
                onClick={() => {
                  if (fullScreenImageIndex < analyzedImages.length - 1) {
                    setFullScreenImageIndex(fullScreenImageIndex + 1);
                    setSelectedAnalyzedImageId(analyzedImages[fullScreenImageIndex + 1].id);
                  }
                }}
                disabled={fullScreenImageIndex === analyzedImages.length - 1}
                className={`p-3 rounded-full bg-black/50 hover:bg-black/70 ${fullScreenImageIndex === analyzedImages.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Image counter */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {fullScreenImageIndex + 1} / {analyzedImages.length}
            </div>
            
            {/* Keyboard instructions */}
            <div className="hidden absolute top-6 right-6 bg-black/50 text-white px-3 py-1 rounded-lg text-xs md:block">
              <p>ESC: Salir | ←→: Navegar | H: Ocultar/mostrar nódulos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}