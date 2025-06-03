import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { checkADomain, checkMultipleDomains } from "./services/api";

const server = new McpServer({
  name: "godaddy-mcp",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

server.tool(
  "check-domain-availability",
  "Check the availability of a domain",
  {
    domain: z.string().min(2).describe("Domain to check (e.g. example.com)"),
    checkType: z.enum(["FAST", "FULL"]).default("FAST").describe("Type of check to perform (FAST for time optimization or FULL for full accuracy)"),
    forTransfer: z.boolean().default(false).describe("Include domains available for transfer. If true, checkType is ignored"),
  },
  {
    title: "Check Domain Availability",
    openWorldHint: true,
  },
  async ({ domain, checkType, forTransfer }) => {
    try {
      const response = await checkADomain(domain, "GET", checkType, forTransfer);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${(error as Error).message || "Unknown error occurred"}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "check-multiple-domains-availability",
  "Check the availability of multiple domains",
  {
    domains: z.array(z.string().min(2)).min(1).max(500).describe("List of domains to check (e.g. ['example.com', 'test.net'])"),
    checkType: z.enum(["FAST", "FULL"]).default("FAST").describe("Type of check to perform (FAST for time optimization or FULL for full accuracy)"),
  },
  {
    title: "Check Multiple Domains Availability",
    openWorldHint: true,
  },
  async ({ domains, checkType }) => {
    try {
      const response = await checkMultipleDomains(domains, checkType);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${(error as Error).message || "Unknown error occurred"}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
