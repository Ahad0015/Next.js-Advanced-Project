import { getDishes } from "./data";
import DishList from "./DishList";
import FilterShell from "./FilterShell";
import SearchBox from "./SearchBox";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Menu",
  description:
    "Browse the Addis Eats menu: mains, starters and vegetarian dishes with prices. Search by name or category.",
};

// Static page, rebuilt at most once a minute (ISR): the menu changes rarely, so speed matters most.
export const revalidate = 60;

export default async function Menu() {
  const dishes = await getDishes();
  const names = [...new Set(dishes.map((d) => d.category))];
  const categories = [
    { name: "All", count: dishes.length },
    ...names.map((name) => ({ name, count: dishes.filter((d) => d.category === name).length })),
  ];

  return (
    <main>
      <PageHeader title="Menu" description="Fresh Ethiopian dishes, cooked to order. Add what you like, then check out when you are ready." />
      {/* SearchBox (client) shows this server-rendered menu until someone types. */}
      <SearchBox>
        <FilterShell categories={categories}>
          <DishList dishes={dishes} />
        </FilterShell>
      </SearchBox>
    </main>
  );
}
