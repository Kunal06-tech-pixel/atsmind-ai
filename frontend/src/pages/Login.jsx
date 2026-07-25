import AuthCard from "../components/AuthCard";
import PageShell from "../components/ui/PageShell";

const Login = () => {
  return (
    <PageShell className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-12">
      <AuthCard />
    </PageShell>
  );
};

export default Login;
