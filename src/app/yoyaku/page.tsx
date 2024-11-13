"use client"

import { Box, Button, Center, Checkbox, FormControl, FormHelperText, FormLabel, Heading, HStack, Input, ListItem, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Radio, RadioGroup, Select, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, UnorderedList, useToast, VStack } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
const crypto = require("crypto")

const hash32key = String(process.env.NEXT_PUBLIC_hash32);
const hashIV = String(process.env.NEXT_PUBLIC_hashIV);

const createHash = async (original: string): Promise<string> => {
    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        Buffer.from(hash32key, 'hex'),
        Buffer.from(hashIV, 'hex')
    );

    const encrypted = Buffer.concat([
        cipher.update(original, 'utf8'),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([encrypted, tag]).toString('base64');
};

export default function main(){
    const toast = useToast()
    const toastId = useRef()
    const router = useRouter()
    const [goods,setGoods] = useState<[]>()
    const [reserveGoodsList,setReserveGoodsList] = useState<[string, number, number][]>([["",0,0]])
    const [reserveGoodsId,setReserveGoodsId] = useState<number[]>([])
    const [userName,setUserName] = useState("")
    const [userMail,setUserMail] = useState("")
    const [isFuncFinished,setIsFuncFinished] = useState(true)
    const [allAmount,setAllAmount] = useState(0)
    useEffect(() => {
        axios.get("/api/getGoods").then((res) => {
            setGoods(res.data)
        })
    },[])

    function setReserve(id:number,goodsName:string,goodsAmount:number,goodsPiece:number){
        
        if((0 < goodsAmount && goodsAmount < 4)){
            setReserveGoodsList([...reserveGoodsList,[goodsName,goodsAmount,goodsPiece*goodsAmount]])
            setReserveGoodsId([...reserveGoodsId,id])
            let tmpAmount = allAmount;
            let tmpIndexAmount = goodsPiece*goodsAmount;
            setAllAmount(tmpAmount+tmpIndexAmount);
            
            
            
        } else {
            toast({
                title:"個数選択エラー",
                description:"個数を選択してください。",
                status:"error",
                isClosable:true
            })
        }  
    }
    function delReserve(id:number,goodsName:string,goodsAmount:number) {
        const deleteElement = reserveGoodsList.find((e) => e[0] == goodsName)!
        setAllAmount(allAmount-deleteElement[2])
        setReserveGoodsList(reserveGoodsList.filter((listIndex,index) => (listIndex[0] != goodsName)))
        setReserveGoodsId(reserveGoodsId.filter((goodsId,index) => goodsId != id))

    }

    async function sendReserve() {
        setIsFuncFinished(false)
        toast({
            title:"予約中",
            description:"予約操作を受け付け中です。",
            status:"loading",
            isClosable:true,
            duration:100000
        })
        axios.post("/api/sendmail",{
            data:reserveGoodsList,
            name:await createHash(userName),
            email:await createHash(userMail)
        }).then(() => {
            axios.post("/api/setReserve",{
                name:userName,
                data:reserveGoodsList
            }).then(() => {
                toast.closeAll()
                toast({
                    title:"予約完了",
                    description:"予約が完了しました。",
                    status:"success",
                    duration:3000,
                    isClosable:true
                })
                setIsFuncFinished(true)
                router.push("/")
            })
        })
    }

    let fillForm:boolean = reserveGoodsList.length != 0 && userName != "" && userMail != ""

    return(
        <>
        <Center>
            <VStack>
                <Heading>商品予約ページ</Heading>
                <Text>現在予約受付を行っている商品は以下の通りです。</Text>
            </VStack>
        </Center>
        <TableContainer margin={"auto"}>
            <Table variant={"simple"}>
                <Thead>
                    <Tr>
                        <Th w={"10%"}></Th>
                        <Th w={"50%"}>グッズ名</Th>
                        <Th w={"20%"}>予約販売価格</Th>
                        <Th w={"20%"}>購入個数</Th>
                    </Tr>
                </Thead>
                {goods ? 
                <Tbody fontWeight={"bold"}>
                    {(
                        function(){
                            const list = []
                            let piece = 1
                            for(let i=0;i<goods.length;i++){
                                list.push(
                                <Tr key={goods[i][0]}>
                                    <Td>
                                        <Button 
                                        h={"35px"} 
                                        onClick={() => {
                                            !reserveGoodsId.includes(i) ?
                                                setReserve(i,goods[i][1],piece,goods[i][2])
                                                :
                                                delReserve(i,goods[i][1],goods[i][2])
                                            }
                                        } 
                                        color={"white"} 
                                        bgColor={!reserveGoodsId.includes(i)
                                            ? "blue.500" 
                                            : "red.500"
                                        }>
                                            {!reserveGoodsId.includes(i) 
                                                ?"カートに入れる" 
                                                : "カートから削除"
                                            }
                                        </Button>
                                    </Td>
                                    <Td>
                                        {goods[i][1]}
                                    </Td>
                                    <Td>
                                        {goods[i][2]}円
                                    </Td>
                                    <Td>
                                    <NumberInput onChange={(e) => {piece=Number(e)}} defaultValue={1} min={1} max={goods[i][3]}>
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    </Td>
                                </Tr>)
                            }
                            return list
                        }()
                    )}
                </Tbody>
                : null }
            </Table>
        </TableContainer>
        {goods ? 
        <Center marginTop={"10px"}>
            <Box w="80%" fontSize={"xl"} borderRadius={"xl"} border={"2px dotted pink"} minHeight={"80px"} >
                <Center w="100%">
                    <VStack w="100%">
                        <Text fontWeight={"bold"}>予約カート内の商品</Text>
                        {reserveGoodsList.length > 1 ? 
                        <VStack w="100%">
                            <UnorderedList w="80%">
                            {(
                                function(){
                                    const list = []
                                    for(let i=2;i<=reserveGoodsList.length;i++){
                                        list.push(<ListItem key={i}>{reserveGoodsList[i-1][0]} {String(reserveGoodsList[i-1][1])}個</ListItem>)
                                        // setAllAmount(amount[i]*goods[i].amount)
                                    }
                                    return list
                                }()
                            )}
                            </UnorderedList>
                            <Box w="100%" textAlign={"right"}>
                                <Text marginRight={"10px"}>合計金額 {allAmount}円</Text>
                                <Text marginRight={"10px"} fontSize={"sm"} color="red">旭祭当日の物販スペースにてお支払いをお願いします。<br />現金でのみ承っております。ご了承ください。</Text>
                            </Box>
                            <Box w="75%">
                                <FormControl isRequired>
                                    <FormLabel>呼び出し名</FormLabel>
                                    <Input onChange={(e) => setUserName(e.target.value)} />
                                    <FormHelperText>本名でなくても構いません。</FormHelperText>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>メールアドレス</FormLabel>
                                    <Input onChange={(e) => setUserMail(e.target.value)} />
                                    <FormHelperText>予約確認メールの送信にのみ使用し、収集しません。</FormHelperText>
                                </FormControl>
                                <Button marginBottom={"5px"}
                                    onClick={() => {fillForm && isFuncFinished ?
                                        sendReserve()
                                        :
                                        toast({
                                            title:"予約エラー",
                                            description:"フォームを全て入力してください。",
                                            status:"error"
                                        })
                                    }}
                                    bgColor={fillForm && isFuncFinished ? "blue.500":"gray"}
                                >予約する</Button>
                            </Box>
                        </VStack>
                        : 
                        <Text>現在カートに商品はありません。</Text>
                        }
                    </VStack>
                </Center>
            </Box>
        </Center>
        :
        null }
        </>
    )
}