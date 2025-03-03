import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Img,
} from "@react-email/components";

type MagicLinkEmailProps = {
  actionUrl: string;
  firstName: string;
  mailType: "login" | "register";
  siteName: string;
};

export const MagicLinkEmail = ({
  firstName = "",
  actionUrl,
  mailType,
  siteName,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {mailType === "login"
        ? "Sign in to your account"
        : "Activate your account"}
    </Preview>
    <Tailwind>
      <Body className="bg-gray-50 font-sans p-4">
        <Container className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-sm">
          <Img
            src="https://nextpion.frs.com.my/logo.png"
            alt="Logo"
            className="m-auto mb-6 block w-48"
          />
          <Text className="text-center text-xl font-semibold text-gray-900">
            Hi {firstName},
          </Text>
          <Text className="mt-4 text-center text-base text-gray-700">
            Welcome to {siteName}! Click the button below to{" "}
            {mailType === "login" ? "sign in to" : "activate"} your account.
          </Text>
          <Section className="mt-8 text-center">
            <Button
              className="inline-block rounded-lg bg-black px-6 py-3 text-base font-semibold text-white no-underline hover:bg-white hover:text-black"
              href={actionUrl}
            >
              {mailType === "login" ? "Sign in" : "Activate Account"}
            </Button>
          </Section>
          <Text className="mt-6 text-center text-sm text-gray-500">
            This link expires in 24 hours and can only be used once.
          </Text>
          {mailType === "login" && (
            <Text className="mt-4 text-center text-sm text-gray-500">
              If you did not try to log into your account, you can safely ignore
              this email.
            </Text>
          )}
          <Hr className="my-6 border-t border-gray-200" />
          <Text className="text-center text-sm text-gray-500">
            If you have any questions, feel free to contact us at{" "}
            <a
              href="mailto:support@nextpion.frs.com.my"
              className="text-blue-600 hover:underline"
            >
              support@nextpion.com
            </a>
            .
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);