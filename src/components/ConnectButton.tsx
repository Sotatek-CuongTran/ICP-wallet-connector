import { Button, Box, Text, UnorderedList, ListItem } from "@chakra-ui/react";
import Identicon from "./Identicon";
import { useState } from "react";
import { HttpAgent, Actor } from "@dfinity/agent";
declare const window: any;

type Props = {
  handleOpenModal: any;
};

export default function ConnectButton({ handleOpenModal }: Props) {
  const [currentPrincipalId, setCurrentPrincipalId] = useState("");
  const [actor, setActor] = useState<any>();
  const [helloActor, setHelloActor] = useState<any>();

  async function handleConnectWallet() {
    try {
      // Add the Sonic mainnet canister to whitelist
      const sonicCanisterId = "3xwpq-ziaaa-aaaah-qcn4a-cai";
      const helloCanisterId = "rno2w-sqaaa-aaaaa-aaacq-cai";
      const whitelist = [sonicCanisterId, helloCanisterId];

      const hostLocal = "http://localhost:8000/";

      const agentLocal = new HttpAgent({ host: hostLocal });
      const rootKeyAgentLocal = await agentLocal.fetchRootKey();
      console.log("root key agent local", rootKeyAgentLocal);

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

      // Create an interface factory from a canister's IDL
      const helloPartialInterfaceFactory = ({ IDL }: any) => {
        return IDL.Service({
          get: IDL.Func([], [IDL.Nat], ["query"]),
          greet: IDL.Func([IDL.Text], [IDL.Text], []),
          inc: IDL.Func([], [], []),
          set: IDL.Func([IDL.Nat], [], []),
        });
      };

      const helloActor = Actor.createActor(helloPartialInterfaceFactory, {
        agent: agentLocal,
        canisterId: helloCanisterId,
      })

      const rootKeyPlugBefore =
        await window.ic?.plug.sessionManager.sessionData?.agent.fetchRootKey();
      console.log("root key plug before", rootKeyPlugBefore);

      // Request a connection
      // Will fire onConnectionUpdate on account switch
      await window?.ic?.plug?.requestConnect({
        host: hostLocal,
        whitelist,
      });

      const rootKeyPlugLocal =
        await window.ic?.plug.sessionManager.sessionData?.agent.fetchRootKey();
      console.log("root key plug local", rootKeyPlugLocal);

      setCurrentPrincipalId((window as any).ic.plug.principalId);
      setActor(sonicActor);
      setHelloActor(helloActor);
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

  const handleSendICP = async () => {
    // use our actors getSwapInfo method
    const coffeeAmount = 4_000_000;
    const receiverAccountId = "9795e6ad2fa41579cec66bbc13f7d78867af93364d4e335490089b74d1ce0c9b";
    const requestTransferArg = {
      to: receiverAccountId,
      amount: coffeeAmount,
    };
    
    const transfer = await window.ic?.plug?.requestTransfer(requestTransferArg);
    const transferStatus = transfer?.transactions?.transactions[0]?.status;
    console.log("\x1b[36m%s\x1b[0m", "transfer", transfer);
    console.log("\x1b[36m%s\x1b[0m", "transferStatus", transferStatus);
  };

  const handleInc = async () => {
    // use our actors getSwapInfo method
    await helloActor.inc();
  };

  const handleSet = async () => {
    // use our actors getSwapInfo method
    await helloActor.set(10);
  };

  const handleGet = async () => {
    // use our actors getSwapInfo method
    const counter = await helloActor.get();
    console.log("\x1b[36m%s\x1b[0m", "counter", counter);
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

      <UnorderedList>
        <ListItem>
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
        </ListItem>
        <ListItem>
          <Button
            onClick={handleGet}
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
              Handle get
            </Text>
          </Button>
        </ListItem>
        <ListItem>
          <Button
            onClick={handleInc}
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
              Handle inc
            </Text>
          </Button>
        </ListItem>
        <ListItem>
          <Button
            onClick={handleSet}
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
              Handle set 10
            </Text>
          </Button>
        </ListItem>
        <ListItem>
          <Button
            onClick={handleSendICP}
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
              Tra tien massage
            </Text>
          </Button>
        </ListItem>
      </UnorderedList>
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
