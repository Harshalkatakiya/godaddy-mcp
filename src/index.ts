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
  },
  async ({ domain }) => {
    const response = await checkADomain<DomainAvailability>(
      domain,
      "GET",
      "FAST",
      false
    );
    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: `Could not fetch domain availability. Please try again.`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: `Domain: ${response.domain}`,
        } as const,
        {
          type: "text",
          text: `Available: ${response.available ? "✅ Yes" : "❌ No"}`,
        } as const,
        ...(response.available
          ? [
            {
              type: "text",
              text: `Price: ${response.price ? response.price / 1000000 : "N/A"} ${response.currency ?? ""}`,
            } as const,
          ]
          : []),
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