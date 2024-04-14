'use client'

import { useEffect, useState } from "react";
import {ethers} from "ethers";


export default function Home() {
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);

  const handleMetamaskLogin = async () => {
    if (!isMetamaskInstalled) {
      alert("Please install Metamask to continue");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log(address);
    const nonce = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ publicAddress: address }),
    }).then((res) => res.json());
    
    console.log(nonce);
    
  };

  useEffect(() => {
    setIsMetamaskInstalled(!!window.ethereum);
  });

  return (
    <>
      <div>
        <h1>Welcome, Please select an option below to continue.</h1>
        <button onClick={handleMetamaskLogin}>Login with Metamask</button>
      </div>
    </>
  );
}
