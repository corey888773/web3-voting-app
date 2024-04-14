import { ethers } from "ethers";
import { connectDatabase } from "@/lib/connectDatabase";
import User from "@/models/user";
import crypto from "crypto";

connectDatabase();

export async function POST(req : Request) {
    try {
        const { publicAddress } = await req.json();
        const user = await User.findOne({ publicAddress });

        if (!user) {
            console.log("User not found");
        }

        const nonce = crypto.randomBytes(32).toString("hex");
        return new Response(JSON.stringify({ nonce }), {
            status: 200,
            statusText: "OK",
        });
   } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ 'error': error}), {
            status: 500,
            statusText: "Internal Server Error",
        });
    }
}