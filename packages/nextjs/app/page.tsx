import Link from "next/link";
import Image from "next/image";
import { ConnectedAddress } from "~~/components/ConnectedAddress";
import { CounterDisplay } from "~~/components/CounterDisplay";
import { CounterControls } from "~~/components/CounterControls";
import { ResetCounter } from "~~/components/ResetCounter";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

const Home = () => {
  // Single call to get_counter at the top level
  const { data: counterValue, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "Counter",
    functionName: "get_counter",
  });

  // Get the contract owner
  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "Counter",
    functionName: "owner",
  });

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="max-w-2xl w-full space-y-6">
        <CounterDisplay 
          counterValue={counterValue} 
          isLoading={isLoading} 
          error={error} 
          refetch={refetch} 
        />
        <CounterControls 
          counterValue={counterValue} 
          onCounterChange={refetch}
          ownerAddress={ownerAddress}
        />
        <ResetCounter 
          counterValue={counterValue} 
          onCounterChange={refetch}
          ownerAddress={ownerAddress}
        />
      </div>
    </div>
  );
};

export default Home;

