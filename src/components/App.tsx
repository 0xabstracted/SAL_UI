import "../css/App.css";
import { useMemo } from "react";
import Home from "./Home";
import Raffle from "./Raffles/Raffles";
import CreateRaffle from "./Raffles/CreateRaffle";
import SingleRaffle from "./Raffles/SingleRaffle";
import StartStaking from "./AlphaStaking/startStaking";
import AdminStaking from "./AlphaStaking/adminStaking";
import FixedStaking from "./AlphaStaking/fixedStaking";

import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from "@solana/wallet-adapter-wallets";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";

import { ThemeProvider, createTheme } from "@material-ui/core";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { exact } from "prop-types";
import { QueryClient, QueryClientProvider } from "react-query";

const theme = createTheme({
  palette: {
    type: "dark",
  },
});

const queryClient = new QueryClient();

// const getMagicHatId = (): anchor.web3.PublicKey | undefined => {
//   try {
//     const magicHatId = new anchor.web3.PublicKey(
//       process.env.REACT_APP_MAGIC_HAT_ID!,
//     );
//     console.log(magicHatId);
//     return magicHatId;
//   } catch (e) {
//     console.log('Failed to construct MagicHatId', e);
//     return undefined;
//   }
// };

// const magicHatId = getMagicHatId();
// const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
// const connection = new anchor.web3.Connection(rpcHost
//   ? rpcHost
//   : anchor.web3.clusterApiUrl('devnet'));

// const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);
// const txTimeoutInMilliseconds = 30000;

const App = () => {
  let network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSlopeWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [network]
  );

  const HomeParent = () => {
    return (
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <Home />
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    );
  };

  const CreateRaffleParent = () => {
    return (
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <CreateRaffle />
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    );
  };

  const RafflesParent = () => {
    return (
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <Raffle />
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    );
  };

  const SingleRaffleParent = () => {
    return (
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <SingleRaffle />
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    );
  };

  const StartStakingParent = () => {
    return (
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <StartStaking />
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    );
  };

  const AdminStakingParent = () => {
    return (
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <AdminStaking />
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    );
  };

  const FixedStakingParent = () => {
    return (
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <QueryClientProvider client={queryClient}>
                <FixedStaking client={queryClient} />
              </QueryClientProvider>
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeParent />}></Route>
        <Route path="/raffles" element={<RafflesParent />} />
        <Route path="/start-staking" element={<StartStakingParent />} />
        <Route path="/fixed-staking" element={<FixedStakingParent />} />
        <Route path="/admin-staking" element={<AdminStakingParent />} />
        <Route path="/buy-tickets/*" element={<SingleRaffleParent />} />
        <Route path="/create-raffle" element={<CreateRaffleParent />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
