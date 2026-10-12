import Link from "next/link";
import Icon from "./Icon";

export default function Logo() {
  return (
    <Link href="/" className="brand" aria-label="FoodRescue home">
      <span className="brand-mark"><Icon name="leaf" size={19} /></span>
      <span>Food<em>Rescue</em></span>
    </Link>
  );
}
