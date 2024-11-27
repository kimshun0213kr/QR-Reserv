"use client"

import { 
    Box, 
    Button, 
    Center,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    Input,
    ListItem,
    Spinner,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Table, 
    TableContainer, 
    Tbody, 
    Td, 
    Text, 
    Th, 
    Thead, 
    Tr, 
    UnorderedList, 
    useToast, 
    VStack,
    HStack,
    } from "@chakra-ui/react";
import axios from "axios";
import  {GoodsComponent}  from "@/component/goods";
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
    const router = useRouter()
    const [goods,setGoods] = useState<[]>()
    const [reserveGoodsList,setReserveGoodsList] = useState<[string, number, number][]>([["",0,0]])
    const [reserveGoodsId,setReserveGoodsId] = useState<number[]>([])
    const [userName,setUserName] = useState("")
    const [userMail,setUserMail] = useState("")
    const [isFuncFinished,setIsFuncFinished] = useState(true)
    const [allAmount,setAllAmount] = useState(0)
    const [isAccepting,setIsAccepting] = useState(true)
    const [isLoading,setIsLoading] = useState(true)
    useEffect(() => {
        axios.get("/api/getGoods").then((res) => {
            setGoods(res.data)
            setIsAccepting(res.data != null)
            setIsLoading(false)
        })
    },[])

    function setReserve(id:number,goodsName:string,goodsAmount:number,goodsPiece:number){
        if((0 < goodsAmount)){
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
        const reserveID = await createHash(crypto.randomBytes(16).toString("base64").substring(0,16)+"-"+String(new Date().getFullYear()+new Date().getMonth()+new Date().getDate()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds()+new Date().getMilliseconds()))
        console.log(reserveID)
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
            email:await createHash(userMail),
            id:reserveID.replaceAll("+","")
        }).then(() => {
            axios.post("/api/setReserve",{
                reserveID:reserveID.replaceAll("+",""),
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
            }).catch((err) => {
                console.error(err)
                toast.closeAll()
                setIsFuncFinished(true)
            })
        }).catch((err) => {
            console.error(err)
            toast.closeAll()
            setIsFuncFinished(true)
        })
    }

    let fillForm:boolean = reserveGoodsList.length != 0 && userName != "" && userMail != ""

    return(
        <>
            <Center>
                <VStack>
                    <Heading>商品予約ページ</Heading>
                    {!isLoading ? 
                    <Text fontSize={"2xl"} color={isAccepting ? "black" : "red"} fontWeight={"bold"}>{isAccepting ? "現在予約受付を行っている商品は以下の通りです。":"現在受付を行っている商品はありません。"}</Text>
                    : null}
                </VStack>
            </Center>
            {!isLoading ? 
                <>
                {isAccepting ?
                    <> 
                        <TableContainer marginTop="10px">
                            <Table variant={"simple"} minWidth={"950px"}>
                                <Thead>
                                    <Tr>
                                        <Th w={"10%"}></Th>
                                        <Th w={"45%"}>グッズ名</Th>
                                        <Th w={"15%"}>予約期限</Th>
                                        <Th w={"15%"}>予約販売価格</Th>
                                        <Th w={"15%"}>購入個数</Th>
                                    </Tr>
                                </Thead>
                                {goods ? 
                                <Tbody fontWeight={"bold"}>
                                    {(
                                        function(){
                                            const list = []
                                            let piece = 1
                                            for(let i=0;i<goods.length;i++){
                                                const limit = new Date(new Date(goods[i][6]).setHours(new Date(goods[i][6]).getHours()-9))
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
                                                        {goods[i][1]} <GoodsComponent name={goods[i][1]} description={goods[i][5]} image={goods[i][4]} />
                                                    </Td>
                                                    <Td>
                                                        {String(limit.getFullYear()+"/"+(limit.getMonth()+1)+"/"+limit.getDate()+" "+limit.getHours()+":"+limit.getMinutes())}
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
                        <>
                        {goods ? 
                            <Center marginTop={"10px"} w="100%">
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
                                                    <Text marginRight={"10px"} fontSize={"sm"} color="red">物販スペースにてお支払いをお願いします。<br />現金でのみ承っております。ご了承ください。</Text>
                                                </Box>
                                                <Box w="75%">
                                                    <FormControl isRequired>
                                                        <FormLabel>呼び出し名</FormLabel>
                                                        <Input onChange={(e) => setUserName(e.target.value)} />
                                                        <FormHelperText>本名でなくても構いません。</FormHelperText>
                                                    </FormControl>
                                                    <FormControl isRequired>
                                                        <FormLabel>メールアドレス</FormLabel>
                                                        <Input onChange={(e) => setUserMail(e.target.value)} type="email" />
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
                    </>
                :
                    null}
                </>
            :
                <>
                    <HStack><Spinner /><Text fontSize={"2xl"}>データ取得中…</Text></HStack>
                </>
            }
        </>
    )
}