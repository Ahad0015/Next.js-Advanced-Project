// width and height are the REAL pixel size of each file in public/images/dishes.
// next/image needs the true ratio to reserve space (CLS) without stretching the picture.
export const dishes = [
  { id: "1", name: "Doro Wat", category: "Mains", price: 350, image: "/images/dishes/doro-wat.jpg", width: 554, height: 554,
    summary: "Slow-cooked chicken stew in spicy berbere sauce, served with a boiled egg and injera." },
  { id: "2", name: "Kitfo", category: "Mains", price: 420, image: "/images/dishes/kitfo.jpg", width: 614, height: 499,
    summary: "Finely minced beef seasoned with spiced butter and mitmita, served with ayib cheese." },
  { id: "3", name: "Shiro", category: "Vegetarian", price: 220, image: "/images/dishes/shiro.jpg", width: 554, height: 554,
    summary: "Creamy ground chickpea stew simmered with garlic and onion, a fasting-day favourite." },
  { id: "4", name: "Sambusa", category: "Starters", price: 90, image: "/images/dishes/sambusa.jpg", width: 536, height: 373,
    summary: "Crisp triangular pastries filled with spiced lentils or minced meat." },
  { id: "5", name: "Tibs", category: "Mains", price: 380, image: "/images/dishes/tibs.jpg", width: 461, height: 664,
    summary: "Sautéed cubes of beef with onion, rosemary and green chilli." },
  { id: "6", name: "Atkilt Wat", category: "Vegetarian", price: 200, image: "/images/dishes/atkilt-wat.jpg", width: 452, height: 678,
    summary: "Mild stew of cabbage, carrots and potatoes cooked with turmeric." },
  { id: "7", name: "Dulet", category: "Starters", price: 300, image: "/images/dishes/dulet.jpg", width: 554, height: 554,
    summary: "Minced tripe, liver and beef sautéed with butter, onion and chilli." },
  { id: "8", name: "Firfir", category: "Vegetarian", price: 180, image: "/images/dishes/firfir.jpg", width: 547, height: 365,
    summary: "Shredded injera tossed in spicy berbere sauce, a hearty breakfast dish." },
];

export async function getDishes() {
  return dishes;
}