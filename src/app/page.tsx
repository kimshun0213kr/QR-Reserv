import { Box, Center, Heading, Image, Link, VStack } from "@chakra-ui/react";

export default function Home() {
  return (
    <>
    <Center>
      <VStack>
        <Image w="60%" src="/icons/karakuri.jpeg" />
        <Heading>
          現在予約受付中の商品の予約は以下のリンクから！
        </Heading>
        <Link fontSize={"2xl"} color="blue.500" href="/yoyaku">予約はこちらから！</Link>
      </VStack>
    </Center>
    </>
  );
}
