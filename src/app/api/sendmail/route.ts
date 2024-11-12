import { HtmlContext } from "next/dist/server/future/route-modules/app-page/vendored/contexts/entrypoints";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { useState } from "react";

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

export async function POST(req: NextRequest) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: process.env.GMAILUSER,
            pass: process.env.GMAILPASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const res = await req.json()
    let buyContent = ""
    let totalPrice = 0
    for(let i=1;i < res.data.length;i++){
        buyContent += "<tr><th><h2 style=\"margin: 0;\">" +res.data[i][0] + "</h2></th><td><h2 style=\"margin: 0;\">" +  (res.data[i][1]) + "個</h2></td><td><h2 style=\"margin: 0;\">"+res.data[i][2]+"円</h2></td></tr>"
        totalPrice += res.data[i][2]
    }
    const hashID = await createHash(res.name)
    const toHostMailData = {
        from: process.env.GMAILUSER,
        to: res.email, // 送信先
        subject: `【劇団カラクリ】予約完了メール`,
        html: `
            <p>${res.name} 様 </p>
            <p>グッズの予約ありがとうございます。<br>
            予約商品は以下の通りです。</p>
            <table style=\"margin: 0;\">
                <thead>
                    <th><h4 style=\"margin: 0;\">商品名</h4></th>
                    <th><h4 style=\"margin: 0;\">個数</h4></th>
                    <th><h4 style=\"margin: 0;\">合計</h4></th>
                </thead>
                <tbody>
                    ${buyContent}
                </tbody>
            </table>
            <h2>合計 ${totalPrice}円</h2>
            <p>商品の代金は、公演当日の物販ブースにてお支払いください。</p>
            <p>なお、受け取り時に以下のリンクからQRコードの提示をお願いします。<br>
            <a href="https://karakuri-reserve.vercel.app/view?reserveID=${hashID}">QRコードを表示</a>
            </p>
        `,
    };

    const result = transporter.sendMail(toHostMailData, function (err, info) {
        if (err) {
            console.error(err)
        } else {
            console.log(info)
        }
    })
    return NextResponse.json({
        result
    })
}
