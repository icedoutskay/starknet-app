"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useAccount } from "~~/hooks/useAccount";

interface ResetCounterProps {
  counterValue: any;
  onCounterChange: () => void;
  ownerAddress: any;
}

export const ResetCounter = ({ counterValue, onCounterChange, ownerAddress }: ResetCounterProps) => {
  const { address, isConnected } = useAccount();
  
  const { sendAsync: resetCounter, isPending: isResetting, error: resetError } = useScaffoldWriteContract({
    contractName: "Counter",
    functionName: "reset_counter",
  });

  const handleResetCounter = async () => {
    try {
      await resetCounter();
      onCounterChange(); // Refresh the counter value after successful reset
    } catch (err) {
      console.error("Failed to reset counter:", err);
    }
  };

  // Check if current user is the owner
	// Removed owner restriction; any connected user can reset (subject to counter value)

  // Normalize counterValue for consistent checks
  const getCounterValue = (value: any): number | undefined => {
    if (typeof value === "bigint") {
      return Number(value);
    } else if (typeof value === "number") {
      return value;
    } else if (Array.isArray(value) && value.length > 0) {
      const val = value[0];
      if (typeof val === "bigint" || typeof val === "number") {
        return Number(val);
      }
    }
    return undefined;
  };

  const normalizedCounterValue = getCounterValue(counterValue);
  const isResetDisabled = normalizedCounterValue === undefined || normalizedCounterValue === 0 || isResetting;

  if (!isConnected) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Reset Counter</h2>
          <div className="alert alert-warning">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>Please connect your wallet to reset the counter</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Reset Counter</h2>
        <p className="text-sm text-base-content/70">
          Connected as: <span className="font-mono text-xs">{address}</span>
        </p>
        
        <div className="alert alert-info">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Reset Cost: 1 STRK</h3>
            <div className="text-xs">
              Resetting the counter requires 1 STRK payment and will set the counter to 0
            </div>
          </div>
        </div>

        {resetError && (
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
              <h3 className="font-bold">Reset Failed!</h3>
              <div className="text-xs">{resetError.message}</div>
            </div>
          </div>
        )}

        <div className="card-actions justify-center">
          <button
            className={`btn btn-lg ${
              isResetDisabled 
                ? "btn-disabled opacity-50 cursor-not-allowed" 
                : "btn-error"
            }`}
            onClick={handleResetCounter}
            disabled={isResetDisabled}
            title={
              isResetDisabled && normalizedCounterValue === 0
                ? "Counter is already at 0"
                : isResetDisabled
                ? "Transaction in progress"
                : "Reset counter to 0 (Costs 1 STRK)"
            }
          >
            {isResetting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Resetting...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Counter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
