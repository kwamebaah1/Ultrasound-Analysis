const ProbabilityBar = ({ label, value, color }) => {
  const gradient = {
    green: 'from-green-400 to-green-600',
    red: 'from-red-400 to-red-600',
    blue: 'from-blue-400 to-blue-600'
  }[color];

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-medium text-gray-700">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div 
          className={`bg-gradient-to-r ${gradient} h-2.5 rounded-full`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProbabilityBar;