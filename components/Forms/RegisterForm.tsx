"use client";
import {
  Headset,
  Loader2,
  Lock,
  Mail,
  User,
  Plus,
  Building,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { OrganizationProps, UserProps } from "@/types/types";
import { useRouter } from "next/navigation";
import TextInput from "../FormInputs/TextInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import { createUser } from "@/actions/users";
import CustomCarousel from "../frontend/custom-carousel";
import { Button } from "../ui/button";
import {
  CitySelect,
  CountrySelect,
  StateSelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import Logo from "../global/Logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  createOrganization,
  getAllOrganizations,
} from "@/actions/organization";
import { toast } from "sonner";
export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [country, setCountry] = useState<any>(null);
  const [currentState, setCurrentState] = useState<any>(null);
  const [city, setCity] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [organizationMode, setOrganizationMode] = useState<"select" | "create">(
    "select"
  );
  const [isNewOrgDialogOpen, setIsNewOrgDialogOpen] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    email: "",
    country: "",
    industry: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserProps>();
  const router = useRouter();

  const getOrganizations = getAllOrganizations;
  // Watch the email field to use it for organization email
  const userEmail = watch("email");

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      const orgs = await getOrganizations();
      setOrganizations(orgs);
    };

    fetchOrganizations();
  }, []);

  // Update form values when location fields change
  const handleCountryChange = (_country: any) => {
    setCountry(_country);
    setValue("country", _country?.name || "");
    // Reset state and city when country changes
    setCurrentState(null);
    setCity(null);
    setValue("state", "");
    setValue("city", "");
  };

  const handleStateChange = (_state: any) => {
    setCurrentState(_state);
    setValue("state", _state?.name || "");
    // Reset city when state changes
    setCity(null);
    setValue("city", "");
  };

  const handleCityChange = (_city: any) => {
    setCity(_city);
    setValue("city", _city?.name || "");
  };

  // Handle new organization creation
  const handleCreateOrganization = async () => {
    setIsNewOrgDialogOpen(false);

    try {
      // First create the organization normally (we'll connect the user after registration)
      const res = await createOrganization(newOrgData);

      if (res.status === 200) {
        setOrganizations([...organizations, res.data]);
        if (res.data) {
          setValue("organizationId", res.data.id);
          // Store the fact that this is a new organization created by this user
          setValue("isNewOrganizationAdmin", "true");
        }
        toast.success("Organization created successfully");
      } else {
        toast.error(res.error || "Failed to create organization");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization");
    }
  };

  // Then modify the onSubmit function to handle the user becoming an admin
  // Replace or update the onSubmit function with this:
  async function onSubmit(data: UserProps) {
    setLoading(true);
    data.name = `${data.firstName} ${data.lastName}`;
    data.image =
      "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png";

    // Ensure location data is included
    if (!data.country || !data.state || !data.city) {
      setLoading(false);
      toast.error("Please complete your location details");
      return;
    }

    // Ensure organization is selected or created
    if (!data.organizationId) {
      setLoading(false);
      toast.error("Please select or create an organization");
      return;
    }

    console.log(data, "this is the data");

    try {
      const res = await createUser(data);
      if (res.status === 409) {
        setLoading(false);
        setEmailErr(res.error);
      } else if (res.status === 200) {
        // If this user created a new organization, make them an admin
        if (data.isNewOrganizationAdmin === "true" && res.data?.id) {
          // Update the organization to set this user as admin
          await createOrganization(
            { id: data.organizationId, name: "" } as OrganizationProps,
            res.data.id
          );
        }

        setLoading(false);
        toast.success("Account Created successfully");
        router.push(`/verify/${res?.data?.id}?email=${data.email}`);
      } else {
        setLoading(false);
        toast.error("Something went wrong");
      }
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      toast.error("Its seems something is wrong, try again");
    }
  }

  return (
    <div className="w-full lg:grid h-screen lg:min-h-[600px] lg:grid-cols-2 relative ">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid gap-6 mt-10 md:mt-0">
          <div className="absolute left-1/3 top-14 md:top-5 md:left-5">
            <Logo />
          </div>
          <div className="grid gap-2 text-center mt-10 md:mt-0">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground text-sm">
              Create your <span className="text-blue-600">Next Admin</span>{" "}
              Account today to get started
            </p>
          </div>
          <div className="">
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="First Name"
                  name="firstName"
                  icon={User}
                  placeholder="first Name"
                />
                <input type="hidden" {...register("isNewOrganizationAdmin")} />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Last Name"
                  name="lastName"
                  icon={User}
                  placeholder="last Name"
                />

                {/* Organization selection UI */}
                <div className="md:col-span-2">
                  <Tabs
                    defaultValue="select"
                    onValueChange={(value) =>
                      setOrganizationMode(value as "select" | "create")
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="select">
                        Select Organization
                      </TabsTrigger>
                      <TabsTrigger value="create">Create New</TabsTrigger>
                    </TabsList>
                    <TabsContent value="select">
                      <div className="space-y-1">
                        <label
                          htmlFor="organizationId"
                          className="block text-sm font-medium"
                        >
                          Select Organization
                        </label>
                        <Select
                          onValueChange={(value) =>
                            setValue("organizationId", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an organization" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizations.map((org) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.organizationId && (
                          <p className="text-red-500 text-xs mt-1">
                            Organization is required
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="create">
                      <div className="space-y-1">
                        <label
                          htmlFor="newOrg"
                          className="block text-sm font-medium"
                        >
                          Create New Organization
                        </label>
                        <Dialog
                          open={isNewOrgDialogOpen}
                          onOpenChange={setIsNewOrgDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create New Organization
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Create New Organization</DialogTitle>
                              <DialogDescription>
                                Enter the details for your new organization
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="org-name"
                                  className="text-right"
                                >
                                  Name
                                </Label>
                                <Input
                                  id="org-name"
                                  value={newOrgData.name}
                                  onChange={(e) =>
                                    setNewOrgData({
                                      ...newOrgData,
                                      name: e.target.value,
                                    })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="org-email"
                                  className="text-right"
                                >
                                  Email
                                </Label>
                                <Input
                                  id="org-email"
                                  type="email"
                                  value={newOrgData.email || userEmail || ""}
                                  onChange={(e) =>
                                    setNewOrgData({
                                      ...newOrgData,
                                      email: e.target.value,
                                    })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="org-industry"
                                  className="text-right"
                                >
                                  Industry
                                </Label>
                                <Input
                                  id="org-industry"
                                  value={newOrgData.industry}
                                  onChange={(e) =>
                                    setNewOrgData({
                                      ...newOrgData,
                                      industry: e.target.value,
                                    })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            {/* // phone field */}
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="org-phone" className="text-right">
                                Phone
                              </Label>
                              <Input
                                id="org-phone"
                                value={newOrgData.phone}
                                onChange={(e) =>
                                  setNewOrgData({
                                    ...newOrgData,
                                    phone: e.target.value,
                                  })
                                }
                                className="col-span-3"
                              />
                            </div>
                            {/* // Country field */}
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="org-country"
                                className="text-right"
                              >
                                Country
                              </Label>
                              <CountrySelect
                                containerClassName="col-span-3"
                                inputClassName=""
                                onChange={(country) =>
                                  setNewOrgData({
                                    ...newOrgData,
                                    country:
                                      "name" in country ? country.name : "",
                                  })
                                }
                                onTextChange={(_txt) => console.log(_txt)}
                                placeHolder="Select Country"
                                id="org-country"
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                onClick={handleCreateOrganization}
                              >
                                Create Organization
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {organizationMode === "create" &&
                          !watch("organizationId") && (
                            <p className="text-amber-500 text-xs mt-1">
                              Please create an organization to continue
                            </p>
                          )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <TextInput
                  register={register}
                  errors={errors}
                  label="Phone"
                  name="phone"
                  icon={Headset}
                  placeholder="phone"
                />

                <TextInput
                  type="email"
                  register={register}
                  errors={errors}
                  label="Email Address"
                  name="email"
                  icon={Mail}
                  placeholder="email"
                  isRequired={false}
                />
                <PasswordInput
                  register={register}
                  errors={errors}
                  label="Password"
                  name="password"
                  icon={Lock}
                  placeholder="password"
                  type="password"
                />
                <div className="">
                  {emailErr && (
                    <p className="text-red-500 text-xs mt-2">{emailErr}</p>
                  )}
                </div>
              </div>

              {/* Hidden fields to store location data with react-hook-form */}
              <input
                type="hidden"
                {...register("organizationId", { required: true })}
              />
              <input
                type="hidden"
                {...register("country", { required: true })}
              />
              <input type="hidden" {...register("state", { required: true })} />
              <input type="hidden" {...register("city", { required: true })} />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium"
                  >
                    Country
                  </label>
                  <CountrySelect
                    containerClassName="form-group"
                    inputClassName=""
                    onChange={handleCountryChange}
                    onTextChange={(_txt) => console.log(_txt)}
                    placeHolder="Select Country"
                    id="country"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">
                      Country is required
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="state" className="block text-sm font-medium">
                    State/Province
                  </label>
                  <StateSelect
                    countryid={country?.id}
                    containerClassName="form-group"
                    inputClassName=""
                    onChange={handleStateChange}
                    onTextChange={(_txt) => console.log(_txt)}
                    defaultValue={currentState}
                    placeHolder="Select State"
                    id="state"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">
                      State is required
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="city" className="block text-sm font-medium">
                    City
                  </label>
                  <CitySelect
                    countryid={country?.id}
                    stateid={currentState?.id}
                    containerClassName="form-group"
                    inputClassName=""
                    onChange={handleCityChange}
                    onTextChange={(_txt) => console.log(_txt)}
                    placeHolder="Select City"
                    id="city"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      City is required
                    </p>
                  )}
                </div>
              </div>

              <div>
                <SubmitButton
                  title="Sign Up"
                  loadingTitle="Creating Please wait.."
                  loading={loading}
                  className="w-full"
                  loaderIcon={Loader2}
                  showIcon={false}
                />
              </div>
            </form>
            <p className="mt-6 text-sm text-gray-500">
              Already Registered ?{" "}
              <Link
                href="/login"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <CustomCarousel />
      </div>
    </div>
  );
}
