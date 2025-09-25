import { BsGridFill } from "react-icons/bs";
import { FaPiggyBank } from "react-icons/fa6";
import { GiCardExchange } from "react-icons/gi";

export const NAV_ITEMS = [
  { href: "/dashboard", icon: BsGridFill, label: "Dashboard" },
  { href: "/transactions", icon: GiCardExchange, label: "Transaksi" },
  { href: "/savings", icon: FaPiggyBank, label: "Tabungan" },
];
