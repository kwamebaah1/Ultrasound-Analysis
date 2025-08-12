const DiagnosisResult = ({ diagnosis, confidence }) => {
  return (
    <div className={`p-4 rounded-lg border-l-4 ${
      diagnosis === 'Benign'
        ? 'border-green-500 bg-green-50 text-green-800' 
        : 'border-red-500 bg-red-50 text-red-800'
    }`}>
      <div className="flex justify-between items-center">
        <p className="font-bold text-lg">{diagnosis}</p>
        <span className="text-sm bg-white px-3 py-1 rounded-full font-medium shadow-sm">
          Confidence: {confidence.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default DiagnosisResult