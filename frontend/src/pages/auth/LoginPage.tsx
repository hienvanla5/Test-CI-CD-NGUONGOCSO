import React from 'react';
import { Sprout } from 'lucide-react';
import { LoginForm } from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div
      className={
        'relative isolate grid min-h-screen min-h-dvh place-items-center overflow-hidden px-5 py-10 text-[#17351f] ' +
        'max-[520px]:items-start max-[520px]:overflow-y-auto max-[520px]:px-4 max-[520px]:py-7'
      }
      style={{
        background:
          'radial-gradient(circle at 50% 38%, rgba(255,255,255,.92) 0 18%, transparent 48%), linear-gradient(135deg, #f9f8ef 0%, #f5f3e8 48%, #fbfaf4 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-30 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(32deg, rgba(65,101,56,.05) 0 1px, transparent 1px 7px), repeating-linear-gradient(122deg, rgba(153,131,81,.04) 0 1px, transparent 1px 9px)',
          maskImage:
            'linear-gradient(to right, #000, transparent 42%, transparent 58%, #000)',
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -bottom-[28vw] -left-[17vw] -z-20 h-[min(58vw,720px)] w-[min(42vw,560px)] rotate-[15deg] rounded-[100%_0_100%_0] border border-[#4f743d]/10 opacity-70"
        style={{
          background:
            'repeating-radial-gradient(ellipse at 70% 70%, transparent 0 18px, rgba(76,112,58,.04) 19px 20px), linear-gradient(145deg, rgba(224,229,195,.28), rgba(255,255,255,.08))',
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -top-[33vw] -right-[20vw] -z-20 h-[min(58vw,720px)] w-[min(42vw,560px)] rotate-[195deg] rounded-[100%_0_100%_0] border border-[#4f743d]/10 opacity-70"
        style={{
          background:
            'repeating-radial-gradient(ellipse at 70% 70%, transparent 0 18px, rgba(76,112,58,.04) 19px 20px), linear-gradient(145deg, rgba(224,229,195,.28), rgba(255,255,255,.08))',
        }}
        aria-hidden="true"
      />

      <main className="flex w-full max-w-[430px] flex-col items-center">
        <div className="mb-[22px] text-center max-[520px]:mb-[18px]">
          <div
            className={
              'relative mx-auto mb-[13px] grid size-[82px] place-items-center rounded-full border border-[#37693a]/15 ' +
              'bg-linear-to-br from-[#f7fae9] to-[#e4efc9] shadow-[0_12px_34px_rgba(37,76,38,0.13)] ' +
              'after:absolute after:inset-[7px] after:rounded-full after:border after:border-dashed after:border-[#4b7c43]/25 ' +
              'max-[520px]:size-[72px]'
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
    </div>
  );
};

export default LoginPage;