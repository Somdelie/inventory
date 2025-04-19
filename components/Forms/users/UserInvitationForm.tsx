"use client";
import { createNewBlog } from "@/actions/blogs";
import { sendInvite } from "@/actions/users";
import FormSelectInput from "@/components/FormInputs/FormSelectInput";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthenticatedUser } from "@/config/useAuth";
import { generateSlug } from "@/lib/generateSlug";
import { Loader2, Plus, PlusCircle, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdInsertInvitation } from "react-icons/md";
import { toast } from "sonner";

export type UserInvitationData = {
  email: string;
  organizationId: string;
  organizationName: string;
  roleId: string;
  roleName: string;
};

export function UserInvitationForm({
  roles,
  organizationId,
  organizationName,
}: {
  roles: {
    label: string;
    value: string;
  }[];
  organizationId: string;
  organizationName: string;
}) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(roles[0]);
  const router = useRouter();
  const sendInvitation = async () => {
    if (!email.trim()) {
      setErr("Email is required");
      return;
    }
    const data: UserInvitationData = {
      email: email,
      organizationId: organizationId,
      organizationName: organizationName,
      roleId: selectedRole.value as string,
      roleName: selectedRole.label,
    };
    console.log(data);
    try {
      setLoading(true);
      const res = await sendInvite(data);
      console.log(res, "this is the response");
      if (res.status === 200) {
        setLoading(false);
        toast.success("Invitation sent successfully", {
          style: {
            background: "green",
            color: "#fff",
          },
        });
      } else {
        setLoading(false);
        toast.error(res.error, {
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        });
        setErr(res.error || "Something went wrong");
        return;
      }
      setLoading(false);
      setEmail("");
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Something went wrong");
      return;
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <MdInsertInvitation className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Invite User
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Invite New User</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <div className="flex flex-col w-full gap-2">
              <Input
                type="text"
                placeholder="user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendInvitation()}
              />
              {err && <p className="text-red-500 -mt-1">{err}</p>}
              <FormSelectInput
                label="User Role"
                options={roles}
                option={selectedRole}
                setOption={setSelectedRole}
              />
              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Please wait...
                </Button>
              ) : (
                <Button onClick={sendInvitation}>
                  <SendIcon className="mr-2 h-4 w-4" /> Invite User
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
