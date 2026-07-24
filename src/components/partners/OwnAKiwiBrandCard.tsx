import Link from "next/link";
import { PARTNER_CREATE_ACCOUNT_PATH } from "@/lib/partner-auth";
import { heading2 } from "@/lib/ui-classes";

type OwnAKiwiBrandCardProps = {
  className?: string;
};

export function OwnAKiwiBrandCard({ className = "" }: OwnAKiwiBrandCardProps) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border border-primary/25 bg-[#F5F2FF] p-6 shadow-sm sm:p-8 ${className}`.trim()}
    >
      <h2 className={`${heading2} text-foreground`}>Own a Kiwi Brand?</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base">
        Join FoodVault free of charge and connect directly with members looking to save. List your
        business, create an exclusive member offer and drive traffic directly to your own website.
      </p>
      <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:pt-8">
        <Link
          href={PARTNER_CREATE_ACCOUNT_PATH}
          className="fv-btn-primary inline-flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
        >
          Become a Partner
        </Link>
        <Link
          href="/for-brands"
          className="inline-flex w-full items-center justify-center rounded-sm border-2 border-primary bg-white px-6 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary/5 sm:w-auto"
        >
          Learn More
        </Link>
      </div>
    </article>
  );
}
