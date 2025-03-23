import { getUserById } from "@/actions/users";
import VerifyTokenForm from "@/components/Forms/VerifyTokenForm";
import { GridBackground } from "@/components/reusable-ui/grid-background";
import React from "react";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await params;
  const user = await getUserById(userId);
  const email = (await searchParams).email as string;
  console.log(email);

  // console.log(userId);

  return (
    <GridBackground>
      <div className="px-4 items-center justify-center flex flex-col min-h-screen">
        <VerifyTokenForm userId={userId} email={email} />
      </div>
    </GridBackground>
  );
}
