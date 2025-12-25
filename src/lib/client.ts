import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID || process.env.NEXT_PUBLIC_CLIENT_ID || "";

if (!clientId) {
  throw new Error("No client ID provided in .env");
}

export const client = createThirdwebClient({
  clientId: clientId,
});
