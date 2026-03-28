'use client';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center hidden sm:block">
                <div
                  className={`text-xs font-semibold ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: show current step info */}
      <div className="mt-4 sm:hidden text-center">
        <div className="text-sm font-semibold text-blue-600">
          步骤 {currentStep}：{steps.find((s) => s.id === currentStep)?.title}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {steps.find((s) => s.id === currentStep)?.description}
        </div>
      </div>
    </div>
  );
}
