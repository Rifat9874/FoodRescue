import RequireRole from "@/components/RequireRole";
import FoodForm from "@/components/FoodForm";

export default async function EditListingPage({ params }) {
  const { id } = await params;
  return (
    <main className="container page">
      <RequireRole roles={["DONOR", "ADMIN"]}>
        <FoodForm listingId={id} />
      </RequireRole>
    </main>
  );
}
