import RequireRole from "@/components/RequireRole";
import FoodForm from "@/components/FoodForm";

export default function DonatePage() {
  return (
    <main className="container page">
      <RequireRole roles={["DONOR"]}>
        <FoodForm />
      </RequireRole>
    </main>
  );
}
