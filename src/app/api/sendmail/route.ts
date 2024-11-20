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

const sendEmail = async (data: {
        from: string | undefined; to: string; subject: string; html: string;
    }) => {
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
    try {
        const mailData = await transporter.sendMail(data);
        console.log("Mail sent: ", mailData);
        return mailData;
    } catch (err) {
        console.error("Error sending email: ", err);
        throw err;
    }
}

export async function POST(req:NextRequest) {
    try {
        const res = await req.json();
        let buyContent = "";
        let totalPrice = 0;

        for (let i = 1; i < res.data.length; i++) {
            buyContent += `${res.data[i][0]} ${res.data[i][1]}個 ${res.data[i][2]}円\n`;
            totalPrice += res.data[i][2];
        }

        const hashID = await createHash(`${res.name}${new Date().getFullYear()}${new Date().getMonth()}${new Date().getDate()}${new Date().getHours()}${new Date().getMinutes()}`);
        const mailAddr = await returnHash(res.email);
        const reserverName = await returnHash(res.name);

        const toHostMailData = {
            from: process.env.GMAILUSER,
            to: mailAddr,
            subject: `【劇団カラクリ】予約完了メール`,
            html: `
                ${reserverName} 様 
                グッズの予約ありがとうございます。
                予約商品は以下の通りです。
                
                ${buyContent}
                
                合計 ${totalPrice}円
                商品の代金は、公演当日の物販ブースにてお支払いください。
                なお、受け取り時に以下のリンクからQRコードの提示をお願いします。
                QRコードを表示
            `,
        };

        await sendEmail(toHostMailData);
        return new Response(JSON.stringify({ message: "send api completed." }), { status: 200 });
    } catch (error) {
        console.error("Error in POST handler: ", error);
        return new Response(JSON.stringify({ error: "Error sending email" }), { status: 500 });
    }
}

// export async function POST(req: NextRequest) {
//     const nodemailer = require("nodemailer");
//     const mail = process.env.GMAILUSER;
//     const pass = process.env.GMAILPASSWORD;
//     const res = await req.json()
//     const tomailAddr = await returnHash(res.email)

//     const transporter = nodemailer.createTransport({
//         service: "Gmail",
//         auth: {
//             user: mail,
//             pass: pass,
//         }
//     });

//     const info = await transporter.sendMail({
//         from: mail,
//         to: mail,
//         subject: "TestMail",
//         text: "This is a test mail",
//     });
    
//     console.log("Message sent: %s", info.response);
//     console.log("finish");
//     return new Response(JSON.stringify({message:"send api completed."}))
// };

