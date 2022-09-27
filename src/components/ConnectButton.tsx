import { Button, Box, Text } from "@chakra-ui/react";
import Identicon from "./Identicon";
import { useState } from "react";
declare const window: any;

type Props = {
  handleOpenModal: any;
};

export default function ConnectButton({ handleOpenModal }: Props) {
  const [currentPrincipalId, setCurrentPrincipalId] = useState("");
  const [actor, setActor] = useState<any>();

  async function handleConnectWallet() {
    try {
      // Add the Sonic mainnet canister to whitelist
      const sonicCanisterId = "3xwpq-ziaaa-aaaah-qcn4a-cai";
      const whitelist = [sonicCanisterId];

      // Create an interface factory from a canister's IDL
      const sonicPartialInterfaceFactory = ({ IDL }: any) => {
        const TokenInfoExt = IDL.Record({
          id: IDL.Text,
          fee: IDL.Nat,
          decimals: IDL.Nat8,
          name: IDL.Text,
          totalSupply: IDL.Nat,
          symbol: IDL.Text,
        });
        const PairInfoExt = IDL.Record({
          id: IDL.Text,
          price0CumulativeLast: IDL.Nat,
          creator: IDL.Principal,
          reserve0: IDL.Nat,
          reserve1: IDL.Nat,
          lptoken: IDL.Text,
          totalSupply: IDL.Nat,
          token0: IDL.Text,
          token1: IDL.Text,
          price1CumulativeLast: IDL.Nat,
          kLast: IDL.Nat,
          blockTimestampLast: IDL.Int,
        });
        const SwapInfo = IDL.Record({
          owner: IDL.Principal,
          cycles: IDL.Nat,
          tokens: IDL.Vec(TokenInfoExt),
          pairs: IDL.Vec(PairInfoExt),
        });
        return IDL.Service({
          getSwapInfo: IDL.Func([], [SwapInfo], ["query"]),
        });
      };

      const sonicActor = await window.ic.plug.createActor({
        canisterId: sonicCanisterId,
        interfaceFactory: sonicPartialInterfaceFactory,
      });

      // Request a connection
      // Will fire onConnectionUpdate on account switch
      await window?.ic?.plug?.requestConnect({
        whitelist,
      });

      setCurrentPrincipalId((window as any).ic.plug.principalId);
      setActor(sonicActor);
    } catch (e) {
      console.log(e);
    }
    // activateBrowserWallet();
  }

  const handleGetSwapInfo = async () => {
    // use our actors getSwapInfo method
    const swapInfo = await actor.getSwapInfo();
    console.log("Sonic Swap Info: ", swapInfo);
  };

  return currentPrincipalId ? (
    <Box
      display="flex"
      alignItems="center"
      background="gray.700"
      borderRadius="xl"
      py="0"
    >
      <Button
        onClick={handleOpenModal}
        bg="gray.800"
        border="1px solid transparent"
        _hover={{
          border: "1px",
          borderStyle: "solid",
          borderColor: "blue.400",
          backgroundColor: "gray.700",
        }}
        borderRadius="xl"
        m="1px"
        px={3}
        height="38px"
      >
        <Text color="white" fontSize="md" fontWeight="medium" mr="2">
          {currentPrincipalId}
        </Text>
        <Identicon />
      </Button>
      <Button
        onClick={handleGetSwapInfo}
        bg="gray.800"
        border="1px solid transparent"
        _hover={{
          border: "1px",
          borderStyle: "solid",
          borderColor: "blue.400",
          backgroundColor: "gray.700",
        }}
        borderRadius="xl"
        m="1px"
        px={3}
        height="38px"
      >
        <Text color="white" fontSize="md" fontWeight="medium" mr="2">
          Handle get swap info
        </Text>
      </Button>
    </Box>
  ) : (
    <Button
      onClick={handleConnectWallet}
      bg="blue.800"
      color="blue.300"
      fontSize="lg"
      fontWeight="medium"
      borderRadius="xl"
      border="1px solid transparent"
      _hover={{
        borderColor: "blue.700",
        color: "blue.400",
      }}
      _active={{
        backgroundColor: "blue.800",
        borderColor: "blue.700",
      }}
    >
      Connect to a wallet
    </Button>
  );
}
