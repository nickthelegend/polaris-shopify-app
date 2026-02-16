import { ActionFunctionArgs, json } from "@remix-run/node";

interface PolarisPaymentResponse {
    payment_session_id?: string;
    redirect_url?: string;
    tokens?: string[];
    status?: string;
    error?: string;
    amount?: number;
    currency?: string;
    customer?: { id: string; email: string };
}

// Ensure you set your API keys as env vars in Shopify or `.env`
const POLARIS_API_URL = process.env.POLARIS_CHECKOUT_APP_URL || "https://polaris-checkout-app.vercel.app/api/bills/create";

export async function action({ request }: ActionFunctionArgs) {
    try {
        const payload = await request.json();
        const {
            amount,
            currency,
            payment_method, // Has data like card token if tokenized
            customer,
            id: order_id,
            gid: order_gid,
        } = payload;

        // Call Polaris API to create a payment session
        // This assumes Polaris has an API endpoint that takes:
        // - amount
        // - currency
        // - customer email
        // - metadata (order ID)
        // And returns a `redirect_url` to the checkout page OR processes directly.

        // If using the PayWithPolaris flow, we redirect the user to the `checkoutUrl`.
        const response = await fetch(POLARIS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": process.env.POLARIS_API_KEY || "", // From Extension Settings ideally passed via context, but simpler here
                "x-client-secret": process.env.POLARIS_API_SECRET || "",
            },
            body: JSON.stringify({
                amount: amount,
                description: `Order #${order_id}`,
                customer_email: customer?.email,
                metadata: {
                    shopify_order_id: order_id,
                    shopify_order_gid: order_gid,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Polaris Payment Error:", errorData);
            return json(
                {
                    error: {
                        reason: "processing_error",
                        message: errorData.error || "Payment creation failed at Polaris.",
                    },
                },
                { status: 422 }
            );
        }

        const data = await response.json();

        // If Polaris returns a checkout URL, we tell Shopify to redirect
        if (data.checkoutUrl) {
            return json({
                redirect_url: data.checkoutUrl,
            });
        }

        // If direct processing (e.g. tokenized), handle success
        return json({
            redirect_url: `https://your-shop.myshopify.com/checkouts/${order_id}/thank_you`, // Fallback for direct success
        });

    } catch (error) {
        console.error("Internal Payment Error:", error);
        return json(
            {
                error: {
                    reason: "processing_error",
                    message: "Unable to reach Polaris Payment Gateway.",
                },
            },
            { status: 500 }
        );
    }
}
