'use client';

import { useState, useRef, useEffect } from 'react';
import { FaChartBar } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import ChatBot from './components/ChatBot/ChatBot';
import HeatmapVisualization from './components/Heatmap/HeatmapVisualization';
import LoadingIndicator from './components/LoadingIndicator';
import DiagnosisResult from './components/DiagnosisResult';
import ProbabilityBar from './components/ProbabilityBar';
import UploadArea from './components/UploadArea';
import pollHeatmap from './components/Heatmap';

export default function Home() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [heatmapUrl, setHeatmapUrl] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

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
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (PNG or JPG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setError('');
    setImage(file);
    setPrediction(null);
    setHeatmapUrl(null);
    
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

      if (result.diagnosis === 'Malignant') {
        setHeatmapLoading(true);
        pollHeatmap(result.id, setHeatmapUrl, setHeatmapLoading);
      }

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
      setError('Failed to get prediction. Please try again later.');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-6xl mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Ultrasound Analysis System
          </span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Advanced AI-powered breast ultrasound analysis for early detection and assessment
        </p>
      </header>

      <main className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0 md:gap-8 p-6 md:p-8">
          {/* Image Upload Section */}
          <div className="mb-8 md:mb-0">
            <UploadArea 
              preview={preview}
              triggerFileInput={triggerFileInput}
              image={image}
              setPreview={setPreview}
            />
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload} 
              accept="image/*"
              className="hidden"
            />
          </div>
          
          {/* Analysis Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                <FaChartBar className="text-teal-600" />
              </div>
              Analysis Results
            </h2>
            
            {isLoading ? (
              <LoadingIndicator steps={loadingSteps} currentStep={loadingProgress} />
            ) : prediction ? (
              <div className="space-y-6">
                <DiagnosisResult diagnosis={prediction.diagnosis} confidence={prediction.confidence} />
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Probability Distribution</h3>
                  <div className="space-y-4">
                    <ProbabilityBar label="Benign" value={prediction.benign} color="green" />
                    <ProbabilityBar label="Malignant" value={prediction.malignant} color="red" />
                  </div>
                  
                  {heatmapLoading && (
                    <div className="text-center py-4 text-sm text-gray-500">Generating heatmap...</div>
                  )}
                  
                  {heatmapUrl && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-700 mb-3">Heatmap Visualization</h3>
                      <HeatmapVisualization 
                        heatmapUrl={heatmapUrl} 
                        diagnosis={prediction.diagnosis} 
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Explanation</h3>
                  <div className="bg-blue-50/70 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                    {prediction.advice}
                  </div>
                </div>
                
                <ChatBot 
                  initialAdvice={prediction.advice}
                  diagnosis={prediction.diagnosis}
                  confidence={prediction.confidence}
                />
                
                <div className="bg-blue-50/70 p-4 rounded-lg text-sm text-blue-800 flex items-start border border-blue-100">
                  <FiInfo className="mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                  <p>This analysis is for preliminary assessment only. Please consult with a medical professional for definitive diagnosis.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <FaChartBar className="text-teal-600 text-xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No analysis yet</h3>
                <p className="text-gray-500 mb-6 max-w-xs">Upload an ultrasound image and click analyze to get results</p>
                <button
                  onClick={handlePredict}
                  disabled={!image}
                  className={`py-2.5 px-8 rounded-full font-medium flex items-center transition-all ${
                    image 
                      ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Analyze Image
                </button>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Medical AI Analysis System • For clinical support use only</p>
      </footer>
    </div>
  );
}