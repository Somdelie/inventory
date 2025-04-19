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

interface InvitationEmailProps {
  organizationName?: string;
  roleName: string;
  linkUrl: string;
}

export const UserInvitation = ({
  organizationName,
  roleName,
  linkUrl,
}: InvitationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        Invitation to Join {organizationName || "our organization"} as{" "}
        {roleName}
      </Preview>
      <Container style={container}>
        <Section style={headerSection}>
          <Img
            src="https://9tf4o9l5yt.ufs.sh/f/2L7IdLt9oQb1KJJTDVuv7hUVZAlMLyjeaIoJNDFtQ0wps6fY"
            width={400}
            height={120}
            alt="Organization Logo"
            style={logo}
          />
        </Section>
        <Section style={contentSection}>
          <Heading style={h1}>
            Invitation to Join {organizationName} as {roleName}
          </Heading>
          <Text style={heroText}>Hello,</Text>
          <Text style={paragraph}>
            You have been invited to join <strong>{organizationName}</strong> as
            our new <strong>{roleName}</strong>. We're excited to welcome you to
            our team!
          </Text>
          <Text style={paragraph}>
            To complete your registration and customize your account, please
            click the button below. This will allow you to set up your password
            and configure your profile according to your preferences.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={linkUrl}>
              Complete Your Registration
            </Button>
          </Section>
          <Text style={paragraph}>
            Please complete your registration within 7 days of receiving this
            invitation. If you have any questions about this process or your
            role, feel free to contact us at support@
            {organizationName?.toLowerCase().replace(/\s+/g, "")}.com.
          </Text>
          <Text style={paragraph}>We look forward to having you on board!</Text>
          <Hr style={hr} />
          <Text style={footerText}>
            If you didn't request this invitation, you can safely ignore this
            email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default UserInvitation;

const logo = {
  width: 400,
  height: 120,
  margin: "0 auto",
  display: "block",
};

const main = {
  backgroundColor: "#f8f8f8",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const headerSection = {
  padding: "25px 0",
  textAlign: "center" as const,
};

const contentSection = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  borderLeft: "4px solid #f43f5e",
};

const h1 = {
  color: "#111111",
  fontSize: "30px",
  fontWeight: "700",
  margin: "0 0 30px",
  padding: "0",
  lineHeight: "1.3",
  textAlign: "center" as const,
};

const heroText = {
  fontSize: "20px",
  lineHeight: "28px",
  marginBottom: "25px",
  color: "#111111",
};

const paragraph = {
  margin: "0 0 24px",
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#222222",
};

const buttonContainer = {
  padding: "12px 0 30px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#f43f5e", // rose-500
  borderRadius: "6px",
  fontWeight: "600",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
  boxShadow: "0 4px 6px rgba(244, 63, 94, 0.25)",
};

const hr = {
  borderColor: "#f1f1f1",
  margin: "30px 0 20px",
};

const footerText = {
  fontSize: "14px",
  color: "#444444",
  textAlign: "center" as const,
};
