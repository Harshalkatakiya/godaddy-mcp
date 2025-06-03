import { apiKey, apiURL, secretKey } from "../services/api";

export const envValidaiton = () => {
    if (!apiURL) {
        return {
            code: "UNABLE_TO_AUTHENTICATE",
            message: "GoDaddy API BASE URL is not set in env variables."
        };
    }
    if (!apiKey || !secretKey) {
        return {
            code: "UNABLE_TO_AUTHENTICATE",
            message: "GoDaddy API credentials are not set in env variables."
        };
    }
}

export default envValidaiton;