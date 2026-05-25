// src/app/admin/products/page.tsx
import { db } from "@/db/client";
import { products } from "@/db/schema";

export default async function ProductsPage() {
  const allProducts = await db.select().from(products);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2">ID</th>
            <th className="border px-2">Name</th>
            <th className="border px-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {allProducts.map((p) => (
            <tr key={p.id}>
              <td className="border px-2">{p.id}</td>
              <td className="border px-2">{p.name}</td>
              <td className="border px-2">{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
