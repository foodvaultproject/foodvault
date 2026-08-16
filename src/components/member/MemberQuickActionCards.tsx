import Link from "next/link";
import { consumerSearchPath } from "@/lib/consumer-nav-restructure";
import {
  MEMBER_ACCOUNT_PATH,
  MEMBER_FAVORITES_PATH,
  MEMBER_MEMBERSHIP_PATH,
} from "@/lib/member/paths";

/** Source card art is 2400x1260. */
const CARD_ASPECT_CLASS = "aspect-[40/21]";

const memberQuickActions = [
  {
    title: "Browse Brands",
    href: consumerSearchPath(),
    imageSrc: "/active member cards/browse_brands_card.webp",
  },
  {
    title: "Membership",
    href: MEMBER_MEMBERSHIP_PATH,
    imageSrc: "/active member cards/membership_card.webp",
  },
  {
    title: "Favorites",
    href: MEMBER_FAVORITES_PATH,
    imageSrc: "/active member cards/favourites_card.webp",
  },
  {
    title: "My Account",
    href: MEMBER_ACCOUNT_PATH,
    imageSrc: "/active member cards/account_card.webp",
  },
] as const;

export function MemberQuickActionCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {memberQuickActions.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className={`group relative block overflow-hidden rounded-lg ${CARD_ASPECT_CLASS} shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card`}
        >
          <img
            src={item.imageSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
            decoding="async"
          />
          <span className="absolute inset-y-0 left-0 flex items-center px-3 sm:px-4">
            <span className="text-sm font-bold leading-tight text-white drop-shadow-sm sm:text-base">
              {item.title}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
