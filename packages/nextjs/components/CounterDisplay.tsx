"use client";

interface CounterDisplayProps {
  counterValue: any;
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

export const CounterDisplay = ({ counterValue, isLoading, error, refetch }: CounterDisplayProps) => {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="loading loading-spinner loading-md"></span>
        <span className="ml-2">Loading counter value...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Error loading counter!</h3>
          <div className="text-xs">{error.message}</div>
        </div>
        <button className="btn btn-sm" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Counter Value</h2>
        <div className="text-4xl font-bold text-primary">
          {counterValue !== undefined ? counterValue.toString() : "N/A"}
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-sm" onClick={() => refetch()}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
