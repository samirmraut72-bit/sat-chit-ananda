import ScannerLoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function ScannerLoginPage({
  searchParams,
}) {
  const params = await searchParams;

  return (
    <ScannerLoginForm
      unauthorized={params?.error === "unauthorized"}
      signedOut={params?.signedOut === "true"}
    />
  );
}