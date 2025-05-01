"use client";
import { sendInvite } from "@/actions/users";
import FormSelectInput from "@/components/FormInputs/FormSelectInput";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MdInsertInvitation } from "react-icons/md";
import { toast } from "sonner";

export type UserInvitationData = {
  email: string;
  organizationId: string;
  organizationName: string;
  roleId: string;
  roleName: string;
  locationId: string;
  locationName: string;
};

export function UserInvitationForm({
  roles,
  locations,
  organizationId,
  organizationName,
}: {
  locations: {
    label: string;
    value: string;
  }[];
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
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const router = useRouter();

  // Set default values when props are available and not empty
  useEffect(() => {
    if (roles && roles.length > 0) {
      setSelectedRole(roles[0]);
    }

    if (locations && locations.length > 0) {
      setSelectedLocation(locations[0]);
    }
  }, [roles, locations]);

  const sendInvitation = async () => {
    if (!email.trim()) {
      setErr("Email is required");
      return;
    }

    // Check if role and location are selected
    if (!selectedRole?.value) {
      setErr("Please select a valid role");
      return;
    }

    if (!selectedLocation?.value) {
      setErr("Please select a valid location");
      return;
    }

    const data = {
      email: email.trim(),
      organizationId,
      organizationName,
      roleId: selectedRole.value,
      roleName: selectedRole.label,
      locationId: selectedLocation.value,
      locationName: selectedLocation.label,
    };

    console.log("Invitation Data", data);

    try {
      setLoading(true);
      const res = await sendInvite(data);
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

  // Disable the button if necessary data is missing
  const isFormValid =
    email.trim() && selectedRole?.value && selectedLocation?.value;

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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value.trim()) setErr("");
                }}
              />
              {err && <p className="text-red-500 -mt-1">{err}</p>}

              <FormSelectInput
                label="User Role"
                options={roles || []}
                option={selectedRole}
                setOption={setSelectedRole}
              />

              <FormSelectInput
                label="Location"
                options={locations || []}
                option={selectedLocation}
                setOption={setSelectedLocation}
              />

              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Please wait...
                </Button>
              ) : (
                <Button onClick={sendInvitation} disabled={!isFormValid}>
                  <SendIcon className="mr-2 h-4 w-4" /> Invite User
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
