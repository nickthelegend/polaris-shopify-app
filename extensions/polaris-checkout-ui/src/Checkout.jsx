
import {
  reactExtension,
  Banner,
  BlockStack,
  Button,
  InlineLayout,
  Text,
  useApi,
  useTranslate,
  useTotalAmount,
  useOrder,
} from "@shopify/ui-extensions-react/checkout";

// Valid targets for this extension
export default reactExtension("purchase.checkout.block.render", () => <Extension />);
export { reactExtension as thankYouExtension } from "@shopify/ui-extensions-react/checkout";

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const total = useTotalAmount();
  const order = useOrder(); // Available on Thank You page

  // If we are on checkout but not seeing "manual payment", we hide.
  // Ideally, we only show this if the selected payment method is "Manual" or matches "Polaris".
  // For simplicity, we show it always but guide usage.

  if (!order) {
    // Only show on Thank You Page (post-purchase) where order ID exists
    return null;
  }

  // Construct the Payment URL
  const paymentUrl = `https://polaris-pay.vercel.app/pay?orderId=${order.id.split("/").pop()}&amount=${total?.amount}&currency=${total?.currencyCode}`;

  return (
    <BlockStack spacing="loose">
      <Banner title="Complete Your Payment" status="info">
        Please complete your payment securely via Polaris Protocol to finalize your order.
      </Banner>
      <InlineLayout>
        <Button to={paymentUrl} accessibilityRole="link">
          Pay with Polaris Protocol
        </Button>
      </InlineLayout>
    </BlockStack>
  );
}