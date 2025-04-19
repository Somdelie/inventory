import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerifyEmailProps {
  verificationCode?: string;
}

export default function VerifyEmail({
  verificationCode = "596853",
}: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code: {verificationCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://9tf4o9l5yt.ufs.sh/f/2L7IdLt9oQb12Gd8GVt9oQb1MTkVzGY5hFaiNqne8tPR4lWB"
              width={180}
              height={60}
              alt="Somdelie Inventory"
              style={logo}
            />
          </Section>

          <Section style={contentContainer}>
            <Heading style={h1}>Verify Your Email Address</Heading>

            <Text style={paragraph}>
              Thanks for starting the Somdelie Inventory account creation
              process. To complete your registration, please enter the
              verification code below when prompted.
            </Text>

            <Section style={codeContainer}>
              <Text style={codeLabel}>Your verification code</Text>
              <Text style={code}>{verificationCode}</Text>
              <Text style={codeExpiry}>This code expires in 10 minutes</Text>
            </Section>

            <Text style={paragraph}>
              If you didn't request this code, you can safely ignore this email.
            </Text>

            <Hr style={divider} />

            <Text style={securityNote}>
              <strong>Security tip:</strong> Somdelie Inventory will never ask
              you to share your password or verification code via email, phone,
              or message.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Somdelie Inventory. All rights
              reserved.
            </Text>
            <Text style={footerLinks}>
              <Link
                href="https://somdelieinventory.com/privacy"
                style={footerLink}
              >
                Privacy Policy
              </Link>{" "}
              •
              <Link
                href="https://somdelieinventory.com/terms"
                style={footerLink}
              >
                {" "}
                Terms of Service
              </Link>{" "}
              •
              <Link
                href="https://somdelieinventory.com/contact"
                style={footerLink}
              >
                {" "}
                Contact Us
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "20px 0",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const logoContainer = {
  backgroundColor: "#000000",
  padding: "24px 0",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const contentContainer = {
  padding: "32px 40px",
};

const h1 = {
  color: "#111111",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#444444",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const codeContainer = {
  background: "#f9f9f9",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
  textAlign: "center" as const,
  border: "1px solid #f0f0f0",
};

const codeLabel = {
  color: "#666666",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 8px 0",
};

const code = {
  color: "#f43f5e", // rose-500
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "4px",
  margin: "16px 0",
  padding: "8px 0",
  borderRadius: "4px",
};

const codeExpiry = {
  color: "#666666",
  fontSize: "14px",
  fontStyle: "italic",
  margin: "8px 0 0 0",
};

const divider = {
  border: "none",
  borderTop: "1px solid #eaeaea",
  margin: "32px 0",
};

const securityNote = {
  backgroundColor: "#fff8f8",
  border: "1px solid #ffebeb",
  borderLeft: "4px solid #f43f5e", // rose-500
  borderRadius: "4px",
  color: "#444444",
  fontSize: "14px",
  lineHeight: "20px",
  padding: "16px",
  margin: "24px 0 0 0",
};

const footer = {
  backgroundColor: "#f9f9f9",
  padding: "24px 40px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#666666",
  fontSize: "14px",
  margin: "0 0 16px 0",
};

const footerLinks = {
  color: "#666666",
  fontSize: "14px",
  margin: "0",
};

const footerLink = {
  color: "#f43f5e", // rose-500
  textDecoration: "none",
};
