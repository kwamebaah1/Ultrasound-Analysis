'use client';

import { useState, useRef, useEffect } from 'react';
import { FiActivity, FiAlertCircle, FiBarChart2, FiInfo } from 'react-icons/fi';
import ChatBot from './components/ChatBot/ChatBot';
import HeatmapVisualization from './components/Heatmap/HeatmapVisualization';
import LoadingIndicator from './components/LoadingIndicator';
import DiagnosisResult from './components/DiagnosisResult';
import ProbabilityBar from './components/ProbabilityBar';
import UploadArea from './components/UploadArea';
import Panel from './components/Panel';
import pollHeatmap from './components/Heatmap';
import { API_URL } from './config';

const LOADING_STEPS = [
  'Uploading image',
  'Extracting image features',
  'Analysing tissue patterns',
  'Classifying',
  'Preparing explanation',
  'Finalising results',
];

const MAX_FILE_BYTES = 5 * 1024 * 1024;

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

  useEffect(() => {
    if (!isLoading) return;
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < LOADING_STEPS.length) {
        setLoadingProgress(LOADING_STEPS[currentStep]);
        currentStep++;
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading]);

  const resetResults = () => {
    setPrediction(null);
    setHeatmapUrl(null);
    setHeatmapLoading(false);
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please upload an image file (PNG or JPG).');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('File size should be less than 5 MB.');
      return;
    }

    setError('');
    setImage(file);
    resetResults();

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview('');
    setError('');
    resetResults();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePredict = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError('');
    resetResults();
    setLoadingProgress(LOADING_STEPS[0]);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(`${API_URL}/predict`, {
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
          messages: [{ role: 'user', content: initialPrompt }],
        }),
      });

      const chatData = await chatResponse.json();

      setPrediction({
        diagnosis: result.diagnosis,
        benign: result.benign_prob,
        malignant: result.malignant_prob,
        confidence: result.confidence,
        advice: chatData.assistant || 'No additional insight provided.',
      });
    } catch (err) {
      setError('Failed to get a prediction. Please check the connection to the analysis server and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingProgress('');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white">
            <FiActivity size={16} aria-hidden />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            Ultrasound Analysis
          </span>
          <span className="ml-auto hidden rounded border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500 sm:inline">
            Decision support · Research use
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Breast ultrasound analysis
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Upload a breast ultrasound image to classify it as benign or malignant. Malignant
            results include a heatmap of the regions that most influenced the model.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Panel title="Image" step="1" className="lg:sticky lg:top-6">
            <UploadArea
              preview={preview}
              image={image}
              onSelect={() => fileInputRef.current?.click()}
              onFile={handleFile}
              onRemove={handleRemoveImage}
              disabled={isLoading}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFile(e.target.files?.[0])}
              accept="image/png,image/jpeg"
              className="hidden"
            />

            <button
              type="button"
              onClick={handlePredict}
              disabled={!image || isLoading}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {isLoading ? 'Analysing…' : prediction ? 'Run analysis again' : 'Analyse image'}
            </button>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
              >
                <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            )}
          </Panel>

          <div className="space-y-6">
            <Panel title="Results" step="2">
              {isLoading ? (
                <LoadingIndicator steps={LOADING_STEPS} currentStep={loadingProgress} />
              ) : prediction ? (
                <div className="divide-y divide-slate-100">
                  <section className="pb-5">
                    <DiagnosisResult
                      diagnosis={prediction.diagnosis}
                      confidence={prediction.confidence}
                    />
                  </section>

                  <section className="py-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Class probabilities
                    </h3>
                    <div className="space-y-3">
                      <ProbabilityBar label="Benign" value={prediction.benign} tone="benign" />
                      <ProbabilityBar label="Malignant" value={prediction.malignant} tone="malignant" />
                    </div>
                  </section>

                  {(heatmapLoading || heatmapUrl) && (
                    <section className="py-5">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Model attention (Grad-CAM)
                      </h3>
                      {heatmapUrl ? (
                        <HeatmapVisualization heatmapUrl={heatmapUrl} diagnosis={prediction.diagnosis} />
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
                          Generating heatmap…
                        </div>
                      )}
                    </section>
                  )}

                  <section className="pt-5">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Explanation
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700">{prediction.advice}</p>
                  </section>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <FiBarChart2 aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-slate-900">No analysis yet</p>
                  <p className="mt-1 max-w-xs text-sm text-slate-500">
                    Upload an image and select <span className="font-medium">Analyse image</span> to
                    see the classification here.
                  </p>
                </div>
              )}
            </Panel>

            {prediction && !isLoading && (
              <ChatBot
                key={`${prediction.diagnosis}-${prediction.confidence}`}
                initialAdvice={prediction.advice}
                diagnosis={prediction.diagnosis}
                confidence={prediction.confidence}
              />
            )}

            <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <FiInfo className="mt-0.5 shrink-0" aria-hidden />
              This analysis is for preliminary assessment only and is not a medical diagnosis.
              Please consult a qualified medical professional for a definitive diagnosis.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} Ultrasound Analysis System</span>
          <span>For clinical decision support only</span>
        </div>
      </footer>
    </div>
  );
}
