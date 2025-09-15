'use client';

import { useState, useMemo } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useAccount } from "~~/hooks/useAccount";

interface SetCounterProps {
	currentValue: any;
	onCounterChange: () => void;
}

export const SetCounter = ({ currentValue, onCounterChange }: SetCounterProps) => {
	const { address, isConnected } = useAccount();
	const [inputValue, setInputValue] = useState<string>("");

	const { sendAsync: setCounter, isPending, error } = useScaffoldWriteContract({
		contractName: "Counter",
		functionName: "set_counter",
	});

	const normalizedCurrentValue: number | undefined = useMemo(() => {
		if (typeof currentValue === "bigint") return Number(currentValue);
		if (typeof currentValue === "number") return currentValue;
		if (Array.isArray(currentValue) && currentValue.length > 0) {
			const val = currentValue[0];
			if (typeof val === "bigint" || typeof val === "number") return Number(val);
		}
		return undefined;
	}, [currentValue]);

	const parsedValue = useMemo(() => {
		if (inputValue.trim() === "") return undefined;
		if (!/^\d+$/.test(inputValue.trim())) return NaN;
		try {
			const n = Number(inputValue.trim());
			return n;
		} catch {
			return NaN;
		}
	}, [inputValue]);

	const isValidU32 = useMemo(() => {
		return typeof parsedValue === "number" && Number.isFinite(parsedValue) && parsedValue >= 0 && parsedValue <= 0xffffffff;
	}, [parsedValue]);

	const isDisabled = !isConnected || isPending || !isValidU32;

	const onSubmit = async () => {
		if (!isValidU32 || typeof parsedValue !== "number") return;
		try {
			await setCounter({ args: [parsedValue] as any[] });
			onCounterChange();
		} catch (err) {
			console.error("Failed to set counter:", err);
		}
	};

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body gap-4">
				<h2 className="card-title">Set Counter</h2>
				<p className="text-sm text-base-content/70">
					Connected as: <span className="font-mono text-xs">{address || "Not connected"}</span>
				</p>
				<div className="form-control w-full">
					<label className="label">
						<span className="label-text">New value (0 - 4,294,967,295)</span>
						{normalizedCurrentValue !== undefined && (
							<span className="label-text-alt">Current: {normalizedCurrentValue}</span>
						)}
					</label>
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						placeholder="Enter new counter value"
						className={`input input-bordered w-full ${inputValue && !isValidU32 ? 'input-error' : ''}`}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
					{inputValue && !isValidU32 && (
						<span className="text-xs text-error mt-1">Please enter a valid unsigned 32-bit integer.</span>
					)}
				</div>
				<div className="card-actions justify-end">
					<button
						className="btn btn-accent"
						onClick={onSubmit}
						disabled={isDisabled}
						title={!isConnected ? 'Connect wallet to set counter' : !isValidU32 ? 'Enter a valid number' : isPending ? 'Transaction in progress' : ''}
					>
						{isPending ? (
							<>
								<span className="loading loading-spinner loading-sm"></span>
								Setting...
							</>
						) : (
							<>Set Counter</>
						)}
					</button>
				</div>
				{error && (
					<div className="alert alert-error">
						<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span className="text-xs">{error.message}</span>
					</div>
				)}
			</div>
		</div>
	);
};
