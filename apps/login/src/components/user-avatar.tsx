import { Avatar } from "@/components/avatar";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useOptionalText } from "./brand-text";

type Props = {
  loginName?: string;
  displayName?: string;
  showDropdown: boolean;
  searchParams?: Record<string | number | symbol, string | undefined>;
};

export function UserAvatar({ loginName, displayName, showDropdown, searchParams }: Props) {
  const params = new URLSearchParams({});
  const change = useOptionalText()("brand.change");

  if (searchParams?.sessionId) {
    params.set("sessionId", searchParams.sessionId);
  }

  if (searchParams?.organization) {
    params.set("organization", searchParams.organization);
  }

  if (searchParams?.requestId) {
    params.set("requestId", searchParams.requestId);
  }

  if (searchParams?.loginName) {
    params.set("loginName", searchParams.loginName);
  }

  return (
    <div className="cl-account">
      <div className="cl-account-avatar">
        <Avatar size="small" name={displayName ?? loginName ?? ""} loginName={loginName ?? ""} />
      </div>
      <span className="cl-account-name">{loginName}</span>
      {showDropdown && (
        <Link href={"/accounts?" + params} className="cl-account-change" aria-label={change || "Switch account"}>
          {change || <ChevronDownIcon className="h-4 w-4" />}
        </Link>
      )}
    </div>
  );
}
