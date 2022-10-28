import '../css/App.css';
import { useMemo } from 'react';
import * as anchor from '@project-serum/anchor';
import Home from './Home';
import Raffle from './Raffles/Raffles';

import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from '@solana/wallet-adapter-wallets';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';

import { ThemeProvider, createTheme } from '@material-ui/core';

import { BrowserRouter, Routes, Route } from "react-router-dom";

const theme = createTheme({
  palette: {
    type: 'dark',
  },
});

const getMagicHatId = (): anchor.web3.PublicKey | undefined => {
  try {
    const magicHatId = new anchor.web3.PublicKey(
      process.env.REACT_APP_MAGIC_HAT_ID!,
    );
    console.log(magicHatId);
    return magicHatId;
  } catch (e) {
    console.log('Failed to construct MagicHatId', e);
    return undefined;
  }
};

const magicHatId = getMagicHatId();
const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;
const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost
  ? rpcHost
  : anchor.web3.clusterApiUrl('devnet'));

const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);
const txTimeoutInMilliseconds = 30000;

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSlopeWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [],
  );

  const HomeParent = () => {
    return (
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <Home
                magicHatId={magicHatId}
                connection={connection}
                startDate={startDateSeed}
                txTimeout={txTimeoutInMilliseconds}
                rpcHost={rpcHost}
              />
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeParent />}>
        </Route>
        <Route path="/raffles" element={<Raffle />}>
        </Route>
      </Routes>
    </BrowserRouter>
    
  );
};

export default App;
