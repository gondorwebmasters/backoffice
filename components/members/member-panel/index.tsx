"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { SlideOver } from "@/components/ui/slide-over";
import { Tabs } from "@/components/ui/tabs";
import { fullName } from "@/lib/format";
import type { User } from "@/lib/graphql/types";

import { PaymentsTab } from "./payments-tab";
import { ProfileTab } from "./profile-tab";
import { SchedulesTab } from "./schedules-tab";
import { SubscriptionTab } from "./subscription-tab";

interface MemberPanelProps {
  member: User | null;
  onClose: () => void;
  onChanged: () => void;
}

export function MemberPanel({ member, onClose, onChanged }: MemberPanelProps) {
  const t = useTranslations("members.panel.tabs");
  const [tab, setTab] = useState("profile");
  const TABS = [
    { value: "profile", label: t("profile") },
    { value: "subscription", label: t("subscription") },
    { value: "payments", label: t("payments") },
    { value: "schedules", label: t("schedules") },
  ];

  return (
    <SlideOver
      open={Boolean(member)}
      onClose={onClose}
      title={member ? fullName(member) : ""}
      subtitle={member?.email}
      wide
    >
      {member ? (
        <div className="space-y-6">
          <Tabs items={TABS} value={tab} onChange={setTab} />
          {tab === "profile" ? (
            <ProfileTab
              key={member.id}
              member={member}
              onChanged={onChanged}
              onDeleted={() => {
                onChanged();
                onClose();
              }}
            />
          ) : null}
          {tab === "subscription" ? <SubscriptionTab userId={member.id} /> : null}
          {tab === "payments" ? <PaymentsTab userId={member.id} /> : null}
          {tab === "schedules" ? <SchedulesTab userId={member.id} /> : null}
        </div>
      ) : null}
    </SlideOver>
  );
}
