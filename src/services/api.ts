import dotenv from "dotenv";
import type { CheckDomainAvailabilityError, MultipleDomainAvailabilityPartialErrorFields, MultipleDomainAvailabilitySuccessFields, SingleDomainAvailabilitySuccessFields } from "../types/index";
import envValidaiton from "../utils/envValidation";

dotenv.config();

export const apiURL = process.env.GODADDY_API_BASE_URL || "https://api.godaddy.com" as "https://api.ote-godaddy.com" | "https://api.godaddy.com";
export const apiKey = process.env.GODADDY_API_KEY;
export const secretKey = process.env.GODADDY_API_SECRET;

export async function checkADomain(
    domain: string,
    method: 'GET' | 'POST',
    checkType: 'FAST' | 'FULL',
    forTransfer: boolean
): Promise<SingleDomainAvailabilitySuccessFields | CheckDomainAvailabilityError> {
    try {
        envValidaiton();
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
            return (await response.json()) as SingleDomainAvailabilitySuccessFields;
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

export async function checkMultipleDomains(
    domains: string[],
    checkType: 'FAST' | 'FULL'
): Promise<MultipleDomainAvailabilitySuccessFields | MultipleDomainAvailabilityPartialErrorFields | CheckDomainAvailabilityError> {
    try {
        envValidaiton();
        const params = new URLSearchParams({
            checkType,
        });
        const url = `${apiURL}/v1/domains/available?${params.toString()}`;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `sso-key ${apiKey}:${secretKey}`
        };
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(domains)
        });
        if (response.status === 200) {
            return (await response.json()) as MultipleDomainAvailabilitySuccessFields;
        } else if (response.status === 203) {
            return (await response.json()) as MultipleDomainAvailabilityPartialErrorFields;
        } else {
            return (await response.json()) as CheckDomainAvailabilityError;
        }
    } catch (error) {
        return {
            code: "UNABLE_TO_CONNECT",
            message: (error as Error).message
        };
    }
}