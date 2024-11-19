"use client";

import { useState, useEffect } from "react";
import { cn } from "../../utils/utils";
import { useRouter } from "next/navigation";
import { hash } from "crypto";
import { encrypt } from "../../utils/encryption";

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isButtonLocked, setIsButtonLocked] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (email && password) {
      setIsButtonLocked(false); // Enable button when both fields are filled
    } else {
      setIsButtonLocked(true); // Keep button disabled if any field is empty
    }
  }, [email, password]);

  const register = () => {
    const encryptEmail = encrypt(email);
    const encryptPassword = encrypt(password);

    const url = `/classroom?email=${encryptEmail}&password=${encryptPassword}`;
    router.push(url);
  };

  return (
    <div className="flex flex-col bg-slate-50 pt-[150px] items-center justify-items-center min-h-screen p-[40px] font-[family-name:var(--font-geist-sans)]">
      <div className="mb-[30px]">
        <p className=" text-[32px] text-black font-bold">Register</p>
      </div>
      <div className="flex flex-col max-w-[500px] w-full">
        <div className="w-full">
          <p className="text-black text-[20px] font-medium">
            Email{" "}
            <span className="text-slate-500 text-[12px]">
              {" "}
              (Please use the same as google classroom)
            </span>
          </p>
          <div className=" bg-slate-200 p-[10px] rounded-[5px] my-[10px] max-w-[1000px] w-full">
            <input
              name="email"
              placeholder="Email"
              className=" text-[18px] text-black bg-transparent border-0 outline-none w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full mb-[20px]">
          <p className="text-black text-[20px] font-medium">Password</p>
          <div className=" bg-slate-200 p-[10px] rounded-[5px] my-[10px] max-w-[1000px] w-full">
            <input
              name="password"
              placeholder="Password"
              className=" text-[18px] text-black bg-transparent border-0 outline-none w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button
          className={cn(
            "w-full p-[10px] bg-[#041CDE] rounded-[5px] active:bg-[#6072ff] mt-[50px] disabled:bg-slate-500"
          )}
          disabled={isButtonLocked}
          onClick={register}
        >
          <p className="font-semibold text-white text-[18px]">Next</p>
        </button>
      </div>
    </div>
  );
}
