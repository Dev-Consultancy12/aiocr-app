import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileUp } from 'lucide-react';
import { uploadPolicyDocument, savePolicy } from '../services/api';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setExtractedData(null);
      setIsSaved(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError('');
      setExtractedData(null);
      setIsSaved(false);
    }
  };

  const handleProcessDocument = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    
    try {
      const response = await uploadPolicyDocument(file);
      if (response.success) {
        setExtractedData({
          policyNumber: response.data.policyNumber || '',
          insuredName: response.data.insuredName || '',
          insurerName: response.data.insurerName || '',
          premiumAmount: response.data.premiumAmount || '',
          expiryDate: response.data.expiryDate || '',
        });
      } else {
        setError(response.error || 'Failed to extract data.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during extraction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExtractedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePolicy = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await savePolicy(extractedData);
      if (response.success) {
        setIsSaved(true);
        setExtractedData(null);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError(response.error || 'Failed to save policy.');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Policy</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload an insurance policy document (PDF, PNG, JPEG, XLSX) to automatically extract details using AI.
        </p>
      </div>

      {!extractedData && !isSaved && (
        <div 
          className="mt-8 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 flex text-sm text-gray-600 justify-center">
            <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              Upload a file
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">PDF, PNG, JPG, XLSX up to 10MB</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/pdf,image/png,image/jpeg,image/jpg,.xlsx,.xls"
          />
        </div>
      )}

      {file && !extractedData && !isSaved && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FileUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleProcessDocument(); }}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Processing...
                </>
              ) : (
                'Process Document'
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSaved && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Policy Saved Successfully!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>The extracted data has been securely saved to the register.</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setIsSaved(false)}
                  className="bg-green-100 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-200 rounded-md"
                >
                  Upload Another Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {extractedData && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Extracted Data Preview</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Please review and correct any inaccuracies before saving.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">
                  Policy Number
                </label>
                <input
                  type="text"
                  name="policyNumber"
                  id="policyNumber"
                  value={extractedData.policyNumber}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="insurerName" className="block text-sm font-medium text-gray-700">
                  Insurer Name
                </label>
                <input
                  type="text"
                  name="insurerName"
                  id="insurerName"
                  value={extractedData.insurerName}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>

              <div className="col-span-6">
                <label htmlFor="insuredName" className="block text-sm font-medium text-gray-700">
                  Insured Name
                </label>
                <input
                  type="text"
                  name="insuredName"
                  id="insuredName"
                  value={extractedData.insuredName}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="premiumAmount" className="block text-sm font-medium text-gray-700">
                  Premium Amount
                </label>
                <input
                  type="text"
                  name="premiumAmount"
                  id="premiumAmount"
                  value={extractedData.premiumAmount}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  id="expiryDate"
                  value={extractedData.expiryDate}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              onClick={() => setExtractedData(null)}
              className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePolicy}
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Policy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
