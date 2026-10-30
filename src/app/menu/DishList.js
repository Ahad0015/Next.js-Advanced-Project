import DishCard from "./DishCard";

export default function DishList({ dishes }) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {dishes.map((d) => (
        <DishCard key={d.id} dish={d} />
      ))}
    </ul>
  );
}
