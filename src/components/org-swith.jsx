"use client";
import { SignedIn } from "@clerk/nextjs";
import { OrganizationSwitcher, useOrganization, useUser } from "@clerk/nextjs";
import React from "react";

const OrgSwitcher = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: UserLoaded } = useUser();

  if (!isLoaded || !UserLoaded) return null;

  return (
    <SignedIn>
      <div className="border border-gray-300 rounded-2xl p-2 inline-block mr-20">
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl={"/organization/:slug"}
          afterSelectOrganizationUrl={"/organization/:slug"}
        />
      </div>
    </SignedIn>
  );
};

export default OrgSwitcher;
