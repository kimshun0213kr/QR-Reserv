"use client";

import { Center, Text, VStack } from "@chakra-ui/react";
import {QRCodeCanvas} from "qrcode.react"
import {FC, Suspense, useEffect, useState} from "react"
import { useSearchParams } from "next/navigation";

interface QRCodeProps {
    reserveName: string;
}

const QRCode: FC<QRCodeProps> = (props) => {
    return (
        <QRCodeCanvas
            value={props.reserveName}
            size={256}
            bgColor="#FFFFFF"
            fgColor="#1E1E1E"
            level="L"
        />
    )
}

const ViewQR = () => {
    const [reserveName,setReserveName] = useState<string>()
    const searchParams = useSearchParams()
    useEffect(() => {
        setReserveName(searchParams.get("reserveID")?String(searchParams.get("reserveID")):"")
    },[searchParams])
    return (
        <>
        <Center>
            <VStack>
                <Text fontSize={"xl"} fontWeight={"bold"}>物販会場にてスタッフにこのQRコードをお見せください。</Text>
                {reserveName != "" ? 
                <QRCode reserveName={reserveName!}></QRCode>
                :
                <Text fontSize={"xl"}>クエリが不正です。</Text>
                }
            </VStack>
        </Center>
        </>
    )
}

export default function main() {
    return (
        <>
            <Suspense>
                <ViewQR />
            </Suspense>
        </>
    )
}