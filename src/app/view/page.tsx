"use client";

import { Center, Text, VStack } from "@chakra-ui/react";
import {QRCodeCanvas} from "qrcode.react"
import {FC, useEffect, useState} from "react"
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
            fgColor="#1e1e1e"
            level="L"
        />
    )
}

export default function ViewQR() {
    const searchParams = useSearchParams()
    const [reserveName,setReserveName] = useState("")
    useEffect(() => {
        setReserveName(String(searchParams.get("reserveID")))
    })
    return (
        <>
        <Center>
            <VStack>
                <Text fontSize={"xl"} fontWeight={"bold"}>物販会場にてスタッフにこのQRコードをお見せください。</Text>
                {}
                <QRCode reserveName={reserveName!}></QRCode>
            </VStack>
        </Center>
        </>
    )
}