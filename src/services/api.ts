import dotenv from "dotenv";
import type { CheckDomainAvailabilityError } from "../index.js";

dotenv.config();

export async function checkADomain<T>(
    domain: string,
    method: 'GET' | 'POST',
    checkType: 'FAST' | 'FULL',
    forTransfer: boolean
): Promise<T | CheckDomainAvailabilityError> {
    try {
        const apiKey = process.env.GODADDY_API_KEY;
        const secretKey = process.env.GODADDY_API_SECRET;
        if (!apiKey || !secretKey) {
            return {
                "code": "UNABLE_TO_AUTHENTICATE",
                "message": "GoDaddy API credentials are not set in env variables."
            };
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
        if (response.status === 200) {
            return (await response.json()) as T;
        } else {
            return (await response.json()) as CheckDomainAvailabilityError;
        }

    } catch (error) {
        return {
            "code": "UNABLE_TO_CONNECT",
            "message": (error as Error).message
        };
    }
}