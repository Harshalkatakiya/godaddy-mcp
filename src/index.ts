import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { checkADomain } from "./services/api";

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

const server = new McpServer({
  name: "godaddy-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "check-domain-availability",
  "Check whether a domain is available for purchase or not",
  {
    domain: z.string().min(2).describe("Domain to check (e.g. example.com)"),
    checkType: z.enum(["FAST", "FULL"]).default("FAST").describe("Type of check to perform (FAST for Optimize for time or FULL for full accuracy)"),
    forTransfer: z.boolean().default(false).describe("Whether or not to include domains available for transfer. If set to True, checkType is ignored"),
  },
  async ({ domain, checkType, forTransfer }) => {
    const response = await checkADomain<DomainAvailability>(
      domain,
      "GET",
      checkType, forTransfer
    );
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main(): ", error);
  process.exit(1);
});