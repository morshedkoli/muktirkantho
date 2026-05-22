import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type MenuItemRecord = {
  id: string;
  label: string;
  url: string;
  location: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  icon: string | null;
};

function makeMenuCache(location: string) {
  return unstable_cache(
    async (): Promise<MenuItemRecord[]> => {
      try {
        return await prisma.menuItem.findMany({
          where: { location, isActive: true },
          orderBy: { order: "asc" },
        });
      } catch {
        return [];
      }
    },
    [`menu-items-${location}`],
    { revalidate: 300, tags: ["menu-items"] }
  );
}

export const getHeaderMenuItems = makeMenuCache("header");
export const getFooterMenuItems = makeMenuCache("footer");
export const getFooterBottomMenuItems = makeMenuCache("footer_bottom");
export const getSocialMenuItems = makeMenuCache("social");
