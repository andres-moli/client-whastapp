export function ProgressBar({ 
    progress 
  }: { 
    progress?: { 
      current: number; 
      total: number; 
      percentage: number 
    } 
  }) {
    const safeProgress = progress || { 
      current: 0, 
      total: 100, 
      percentage: 0 
    };
  
    const getProgressColor = (percentage: number) => {
      if (percentage < 30) return 'bg-red-500';
      if (percentage < 70) return 'bg-yellow-500';
      return 'bg-green-500';
    };
  
    const getStatusText = (percentage: number) => {
      if (percentage === 0) return 'Esperando inicio...';
      if (percentage < 30) return 'En progreso...';
      if (percentage < 70) return 'Trabajando...';
      if (percentage < 100) return 'Casi terminado!';
      return '¡Completado!';
    };
  
    return (
      <div className="space-y-2">
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full ${getProgressColor(safeProgress.percentage)} 
              transition-all duration-500 ease-out 
              shadow-lg 
              bg-gradient-to-r from-current to-transparent 
              opacity-90 hover:opacity-100`}
            style={{ 
              width: `${safeProgress.percentage}%`,
              boxShadow: '0 0 8px currentColor'
            }}
          >
            {/* Aquí se removió el efecto de pulso */}
          </div>
        </div>
  
        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
          <span className="font-medium">
            {getStatusText(safeProgress.percentage)}
          </span>
          
          <span className="flex items-center space-x-1">
            <span className="font-mono">
              {safeProgress.current.toLocaleString()}/{safeProgress.total.toLocaleString()}
            </span>
            <span className="w-12 text-right font-bold">
              ({Math.round(safeProgress.percentage)}%)
            </span>
          </span>
        </div>
  
        {/* {safeProgress.percentage > 0 && safeProgress.percentage < 100 && (
          <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(safeProgress.percentage)}`}
              style={{ width: `${safeProgress.percentage}%` }}
            ></div>
          </div>
        )} */}
      </div>
    );
  }