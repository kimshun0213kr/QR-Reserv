import { Center, HStack, Box, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default function home() {
    return (
        <Center>
            <VStack>
                <Box><Link href="/admin/addGoods" color="blue.500">販売商品追加はここから</Link></Box>
                <Box><Link href="/admin/changeGoods" color="blue.500">商品情報変更はここから</Link></Box>
                <Box><Link href="/admin/check" color="blue.500">受け取り受付はここから</Link></Box>
            </VStack> 
        </Center>
    )
}