import type { Metadata } from "next";
import "./globals.css";
import { AbsoluteCenter, Box, Center, ChakraProvider, Link, Text, VStack } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "劇団カラクリ予約システム",
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
          <Box w="100%" minH={"100vh"} display={"flex"}>
            <VStack w="100%">
              <Link href="/" w="100%">
                <Box bgGradient='linear(to-tl, gray.900, gray.400)'  top={"0px"} position={"sticky"} zIndex={100}>
                  <Center>
                    <Text color="white" fontSize="xl" fontWeight={"extrabold"}>劇団カラクリ予約システム</Text>
                  </Center>
                </Box>
              </Link>
              {children}
              <Center w="100%" bgColor={"gray.200"} marginTop={"auto"}>
                <Box w="90%">
                  <Center marginTop={"5px"}>
                    劇団カラクリX(旧Twitter) :<Link href="https://x.com/tdu1000ju_pd"><Text borderBottom="1px solid blue"> @tdu1000ju_pd</Text></Link>
                  </Center>
                  <Center marginTop={"5px"}>
                    劇団カラクリ Instagram :<Link href="https://www.instagram.com/karakuri_tdu/"><Text borderBottom="1px solid blue"> @karakuri_tdu</Text></Link>
                  </Center>
                  <Center marginTop={"5px"}>
                    <Link href="/admin" fontSize={"sm"}>管理者用ページ</Link>
                  </Center>
                  <Center marginTop={"5px"}>
                    <Text fontSize={"xs"} verticalAlign={"top"}>
                      © 2023-{String(new Date().getFullYear())}ベレト工務店
                    </Text>
                  </Center>
                </Box>
              </Center>
            </VStack>
          </Box>
        </body>
      </ChakraProvider>
    </html>
  );
}
