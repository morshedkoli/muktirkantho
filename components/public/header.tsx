import { getHeaderMenuItems } from "@/lib/menus";
import { HeaderClient } from "./header-client";

export async function Header() {
  let menuItems: Awaited<ReturnType<typeof getHeaderMenuItems>> = [];
  try {
    menuItems = await getHeaderMenuItems();
  } catch {
    // render with empty menu
  }
  return <HeaderClient menuItems={menuItems} />;
}
