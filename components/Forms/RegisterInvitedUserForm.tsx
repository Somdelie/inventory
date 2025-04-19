"use client";
import { Headset, Loader2, Lock, Mail, User, Building } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { InvitedUserProps } from "@/types/types";
import { useRouter } from "next/navigation";
import TextInput from "../FormInputs/TextInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import { createInvitedUser, createUser } from "@/actions/users";
import CustomCarousel from "../frontend/custom-carousel";
import "react-country-state-city/dist/react-country-state-city.css";
import Logo from "../global/Logo";
import { toast } from "sonner";

export default function RegisterInvitedUserForm({
  userEmail,
  organizationId,
  roleId,
  organizationName,
}: {
  userEmail: string;
  organizationId: string;
  roleId: string;
  organizationName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InvitedUserProps>({
    defaultValues: {
      email: userEmail,
    },
  });
  const router = useRouter();

  async function onSubmit(data: InvitedUserProps) {
    setLoading(true);
    data.organizationId = organizationId;
    data.roleId = roleId;
    data.organizationName = organizationName;

    console.log("User data:", data);
    try {
      const res = await createInvitedUser(data);
      if (res.status === 409) {
        setLoading(false);
        setEmailErr(res.error);
      } else if (res.status === 200) {
        setLoading(false);
        toast.success("Account Created successfully");
        router.push("/login"); // Redirect to login page
      } else {
        setLoading(false);
        toast.error("Something went wrong");
      }
      console.log("User data:", data);
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      toast.error("Its seems something is wrong, try again");
    }
  }

  return (
    <div className="w-full lg:grid h-screen lg:min-h-[600px] lg:grid-cols-2 relative">
      <div className="flex items-center justify-center py-6">
        <div className="w-full px-6 md:px-10 lg:px-12">
          <div className="absolute left-6 top-6">
            <Logo />
          </div>
          <div className="grid gap-2 text-center mt-16">
            <h1 className="text-3xl font-bold">
              Welcome to{" "}
              <span className="text-rose-600 truncate">{organizationName}</span>
              Team
            </h1>
            <p className="text-muted-foreground text-sm">
              Please customize your account to get started
            </p>
          </div>
          <div className="mt-6">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="First Name"
                  name="firstName"
                  icon={User}
                  placeholder="First Name"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Last Name"
                  name="lastName"
                  icon={User}
                  placeholder="Last Name"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Phone"
                  name="phone"
                  icon={Headset}
                  placeholder="Phone Number"
                />

                <TextInput
                  type="email"
                  register={register}
                  errors={errors}
                  label="Email Address"
                  name="email"
                  icon={Mail}
                  placeholder="Email Address"
                  isRequired={false}
                />
                <PasswordInput
                  register={register}
                  errors={errors}
                  label="Password"
                  name="password"
                  icon={Lock}
                  placeholder="Password"
                  type="password"
                />
                <div className="">
                  {emailErr && (
                    <p className="text-red-500 text-xs mt-2">{emailErr}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <SubmitButton
                  title="Sign Up"
                  loadingTitle="Creating Please wait.."
                  loading={loading}
                  className="w-full bg-rose-600 hover:bg-rose-700 h-11 text-base font-medium"
                  loaderIcon={Loader2}
                  showIcon={false}
                />
              </div>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
              Already Registered?{" "}
              <Link
                href="/login"
                className="font-semibold leading-6 text-rose-600 hover:text-rose-500"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden bg-rose-50 lg:block relative">
        <CustomCarousel />
      </div>
    </div>
  );
}
