import { FaSpinner } from 'react-icons/fa';

const LoadingIndicator = ({ steps, currentStep }) => {
  const progress = ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative mb-6 w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-teal-100"></div>
        <FaSpinner className="absolute inset-0 m-auto animate-spin text-3xl text-teal-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-teal-700">
            {Math.floor(progress)}%
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-center mb-2 max-w-xs">{currentStep}</p>
      <div className="w-full bg-gray-100 rounded-full h-2 mt-2 max-w-xs">
        <div 
          className="bg-gradient-to-r from-teal-500 to-blue-600 h-2 rounded-full" 
          style={{ 
            width: `${progress}%`,
            transition: 'width 0.5s ease-in-out'
          }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Analyzing with precision...
      </p>
    </div>
  );
};

export default LoadingIndicator;