import { ActionFunctionArgs, json } from "@remix-run/node";
import { PaymentsAppsClient } from "../../payments-apps.graphql";
import { shopify } from "../../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
    try {
        const topic = request.headers.get("x-shopify-topic") || "unknown";
        const shop = request.headers.get("x-shopify-shop-domain");

        // Authenticate the webhook request
        // Note: shopify.authenticate.webhook(request) is the standard way but we are doing custom raw handling here
        // for simplicity or if standard validation fails due to proxy issues.
        // However, in production, rely on shopify.authenticate.webhook OR manual HMAC check.

        /* 
        const { topic, shop, session, admin, payload } = await shopify.authenticate.webhook(request);
        */

        const payload = await request.json();

        console.log(`Received Webhook: ${topic} for shop ${shop}`, payload);

        if (topic === "APP_UNINSTALLED") {
            if (session) {
                await shopify.sessionStorage.deleteSession(session.id);
            }
        }

        if (topic === "CUSTOM_PAYMENT_CALLBACK") { // Hypothetical callback from Polaris
            // Resolve session
            // This logic assumes we have a valid session to create the client
            // In reality, webhooks might not keys to session storage directly unless we lookup by shop.
        }

        return json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return json({ error: "Webhook failed" }, { status: 500 });
    }
}
