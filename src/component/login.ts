import { useToast } from "@chakra-ui/react";

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

export async function loginFunc(id:string,pass:string) {
    console.log(id,pass)
    const hashPass = await createHash(id+"@"+pass+"@"+new Date())
    console.log(hashPass)
    console.log((await returnHash(hashPass)).split("@"))
    console.log((id == process.env.NEXT_PUBLIC_ID && pass == process.env.NEXT_PUBLIC_PASS))
    if(id == process.env.NEXT_PUBLIC_ID && pass == process.env.NEXT_PUBLIC_PASS){
        localStorage.setItem("token",hashPass)
    }
    return (id == process.env.NEXT_PUBLIC_ID && pass == process.env.NEXT_PUBLIC_PASS)
}