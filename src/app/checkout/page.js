import { redirect } from "next/navigation";
import { getDishes } from "../menu/data";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import OrderForm from "./OrderForm";

export const metadata = {
  title: "Checkout",
  description: "Enter your delivery details and place your Addis Eats order.",
  robots: { index: false, follow: false },
};

// Dynamic: reads the session cookie, which only exists at request time.
export const dynamic = "force-dynamic";

export default async function Checkout({ searchParams }) {
  const { dish } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/signin?next=/checkout");

  const dishes = await getDishes();
  const initialDish = dishes.some((d) => d.id === dish) ? dish : "";

  return (
    <main>
      <PageHeader title="Checkout" description={`Ordering as ${session.name}. Tell us where to deliver.`} />
      <OrderForm
        dishes={dishes.map((d) => ({ id: d.id, name: d.name, price: d.price }))}
        defaultName={session.name}
        initialDish={initialDish}
      />
    </main>
  );
}
