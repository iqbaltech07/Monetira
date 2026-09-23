import { SavingsContent } from "~/components/features/savings/SavingsContent";
import { getSavings } from "~/lib/dummy-data";

export default async function SavingsPage() {
  const savings = await getSavings();
  return <SavingsContent savings={savings} />;
}
