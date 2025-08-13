import { FaUpload } from "react-icons/fa";

const UploadArea = ({ preview, triggerFileInput, image, setPreview }) => {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center transition-all hover:border-teal-300 hover:bg-teal-50/50">
      {preview ? (
        <div className="relative w-full h-64 mb-4 group">
          <img 
            src={preview} 
            alt="Uploaded ultrasound" 
            className="w-full h-full object-contain rounded-lg shadow-sm"
          />
          <button 
            onClick={() => setPreview('')}
            className="absolute top-3 right-3 bg-white/90 text-gray-600 rounded-full p-1.5 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <FaUpload className="text-2xl text-teal-600" />
          </div>
          <p className="text-gray-500 mb-4">Upload breast ultrasound image</p>
          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
        </div>
      )}
      
      <button
        onClick={triggerFileInput}
        className="mt-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium py-2.5 px-8 rounded-full flex items-center shadow-md hover:shadow-lg transition-all"
      >
        <FaUpload className="mr-2" />
        {image ? 'Change Image' : 'Select Image'}
      </button>
      
      {image && (
        <p className="mt-3 text-sm text-gray-500">
          {image.name} ({(image.size / 1024).toFixed(1)} KB)
        </p>
      )}
    </div>
  );
};

export default UploadArea;