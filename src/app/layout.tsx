import type { Metadata } from "next";
import "./globals.css";
import { AbsoluteCenter, Box, Center, ChakraProvider, Link, Text, VStack } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "予約システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="jp">
      <ChakraProvider>
        <body>
            <Link href="/" w="100%">
              <Box bgGradient='linear(to-tl, gray.900, gray.400)'  top={"0px"} position={"sticky"} zIndex={100}>
                <Center>
                  <Text color="white" fontSize="xl" fontWeight={"extrabold"}>事前予約システム</Text>
                </Center>
              </Box>
            </Link>
            {children}
            <Box bgColor={"gray.100"} textAlign={"center"}marginTop={"10px"} height={"120px"} position={"relative"}>
              <Center>
                <AbsoluteCenter>
                  <VStack>
                    <Link href="https://x.com/tdu1000ju_pd">劇団カラクリ X(旧twitter) : @tdu1000ju_pd はここをクリック！</Link>
                    <Link href="https://www.instagram.com/karakuri_tdu/">劇団カラクリ Instagram @karakuri_tduはここをクリック！</Link>
                    <Link href="/admin" fontSize={"sm"}>管理者用ページ</Link>
                    <Text fontSize="xs">©ベレト工務店</Text>
                  </VStack>
                </AbsoluteCenter>
              </Center>
            </Box>
        </body>
      </ChakraProvider>
    </html>
  );
}
