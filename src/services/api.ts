import dotenv from "dotenv";
import type { DomainAvailability } from "../index";

dotenv.config();

export async function checkADomain<T>(
    domain: string,
    method: 'GET' | 'POST',
    checkType: 'FAST' | 'FULL',
    forTransfer: boolean
): Promise<T | null> {
    try {
        const apiKey = process.env.GODADDY_API_KEY;
        const secretKey = process.env.GODADDY_API_SECRET;
        if (!apiKey || !secretKey) {
            console.error('[checkADomain] GoDaddy API credentials are not set in env variables.');
            return null;
        }
        const params = new URLSearchParams({
            domain,
            checkType,
            forTransfer: String(forTransfer),
        });
        const url = `https://api.ote-godaddy.com/v1/domains/available?${params.toString()}`;
        const response = await fetch(url, {
            method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `sso-key ${apiKey}:${secretKey}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[checkADomain] Error ${response.status}: ${errorText}`);
            return null;
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error('[checkADomain] Error making request:', error);
        return null;
    }
}