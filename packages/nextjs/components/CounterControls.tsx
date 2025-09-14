"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useAccount } from "~~/hooks/useAccount";

interface CounterControlsProps {
  counterValue: any;
  onCounterChange: () => void;
  ownerAddress: any;
}

export const CounterControls = ({ counterValue, onCounterChange, ownerAddress }: CounterControlsProps) => {
  const { address, isConnected } = useAccount();
  
  const { sendAsync: increaseCounter, isPending: isIncreasing, error: increaseError } = useScaffoldWriteContract({
    contractName: "Counter",
    functionName: "increase_counter",
  });

  const { sendAsync: decreaseCounter, isPending: isDecreasing, error: decreaseError } = useScaffoldWriteContract({
    contractName: "Counter",
    functionName: "decrease_counter",
  });

  const handleIncreaseCounter = async () => {
    try {
      await increaseCounter();
      onCounterChange(); // Refresh the counter value after successful increase
    } catch (err) {
      console.error("Failed to increase counter:", err);
    }
  };

  const handleDecreaseCounter = async () => {
    try {
      await decreaseCounter();
      onCounterChange(); // Refresh the counter value after successful decrease
    } catch (err) {
      console.error("Failed to decrease counter:", err);
    }
  };

  // Normalize counterValue for consistent checks (handles BigInt, number, array)
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
  
  // Check if current user is the owner
  const isOwner = address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase();
  
  const isDecreaseDisabled = normalizedCounterValue === undefined || normalizedCounterValue === 0 || isDecreasing || !isOwner;
  const isIncreaseDisabled = isIncreasing || !isOwner;
  const currentError = increaseError || decreaseError;

  if (!isConnected) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Counter Controls</h2>
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
            <span>Please connect your wallet to interact with the counter</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Counter Controls</h2>
          <p className="text-sm text-base-content/70">
            Connected as: <span className="font-mono text-xs">{address}</span>
          </p>
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Access Denied</h3>
              <div className="text-xs">Only the contract owner can modify the counter</div>
              <div className="text-xs mt-1">
                Owner: <span className="font-mono">{ownerAddress || "Loading..."}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Counter Controls</h2>
        <p className="text-sm text-base-content/70">
          Connected as: <span className="font-mono text-xs">{address}</span>
        </p>
        
        {currentError && (
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
              <h3 className="font-bold">Transaction Error!</h3>
              <div className="text-xs">{currentError.message}</div>
            </div>
          </div>
        )}

        <div className="card-actions justify-center gap-4">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleIncreaseCounter}
            disabled={isIncreaseDisabled}
            title={
              isIncreaseDisabled && !isOwner
                ? "Only the contract owner can modify the counter"
                : isIncreaseDisabled
                ? "Transaction in progress"
                : ""
            }
          >
            {isIncreasing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Increasing...
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Increase
              </>
            )}
          </button>
          
          <button
            className={`btn btn-lg ${
              isDecreaseDisabled 
                ? "btn-disabled opacity-50 cursor-not-allowed" 
                : "btn-secondary"
            }`}
            onClick={handleDecreaseCounter}
            disabled={isDecreaseDisabled}
            title={
              isDecreaseDisabled && !isOwner
                ? "Only the contract owner can modify the counter"
                : isDecreaseDisabled && normalizedCounterValue === 0
                ? "Cannot decrease counter below 0"
                : isDecreaseDisabled
                ? "Counter value is loading or transaction in progress"
                : ""
            }
          >
            {isDecreasing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Decreasing...
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
                    d="M20 12H4"
                  />
                </svg>
                Decrease
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
