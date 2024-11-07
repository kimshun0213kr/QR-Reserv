"use client"

import {useState, useEffect, useRef} from 'react'
import jsQR from 'jsqr'
import axios from 'axios'
import { useToast, Heading, VisuallyHidden, Button, VStack, Text, Center,   Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure, } from '@chakra-ui/react'

const crypto = require("crypto")

const hash32key = String(process.env.NEXT_PUBLIC_hash32);
const hashIV = String(process.env.NEXT_PUBLIC_hashIV);

const returnHash = async (string: string): Promise<string> => {
    const data = Buffer.from(string, 'base64');
    const encrypted = data.slice(0, -16);
    const tag = data.slice(-16);

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(hash32key, "hex"),
        Buffer.from(hashIV, "hex")
    );

    decipher.setAuthTag(tag);

    const deEncrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]);

    return deEncrypted.toString("utf-8");
};

export default function Qr_Camera(){
    const {isOpen,onOpen,onClose} = useDisclosure()
    const toast = useToast()
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [qrData,setQrData] = useState("")

    const [contentWidth, setContentWidth] = useState(500)
    const [contentHeight, setContentHeight] = useState(500)
    const [reserveGoods,setReserveGoods] = useState("")
    const [reserveAmount,setReserveAmount] = useState<number>()
    const [userIsAlreadyBuy,setUserIsAlreadyBuy] = useState(false)

    const QRRead = async (data:string) => {
        const userName = await returnHash(data)
        setQrData(userName)
        // setQrData("plr34DsdFbbe9aPGxQajqABU9qAxDkb2ScYCP3qBkQ==")
    }

    const getReservData = (name:string) => {
        console.log(name)
        toast({
            title:"情報取得中",
            description:"情報を取得中です...",
            status:"loading",
            duration:5000,
            isClosable:true
        })
        axios.post("/api/getReserveData",
            {
                name:name
            }
        ).then((reservedata) => {
            const reserveData = reservedata.data
            console.log(reservedata.data)
            if(!reserveData.isAlreadyBuy){
                console.log(reserveData.allamount)
                let tmp = ""
                for(let i=0;i<reserveData.reservegoods.length;i++){
                    console.log(reserveData.reservegoods[i])
                    tmp += " , "+reserveData.reservegoods[i]
                }
                setReserveGoods(tmp.slice(2,))
                setReserveAmount(reserveData.allamount)
            }
            setUserIsAlreadyBuy(reserveData.isAlreadyBuy)
        }).catch((error) => {
            console.error(error)
        })
    }

    const setAlreadyBuy = (name:string) => {
        console.log(name)
        toast({
            title:"変更中",
            description:"購入済みに変更中です...",
            status:"loading",
            duration:5000,
            isClosable:true
        })
        axios.post("/api/setAlreadyBuy",
            {
                name:name
            }
        ).then(() => {
            toast({
                title:"変更完了",
                description:"購入済みに変更しました",
                status:"success",
                duration:5000,
                isClosable:true
            })
        }).catch((error) => {
            console.error(error)
        })
    }

    useEffect(() => {
        const config = { audio:false, video: { facingMode: "environment" }}
        const ctx = canvasRef.current?.getContext('2d')
        const canvasUpdate = () => {
            if (ctx && videoRef.current && canvasRef.current) {
                canvasRef.current.width = contentWidth
                canvasRef.current.height = contentHeight
                ctx.drawImage(videoRef.current, 0, 0, contentWidth, contentHeight)
                requestAnimationFrame(canvasUpdate)
            }
        }
        const checkImage = async() => {
            if(ctx && videoRef.current){
                ctx?.drawImage(videoRef.current, 0, 0, contentWidth, contentHeight)
                const imageData = ctx.getImageData(0, 0, contentWidth, contentHeight)
                if (imageData) {
                    const code = jsQR(imageData.data, contentWidth, contentHeight)
                    if (code) {
                        console.log("read!")
                        QRRead(code.data)
                    }
                }
                setTimeout(()=>{ checkImage() }, 200);
            }
        }
    
        navigator.mediaDevices.getUserMedia(config)
        .then(stream => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current){
                        videoRef.current.play()
                        setContentWidth(videoRef.current.clientWidth)
                        setContentHeight(videoRef.current.clientHeight)
                        canvasUpdate()
                        checkImage()
                    }
                }
            }
        })
        .catch(err => {
            console.log(err)
        })
    },[contentWidth, contentHeight])

    return(
        <>
        <Center>
            <VStack>
                <video ref={videoRef} autoPlay playsInline width={contentWidth} height={contentHeight} />
                <VisuallyHidden>
                    <canvas ref={canvasRef}></canvas>
                </VisuallyHidden>
                <Heading>{qrData} {qrData ? "様" : null}</Heading>
                {qrData ? 
                <>
                    <VStack>
                        <Button onClick={() => getReservData(qrData)}>購入品表示</Button>
                        {userIsAlreadyBuy ? 
                        <>
                            <Text color="red" fontWeight={"extrabold"} fontSize={"2xl"}>
                                購入済みです。
                            </Text>
                        </>
                        : 
                        <>
                            {reserveGoods != undefined && reserveAmount != undefined ? 
                            <>
                            <Text fontWeight={"extrabold"} fontSize={"xl"}>{reserveGoods}</Text>
                            <Text fontWeight={"extrabold"} fontSize={"xl"}>{reserveAmount}円</Text>
                            <Button onClick={onOpen}>購入済みに変更する</Button>
                            <Modal isOpen={isOpen} onClose={onClose}>
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>購入済みに変更しますか？</ModalHeader>
                                    <ModalFooter>
                                        <Button onClick={onClose} bgColor={"red"} margin={2} color="white" fontWeight={"extrabold"}>キャンセル</Button>
                                        <Button onClick={() => {onClose();setAlreadyBuy(qrData)}} bgColor={"blue"} margin={2} color="white" fontWeight={"extrabold"}>変更</Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                            </>
                            : null
                            }
                        </>
                        }
                    </VStack>
                </>
                : null}
                </VStack>
            </Center>
        </>
    )
}
