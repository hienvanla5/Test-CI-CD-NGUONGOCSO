import React from "react";
import { LoginForm } from "../../components/auth/LoginForm";
import { PublicBackground } from "@/components/layout/PublicBackground";
import { Logo } from "@/components/common/Logo";

const LoginPage: React.FC = () => {
  return (
    <PublicBackground>
      <main className="flex w-full max-w-[430px] flex-col items-center z-10 my-auto px-4">
        {/* Brand Logo */}
        <div className="mb-10 flex justify-center">
          <Logo
            height={150}
            showText={false}
            className="w-auto max-w-[360px]"
          />
        </div>

        <LoginForm />
      </main>
    </PublicBackground>
  );
};

export default LoginPage;