import dotenv from "dotenv";

dotenv.config();

export interface DomainAvailability {
    available: boolean;
    currency?: string;
    definitive: boolean;
    domain: string;
    period?: number;
    price?: number;
}

export interface DomainAvailabilityErrorFields {
    code: string;
    message: string;
    path: string;
    pathRelated: string;
}

export interface CheckDomainAvailabilityError {
    code: string;
    fields?: DomainAvailabilityErrorFields[];
    message: string;
    retryAfterSec?: number;
}

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