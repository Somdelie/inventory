import React from "react";
// import { getRoleById } from "@/actions/roles";
import RoleForm from "@/components/Forms/RoleForm";
import { getRoleById } from "@/actions/roles";
import NotFound from "@/app/not-found";
import { getAuthenticatedUser } from "@/config/useAuth";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthenticatedUser();
  const id = (await params).id;
  const organizationId = user?.organizationId ?? "";
  const { data } = await getRoleById(id);
  if (!id || !data) {
    return NotFound();
  }
  return (
    <RoleForm
      editingId={id}
      initialData={data}
      organizationId={organizationId}
    />
  );
}
