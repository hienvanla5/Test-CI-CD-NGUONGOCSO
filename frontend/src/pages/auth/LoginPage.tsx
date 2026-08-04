import React from "react";
import { Sprout } from "lucide-react";
import { LoginForm } from "../../components/auth/LoginForm";
import { PublicBackground } from "@/components/layout/PublicBackground";

const LoginPage: React.FC = () => {
  return (
    <PublicBackground>
      <main className="flex w-full max-w-[430px] flex-col items-center z-10 my-auto px-4">
        {/* Logo + tên ứng dụng */}
        <div className="mb-[22px] text-center max-[520px]:mb-[18px]">
          <div
            className={
              "relative mx-auto mb-[13px] grid size-[82px] place-items-center rounded-full border border-[#37693a]/15 " +
              "bg-gradient-to-br from-[#f7fae9] to-[#e4efc9] shadow-[0_12px_34px_rgba(37,76,38,0.13)] " +
              "after:absolute after:inset-[7px] after:rounded-full after:border after:border-dashed after:border-[#4b7c43]/25 " +
              "max-[520px]:size-[72px]"
            }
            aria-hidden="true"
          >
            <Sprout className="size-[39px] stroke-[1.65] text-[#4f8b3d]" />
            <span className="absolute right-3.5 bottom-3 rounded-md bg-[#366f35] px-1 py-px text-[8px] font-bold tracking-[0.07em] text-white">
              NGS
            </span>
          </div>
          <h1 className="text-[clamp(1.55rem,5vw,1.9rem)] font-bold tracking-[-0.025em] text-[#173b20]">
            Nguồn Gốc Số
          </h1>
          <p className="mt-1 text-[0.82rem] text-[#647363]">
            Minh bạch hành trình · Kết nối niềm tin
          </p>
        </div>

        <LoginForm />

        <footer className="mt-[18px] text-center text-xs text-[#607061]">
          Hệ thống Truy xuất Nguồn gốc · Vì Nông nghiệp Xanh
        </footer>
      </main>
    </PublicBackground>
  );
};

export default LoginPage;