'use client'

import { useState, useRef, useEffect } from 'react';
import { FaUpload, FaSpinner, FaChartBar, FaInfoCircle } from 'react-icons/fa';
import ChatBot from './components/ChatBot';

export default function Home() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

  // Simulated loading steps
  const loadingSteps = [
    "Uploading image to server...",
    "Analyzing image features...",
    "Processing tissue patterns...",
    "Generating diagnosis...",
    "Preparing explanation...",
    "Finalizing results..."
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (isLoading && currentStep < loadingSteps.length) {
        setLoadingProgress(loadingSteps[currentStep]);
        currentStep++;
      }
    }, 1500); // Rotate through steps every 1.5 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return;
    }

    setError('');
    setImage(file);
    setPrediction(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handlePredict = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setLoadingProgress(loadingSteps[0]);
    
    try {
      const formData = new FormData();
      formData.append('image', image);
      
      const response = await fetch('https://kbaah7-ultrasound-analysis.hf.space/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const initialPrompt = `Explain briefly and clearly what it means when a deep learning model diagnoses a breast ultrasound as "${result.diagnosis}" with ${result.confidence.toFixed(1)}% confidence. Respond in under 3 sentences and end by inviting the user to ask for more details if needed.`;
      
      const chatResponse = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful medical assistant who provides brief and clear explanations to patients in simple terms. Keep responses concise and friendly.' },
            { role: 'user', content: initialPrompt }
          ]
        })
      });

      const chatData = await chatResponse.json();

      const processedResult = {
        diagnosis: result.diagnosis,
        benign: result.benign_prob,
        malignant: result.malignant_prob,
        confidence: result.confidence,
        advice: chatData.assistant || 'No additional insight provided.'
      };
      
      setPrediction(processedResult);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingProgress('');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-12 px-4">
      <header className="w-full max-w-6xl mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          <span className="text-blue-600">Ultrasound</span> Analysis System
        </h1>
        <p className="text-gray-600">AI-powered breast ultrasound image analysis for early detection</p>
      </header>

      <main className="w-full max-w-6xl bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Image Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
            {preview ? (
              <div className="relative w-full h-64 mb-4">
                <img 
                  src={preview} 
                  alt="Uploaded ultrasound" 
                  className="w-full h-full object-contain rounded-md"
                />
                <button 
                  onClick={() => setPreview('')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FaUpload className="mx-auto text-4xl text-blue-400 mb-4" />
                <p className="text-gray-500 mb-4">Upload your breast ultrasound image</p>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload} 
              accept="image/*"
              className="hidden"
            />
            
            <button
              onClick={triggerFileInput}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium py-2 px-6 rounded-full flex items-center"
            >
              <FaUpload className="mr-2" />
              {image ? 'Change Image' : 'Select Image'}
            </button>
            
            {image && (
              <p className="mt-2 text-sm text-gray-500">
                {image.name} ({(image.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          
          {/* Analysis Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartBar className="text-blue-500 mr-2" />
              Analysis Results
            </h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative mb-6">
                  <FaSpinner className="animate-spin text-4xl text-blue-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-700">
                      {Math.floor((loadingSteps.indexOf(loadingProgress) / loadingSteps.length) * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-center mb-2">{loadingProgress}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ 
                      width: `${(loadingSteps.indexOf(loadingProgress) / (loadingSteps.length - 1) * 100)}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  This may take a moment as we carefully analyze your ultrasound...
                </p>
              </div>
            ) : prediction ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Diagnosis</h3>
                  <div className={`p-4 rounded-lg ${
                    prediction.diagnosis === 'Benign'
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-lg">{prediction.diagnosis}</p>
                      <span className="text-sm bg-white px-2 py-1 rounded-full font-medium">
                        Confidence: {prediction.confidence.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Probability Distribution</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-700">Benign</span>
                        <span className="font-medium">{prediction.benign.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full" 
                          style={{ width: `${prediction.benign}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-700">Malignant</span>
                        <span className="font-medium">{prediction.malignant.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full" 
                          style={{ width: `${prediction.malignant}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Explanation</h3>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                    {prediction.advice}
                  </div>
                </div>
                <ChatBot 
                  initialAdvice={prediction.advice}
                  diagnosis={prediction.diagnosis}
                  confidence={prediction.confidence}
                />
                
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 flex items-start">
                  <FaInfoCircle className="mr-2 mt-0.5 flex-shrink-0" />
                  <p>This analysis is for preliminary assessment only. Please consult with a medical professional for definitive diagnosis.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <FaChartBar className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No analysis yet</h3>
                <p className="text-gray-500 mb-4">Upload an ultrasound image and click predict to get results</p>
                <button
                  onClick={handlePredict}
                  disabled={!image}
                  className={`py-2 px-6 rounded-full font-medium flex items-center ${
                    image 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Analyze Image
                </button>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Medical AI Analysis System v1.0 • For research and testing purposes only</p>
      </footer>
    </div>
  );
}