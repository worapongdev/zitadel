"use client";

import { clearSession } from "@/lib/server/session";
import { timestampDate } from "@zitadel/client";
import { Session } from "@zitadel/proto/zitadel/session/v2/session_pb";
import { redirect, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertType } from "./alert";
import { SessionClearItem } from "./session-clear-item";
import { Translated } from "./translated";

type Props = {
  sessions: Session[];
  postLogoutRedirectUri?: string;
  logoutHint?: string;
  organization?: string;
  /**
   * Custom login (saas-infra-template): the page was opened by ZITADEL's
   * end_session (a verified logout token). A logout then ends every session
   * of this browser without asking; upstream lists them and waits for a
   * click, which leaves the session in place when the user just goes on.
   */
  clearAll?: boolean;
};

export function SessionsClearList({ sessions, logoutHint, postLogoutRedirectUri, organization, clearAll }: Props) {
  const [list, setList] = useState<Session[]>(sessions);
  const router = useRouter();
  const clearingAll = !!clearAll && !logoutHint;

  const clearEverySession = useCallback(async () => {
    // One after the other: each call rewrites the cookie that holds them all.
    for (const session of sessions) {
      await clearSession({ sessionId: session.id }).catch((error) => {
        console.error("Error clearing session:", error);
      });
    }
    if (postLogoutRedirectUri) {
      window.location.assign(postLogoutRedirectUri);
      return;
    }
    const params = new URLSearchParams();
    if (organization) {
      params.set("organization", organization);
    }
    router.push("/logout/done?" + params);
  }, [sessions, postLogoutRedirectUri, organization, router]);

  useEffect(() => {
    if (clearingAll) {
      clearEverySession();
    }
  }, [clearingAll, clearEverySession]);

  const clearHintedSession = useCallback(async () => {
    console.log("Clearing session for login hint:", logoutHint);
    // If a login hint is provided, we logout that specific session
    const sessionIdToBeCleared = sessions.find((session) => {
      return session.factors?.user?.loginName === logoutHint;
    })?.id;

    if (sessionIdToBeCleared) {
      const clearSessionResponse = await clearSession({
        sessionId: sessionIdToBeCleared,
      }).catch((error) => {
        console.error("Error clearing session:", error);
        return;
      });

      if (!clearSessionResponse) {
        console.error("Failed to clear session for login hint:", logoutHint);
      }

      if (postLogoutRedirectUri) {
        return redirect(postLogoutRedirectUri);
      }

      const params = new URLSearchParams();

      if (organization) {
        params.set("organization", organization);
      }

      return router.push("/logout/done?" + params);
    } else {
      console.warn(`No session found for login hint: ${logoutHint}`);
    }
  }, [logoutHint, sessions, postLogoutRedirectUri, organization, router]);

  useEffect(() => {
    if (logoutHint) {
      clearHintedSession();
    }
  }, [logoutHint, clearHintedSession]);

  if (clearingAll) {
    // Nothing to choose: the sessions are being ended.
    return null;
  }

  return sessions ? (
    <div className="flex flex-col space-y-2">
      {list
        .filter((session) => session?.factors?.user?.loginName)
        // sort by change date descending
        .sort((a, b) => {
          const dateA = a.changeDate ? timestampDate(a.changeDate).getTime() : 0;
          const dateB = b.changeDate ? timestampDate(b.changeDate).getTime() : 0;
          return dateB - dateA;
        })
        // TODO: add sorting to move invalid sessions to the bottom
        .map((session, index) => {
          return (
            <SessionClearItem
              session={session}
              reload={() => {
                setList(list.filter((s) => s.id !== session.id));
                if (postLogoutRedirectUri) {
                  router.push(postLogoutRedirectUri);
                }
              }}
              key={"session-" + index}
            />
          );
        })}
      {list.length === 0 && (
        <Alert type={AlertType.INFO}>
          <Translated i18nKey="noResults" namespace="logout" />
        </Alert>
      )}
    </div>
  ) : (
    <Alert>
      <Translated i18nKey="noResults" namespace="logout" />
    </Alert>
  );
}
