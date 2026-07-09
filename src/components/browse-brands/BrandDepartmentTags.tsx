import { tileDepartmentTags } from "@/data/partner-categories";

type BrandDepartmentTagsProps = {
  departments: string[];
  className?: string;
};

export function BrandDepartmentTags({
  departments,
  className = "",
}: BrandDepartmentTagsProps) {
  const tags = tileDepartmentTags(departments);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      {tags.map((department) => (
        <span
          key={department}
          className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
        >
          {department}
        </span>
      ))}
    </div>
  );
}
