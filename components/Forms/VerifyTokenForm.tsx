"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { resendVerificationCode, updateUserById } from "@/actions/users";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FormSchema = z.object({
  otp: z.string().min(6, {
    message: "Your verification code must be 6 digits.",
  }),
});

export default function VerifyTokenForm({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();
  const userToken = 123456; // Replace with the actual token logic or value
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);

    try {
      // Remove the client-side validation and let the server handle it
      const result = await updateUserById(userId, data.otp);

      if (result && "error" in result && result.error) {
        setShowNotification(true);
        toast.error(result.error || "Invalid verification code");
      } else {
        setShowNotification(false);
        toast.success("Account verified successfully");
        router.push("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  }

  // Function to mask email for privacy
  const maskEmail = (email: string) => {
    const [username, domain] = email.split("@");
    const maskedUsername =
      username.charAt(0) +
      "*".repeat(Math.max(1, username.length - 2)) +
      username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  const resendOtp = async () => {
    try {
      const otp = await resendVerificationCode(email);
      console.log(otp);
    } catch (error) {
      console.log(error);
      toast.error("Failed to resend verification code");
    }
    toast.success("Verification code resent successfully");
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Verify Your Account
          </CardTitle>
          <CardDescription className="text-center">
            We've sent a verification code to {maskEmail(email)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showNotification && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid Code</AlertTitle>
              <AlertDescription>
                The verification code you entered is incorrect. Please try
                again.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-center block">
                      Enter verification code
                    </FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} {...field} className="gap-2">
                          <InputOTPGroup>
                            <InputOTPSlot index={0} className="h-12 w-12" />
                            <InputOTPSlot index={1} className="h-12 w-12" />
                            <InputOTPSlot index={2} className="h-12 w-12" />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} className="h-12 w-12" />
                            <InputOTPSlot index={4} className="h-12 w-12" />
                            <InputOTPSlot index={5} className="h-12 w-12" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>

                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Account
                  </>
                )}
              </Button>
              <FormDescription className="text-center text-sm text-sky-700">
                If you didn't receive a verification code, check your spam
                folder or call +27 603 121 981 for assistance with onboarding.
              </FormDescription>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Didn't receive a code?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              type="button"
              onClick={resendOtp}
            >
              Resend Code
            </Button>
          </div>
          <div className="text-xs text-center text-muted-foreground">
            The code will expire in 10 minutes
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
