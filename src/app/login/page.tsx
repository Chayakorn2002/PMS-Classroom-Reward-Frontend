"use client";

import { useState, useEffect } from "react";
import { cn } from "../../utils/utils";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { setLocalStorageWithExpiry } from "../../utils/routerUtils";
import { FadeLoader } from "react-spinners";
import Loading from "@/component/loading";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isButtonLocked, setIsButtonLocked] = useState<boolean>(true);
  const [isLoginFailed, setIsLoginFailed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (email && password) {
      setIsButtonLocked(false); // Enable button when both fields are filled
    } else {
      setIsButtonLocked(true); // Keep button disabled if any field is empty
    }
  }, [email, password]);

  const login = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/login-student`,
        {
          email,
          password,
        }
      );
      console.log(response.data);

      setLocalStorageWithExpiry("userEmail", email, 3600 * 1000);
      router.push("/");
    } catch (error) {
      setIsLoading(false);
      setIsLoginFailed(true);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 items-center justify-items-center min-h-screen px-[40px] font-[family-name:var(--font-geist-sans)]">
      {isLoading && (
        <div className="absolute flex w-full h-full items-center justify-center bg-black bg-opacity-50">
          <Loading />
        </div>
      )}
      <div className="mb-[30px] pt-[150px] ">
        <p className=" text-[32px] text-black font-bold">Login</p>
      </div>
      <div className="flex flex-col flex-1 w-full max-w-[500px] items-center">
        <div className="flex flex-col w-full">
          <p className="text-black text-[20px] font-medium">Email </p>
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
        <div className="flex flex-col w-full">
          <p className="text-black text-[20px] font-medium">Password</p>
          <div className=" bg-slate-200 p-[10px] rounded-[5px] my-[10px] max-w-[1000px] w-full">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className=" text-[18px] text-black bg-transparent border-0 outline-none w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="h-[20px]">
          {isLoginFailed && (
            <p className="text-[16px] text-red-500">
              Email or password is incorrect
            </p>
          )}
        </div>
        <button
          className={cn(
            "w-full p-[10px] bg-[#041CDE] rounded-[5px] active:bg-[#6072ff] mt-[50px] disabled:bg-slate-500"
          )}
          disabled={isButtonLocked}
          onClick={login}
        >
          <p className="font-semibold text-white text-[18px]">Next</p>
        </button>

        <div className="w-fit mt-[10px]">
          <p className="text-[16px] text-black">
            No account?
            <span>
              <Link href="/register" className="text-[#041CDE] ml-[5px]">
                Register Here
              </Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
