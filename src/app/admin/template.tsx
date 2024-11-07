"use client"

import React, { useEffect, useRef, useState } from "react"
import { Box, Button, Center, FormControl, FormHelperText, FormLabel, Heading, HStack, Input, Link,Text, useToast, VStack } from "@chakra-ui/react";
import { loginFunc } from "@/component/login";
const crypto = require("crypto")


const hash32key = String(process.env.NEXT_PUBLIC_hash32);
const hashIV = String(process.env.NEXT_PUBLIC_hashIV);

const encryptSha256 = (str: string) => {
    const hash = crypto.createHash("sha256");
    hash.update(str);
    return hash.digest().toString("base64");
};

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

export default function Template({ children }: { children: React.ReactNode }) {
    const toastIdRef = useRef()
    const toast = useToast()
    const [id,setId] = useState("")
    const [pass,setPass] = useState("")
    const [isLogin , setIsLogin] = useState(false)
    const appID = process.env.NEXT_PUBLIC_ID
    const appPASS = process.env.NEXT_PUBLIC_PASS
    useEffect(()=> {
        const token = localStorage.getItem("token")
        const limit = new Date(new Date().setDate(new Date().getDate()-3))
        if(token != undefined){
            const toNormal = async() => {
                return await returnHash(token)
            }
            toNormal().then((normalToken) => {
                const tokenArray = normalToken.split("@")
                if(tokenArray[0] == appID && tokenArray[1] == appPASS && new Date(tokenArray[2]) >= limit){
                    setIsLogin(true)
                }
            })
        }
        setIsLogin(localStorage.getItem("ID") != null && localStorage.getItem("PASS") != null && appID == localStorage.getItem("ID") && appPASS == localStorage.getItem("PASS"))
    },[])
  return (
    <>
        {isLogin ?
        <>
            <Center>
                <HStack>
                    <Box><Link href="/admin/addGoods" color="blue.500">販売商品追加</Link></Box>
                    <Box><Link href="/admin/changeGoods" color="blue.500">商品情報変更</Link></Box>
                    <Box><Link href="/admin/check" color="blue.500">受け取り受付</Link></Box>
                </HStack> 
            </Center>
            {children}
        </>
      :
      <>
        <Center>
            <VStack>
                <Heading>ログインしてください。</Heading>
                <FormControl isRequired>
                    <FormLabel>ID</FormLabel>
                    <Input onChange={(e) => setId(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>PASS</FormLabel>
                    <Input onChange={(e) => setPass(encryptSha256(e.target.value))} type="password" />
                </FormControl>
                <Button onClick={async () => {
                    toast({
                        title:"ログイン中",
                        status:"loading",
                        isClosable:true,
                        duration:3000
                    })
                    const setAuth = async() => {
                        const Auth = await loginFunc(id,pass)
                        setIsLogin(Auth)
                        return Auth
                    }
                    setAuth().then((sessionLogin) =>{
                        toast.closeAll()
                        if(sessionLogin){
                            toast({
                                title:"ログインしました。",
                                description:"ログイン日時:"+new Date(),
                                isClosable:true,
                                duration:3000,
                                status:"success"
                            })
                        } else {
                            toast({
                                title:"ログインに失敗しました。",
                                description:"ID又はパスワードを確認してください。",
                                isClosable:true,
                                duration:3000,
                                status:"error"
                            })
                        }
                    })
                    }}>ログイン</Button>
            </VStack>
        </Center>
      </> 
      }
    </>
  );
}