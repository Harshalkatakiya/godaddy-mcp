import dotenv from "dotenv";

dotenv.config();

interface DomainAvailabilitySuccessFields {
    available: boolean;
    currency?: string;
    definitive: boolean;
    domain: string;
    period?: number;
    price?: number;
}

interface DomainAvailabilityErrorFields {
    code: string;
    message: string;
    path: string;
    pathRelated: string;
}

interface CheckDomainAvailabilityError {
    code: string;
    fields?: DomainAvailabilityErrorFields[];
    message: string;
    retryAfterSec?: number;
}

export async function checkADomain(
    domain: string,
    method: 'GET' | 'POST',
    checkType: 'FAST' | 'FULL',
    forTransfer: boolean
): Promise<DomainAvailabilitySuccessFields | CheckDomainAvailabilityError> {
    try {
        const apiURL = process.env.GODADDY_API_BASE_URL || "https://api.godaddy.com" as "https://api.ote-godaddy.com" | "https://api.godaddy.com";
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
        const url = `${apiURL}/v1/domains/available?${params.toString()}`;
        const response = await fetch(url, {
            method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `sso-key ${apiKey}:${secretKey}`
            }
        });
        if (response.status === 200) {
            return (await response.json()) as DomainAvailabilitySuccessFields;
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