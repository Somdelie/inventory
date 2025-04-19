"use client";
import { Headset, Loader2, Lock, Mail, User, Building } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { UserProps } from "@/types/types";
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
import { toast } from "sonner";
import moment from "moment-timezone";
import { generateSlug } from "@/lib/generateSlug";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [country, setCountry] = useState<any>(null);
  const [currentState, setCurrentState] = useState<any>(null);
  const [city, setCity] = useState<any>(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserProps>();
  const router = useRouter();

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

  const generateCurrencyBasedOnSelectedCountry = (country: any) => {
    if (!country || !country.id) return "USD"; // Default to USD if no country selected

    // The react-country-state-city package already has currency information
    // We can access it through the country object
    const currencyCode = country.currency || "USD";

    console.log(`Country: ${country.name}, Currency: ${currencyCode}`);
    return currencyCode;
  };

  const getCountryISOCode = (country: any): string | null => {
    if (!country || !country.name) return null;

    // Check for iso2 property (this is the standard property in react-country-state-city)
    if (
      country.iso2 &&
      typeof country.iso2 === "string" &&
      country.iso2.length === 2
    ) {
      return country.iso2;
    }

    // Check if there's a direct isoCode property
    if (
      country.isoCode &&
      typeof country.isoCode === "string" &&
      country.isoCode.length === 2
    ) {
      return country.isoCode;
    }

    // Check if there's a code property
    if (
      country.code &&
      typeof country.code === "string" &&
      country.code.length === 2
    ) {
      return country.code;
    }

    // Check if the id contains the ISO code (common format is "country-XX")
    if (country.id && typeof country.id === "string") {
      // If id is in format "country-XX" or similar
      const matches = country.id.match(/[A-Za-z]{2}$/);
      if (matches && matches.length > 0) {
        return matches[0].toUpperCase();
      }
    }

    // Log the country object for debugging
    console.log("Unable to extract ISO code from country object:", country);

    return null;
  };

  const generateTimeZoneBasedOnSelectedCountry = (country: any) => {
    if (!country || !country.name) return "UTC"; // Default to UTC if no country is selected

    const isoCode = getCountryISOCode(country);
    if (!isoCode) {
      console.log(`Could not determine ISO code for ${country.name}`);
      return "UTC";
    }

    const timeZones = moment.tz.zonesForCountry(isoCode);
    if (!timeZones || timeZones.length === 0) {
      console.log(`No timezones found for ${country.name} (${isoCode})`);

      // Fallback to common timezones based on region
      const regionTimezones: { [key: string]: string } = {
        Africa: "Africa/Nairobi",
        Europe: "Europe/London",
        Asia: "Asia/Dubai",
        Americas: "America/New_York",
        Oceania: "Australia/Sydney",
      };

      return regionTimezones[country.region] || "UTC";
    }

    console.log(`Country: ${country.name}, Timezones:`, timeZones);
    return timeZones[0]; // Return the first timezone
  };

  async function onSubmit(data: UserProps) {
    setLoading(true);
    const organizationData = {
      name: data.organizationName,
      slug: generateSlug(data.organizationName),
      country: data.country,
      currency: generateCurrencyBasedOnSelectedCountry(country),
      timezone: generateTimeZoneBasedOnSelectedCountry(country),
    };
    try {
      const res = await createUser(data, organizationData);
      if (res.status === 409) {
        setLoading(false);
        setEmailErr(res.error);
      } else if (res.status === 200) {
        setLoading(false);
        toast.success("Account Created successfully");
        router.push(`/verify/${res?.data?.id}?email=${data.email}`);
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
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground text-sm">
              Create your{" "}
              <span className="text-rose-600">Somdelie Inventory</span> Account
              today to get started
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
                <TextInput
                  register={register}
                  errors={errors}
                  label="Organization Name"
                  name="organizationName"
                  icon={Building}
                  placeholder="Organization Name"
                  isRequired={false}
                />
                <div className="">
                  {emailErr && (
                    <p className="text-red-500 text-xs mt-2">{emailErr}</p>
                  )}
                </div>
              </div>
              <input
                type="hidden"
                {...register("country", { required: true })}
              />
              <input type="hidden" {...register("state", { required: true })} />
              <input type="hidden" {...register("city", { required: true })} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium"
                  >
                    Country
                  </label>
                  <CountrySelect
                    containerClassName="w-full"
                    inputClassName="border-slate-300 focus-visible:ring-rose-500 h-10"
                    onChange={handleCountryChange}
                    onTextChange={(_txt) => {}}
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
                    containerClassName="w-full"
                    inputClassName="border-slate-300 focus-visible:ring-rose-500 h-10"
                    onChange={handleStateChange}
                    onTextChange={(_txt) => {}}
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
                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium">
                    City
                  </label>
                  <CitySelect
                    countryid={country?.id}
                    stateid={currentState?.id}
                    containerClassName="w-full"
                    inputClassName="border-slate-300 focus-visible:ring-rose-500 h-10"
                    onChange={handleCityChange}
                    onTextChange={(_txt) => {}}
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
