import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Text,
  IconButton,
  useBreakpointValue,
  Link,
} from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { FiHelpCircle, FiMenu, FiSearch, FiSettings } from "react-icons/fi";

export const Header = () => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Slash Everything</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box as="nav" bg="bg-surface" boxShadow="sm" width="full">
        <Box py={{ base: "3", lg: "4" }} px="2" width="full">
          <Flex justify="space-between">
            <HStack spacing="4" onClick={() => router.push("/")}>
              <Text
                fontSize="xl"
                fontWeight="extrabold"
                ml="2"
                color="blue.400"
                fontStyle="italic"
              >
                Slash Everything
              </Text>
            </HStack>
            {isDesktop ? (
              <HStack spacing="4">
                {/* <ButtonGroup variant="ghost" spacing="1">
                  <IconButton
                    icon={<FiHelpCircle fontSize="1.25rem" />}
                    aria-label="Help Center"
                  />
                </ButtonGroup> */}
                <Avatar
                  boxSize="10"
                  name="Christoph Winston"
                  src="https://tinyurl.com/yhkm2ek8"
                />
              </HStack>
            ) : (
              <IconButton
                variant="ghost"
                icon={<FiMenu fontSize="1.25rem" />}
                aria-label="Open Menu"
              />
            )}
          </Flex>
        </Box>
      </Box>
    </>
  );
};
