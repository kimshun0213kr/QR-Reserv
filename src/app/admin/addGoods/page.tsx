"use client";
import {
  Container,
  FormLabel,
  FormControl,
  Heading,
  Image,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  useToast,
  Button,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react"; //カルーセル用のタグをインポート
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation"; // スタイルをインポート
import "swiper/css/pagination"; // スタイルをインポート
import { useRouter } from "next/navigation";
import axios from "axios";
import { supabase } from "@/utils/supabase/supabase";
const crypto = require("crypto")

const Home: NextPage = () => {
  const toast = useToast();
  const router = useRouter();
  const [goodsName,setGoodsName] = useState<string>()
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [value, setValue] = useState<number>();
  const [maxPiece, setMaxPiece] = useState<number>(1);
  const [memo,setMemo] = useState<string>()
  const [images, setImages] = useState<Blob[]>([]);
  const toastIdRef:any = useRef()
  let http = "http"
  if(process.env.NODE_ENV == "production"){
	http = "https"
  }
  const listAllImage = async () => {
    const tempUrlList: string[] = [];
    const { data, error } = await supabase.storage
      .from("dengeki-receipt")
      .list("img", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (error) {
      
      return;
    }

    for (let index = 0; index < data.length; index++) {
      if (data[index].name != ".emptyFolderPlaceholder") {
        tempUrlList.push(data[index].name);
      }
    }
  };

  useEffect(() => {
    (async () => {
      await listAllImage();
    })();
  }, []);

  const [file, setFile] = useState<File>();
  const handleChangeFile = (e: any) => {
    if (e.target.files.length !== 0) {
      setFile(e.target.files[0]);
    }
    if (!e.target.files) return;
    setImages([...e.target.files]);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    let filename:string = ""
    if(file){
      filename = (crypto.randomBytes(16).toString("base64").substring(0,16)+"-"+String(new Date().getFullYear()+new Date().getMonth()+new Date().getDate()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds()+new Date().getMilliseconds())+"."+file.name.split(".").pop()!).replaceAll("/","")
    }
    console.log(filename)
    e.preventDefault();
    toastIdRef.current = toast({
      title: "アップロード中",
      status: "loading",
      duration: 15000,
      isClosable: true,
    });

    axios.post("/api/createGoods",{
          goodsName,
          startDate,
          endDate,
          maxPiece,
          value,
          filename,
          memo
        }).then(async () => {
          if(file != undefined){
            if (file.type.match("image.*")) {
                const inputFileName = `goods/${filename}`;
                const { error } = await supabase.storage
                  .from("goodsImage")
                  .upload(inputFileName, file!!);
                if (error) {
                  toast({
                    title: "画像アップロードエラー",
                    description:error.message,
                    duration:5000,
                    isClosable:true,
                    status:"error"
                  })
                  return;
                }
                setFile(undefined);
                await listAllImage();
              } else {
                if(toastIdRef.current){
                  toast.close(toastIdRef.current)
                }
                toast({
                  title: "画像形式エラー",
                  description: "画像ファイル以外はアップロードできません。",
                  status: "error",
                  duration: 2500,
                  isClosable: true,
                });
              }
            }
          toast.closeAll()
          toast({
            title:"完了",
            description:"アップロードが完了しました。",
            status:"success",
            duration:3000,
            isClosable:true
          })
          router.push("")
        }).catch(() => {
          if(toastIdRef.current){
            toast.close(toastIdRef.current)
          }
          toast({
            title: "db post error",
            status: "error",
            duration: 2500,
            isClosable: true,
          });
        })
  };
    return (
    <Container pt="10">
        <Heading>販売商品追加フォーム</Heading>
        <form onSubmit={onSubmit} encType="multipart/form-data">
        <FormControl>
            <FormLabel>商品名</FormLabel>
            <Input onChange={(e) => setGoodsName(e.target.value)} />
        </FormControl>
        <FormControl>
            <FormLabel>販売開始日時</FormLabel>
            <Input type="datetime-local" onChange={(e) => setStartDate(e.target.value)} />
        </FormControl>
        <FormControl>
            <FormLabel>販売終了日時(指定分の59秒まで予約可能)</FormLabel>
            <Input type="datetime-local" onChange={(e) => setEndDate(e.target.value)} />
        </FormControl>
        <FormControl>
            <FormLabel>金額</FormLabel>
            <NumberInput min={1} onChange={(e) => setValue(Number(e))}>
            <NumberInputField />
            <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
            </NumberInputStepper>
            </NumberInput>
        </FormControl>
        <FormControl>
            <FormLabel>最大購入可能個数</FormLabel>
            <NumberInput min={1} defaultValue={1} onChange={(e) => setMaxPiece(Number(e))}>
            <NumberInputField />
            <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
            </NumberInputStepper>
            </NumberInput>
        </FormControl>
        <FormControl>
            <FormLabel>紹介文</FormLabel>
            <Textarea onChange={(e) => setMemo(e.target.value)} resize={"none"} />
        </FormControl>
        <FormControl>
            <FormLabel htmlFor="postImages">商品画像</FormLabel>
            <Input
            type="file"
            id="formFile"
            accept="image/*"
            onChange={(e) => {
                handleChangeFile(e);
            }}
            />
        </FormControl>
        {value != 0 &&
        startDate != undefined &&
        endDate != undefined ? (
            <Input
            type="submit"
            value="商品追加"
            margin="10px auto"
            variant="filled"
            />
        ) : null}
        </form>
        <Container>
        <p>商品名 : {goodsName}</p>
        <p>金額 : ¥{value}</p>
        <p>最大購入可能個数 : {maxPiece}</p>
        <p>販売開始日時 : {startDate}</p>
        <p>販売終了日時 : {endDate}</p>
        <p>紹介文 : {memo}</p>
        <Swiper
            slidesPerView={1} //一度に表示するスライドの数
            modules={[Navigation, Pagination]}
            pagination={{
            clickable: true,
            }}
            navigation
            loop={true}
        >
            {images.map((image, i) => (
            <SwiperSlide key={i}>
              <Image src={URL.createObjectURL(images[0])} w={"80%"} h={"auto"} />
            </SwiperSlide>
            ))}
        </Swiper>
        </Container>
    </Container>
    );
  }
export default Home;
