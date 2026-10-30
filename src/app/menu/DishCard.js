import Image from "next/image";
import Link from "next/link";
import { formatETB } from "@/lib/format";
import AddToCartButton from "./AddToCartButton";

// A server component: it only renders data. The one interactive part (the add button)
// is a small client component that receives plain data.
export default function DishCard({ dish }) {
  return (
    <li data-category={dish.category} className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <Link href={`/menu/${dish.id}`} className="block" tabIndex={-1} aria-hidden="true">
        <Image
          src={dish.image}
          alt=""
          width={dish.width}
          height={dish.height}
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
          className="h-44 w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-lg font-semibold">
            <Link href={`/menu/${dish.id}`} className="hover:underline">{dish.name}</Link>
          </h3>
          <p className="text-sm text-muted">{dish.category}</p>
        </div>
        <p className="line-clamp-2 text-sm text-muted">{dish.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-semibold">{formatETB(dish.price)}</p>
          <AddToCartButton dish={{ id: dish.id, name: dish.name, price: dish.price }} />
        </div>
      </div>
    </li>
  );
}
