import { PageHeader } from "@/components/ui";
import CartView from "./CartView";

// Private to the visitor and not worth indexing.
export const metadata = {
  title: "Your cart",
  description: "Review the dishes in your cart before you check out.",
  robots: { index: false, follow: false },
};

// The page around the cart is static; only CartView (a small client component) reads the cart.
export default function Cart() {
  return (
    <main>
      <PageHeader title="Your cart" description="Check your dishes, change quantities, then continue to checkout." />
      <CartView />
    </main>
  );
}
