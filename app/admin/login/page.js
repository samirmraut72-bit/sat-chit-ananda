import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <LoginForm
      unauthorized={params?.error === "unauthorized"}
      signedOut={params?.signedOut === "1"}
    />
  );
}
