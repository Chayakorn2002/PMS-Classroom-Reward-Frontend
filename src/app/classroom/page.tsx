"use client";

import { useState, useEffect } from "react";
import { cn } from "../../utils/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { setLocalStorageWithExpiry } from "../../utils/routerUtils";
import { decrypt } from "../../utils/encryption";
import axios from "axios";
import Loading from "@/component/loading";

export default function Classroom() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const password = searchParams.get("password");
  const [selectedCourseIndex, setSelectedCourseIndex] = useState<number>(-1);
  const [isButtonLocked, setIsButtonLocked] = useState<boolean>(true);
  const [classroomsData, setClassroomsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCourseIndex >= 0) {
      setIsButtonLocked(false);
    }
  }, [selectedCourseIndex]);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/courses/list-courses`
      );
      const data = response.data;
      if (Array.isArray(data.courses)) {
        setClassroomsData(data.courses);
      } else {
        console.error("Expected an array but got:", data.courses);
      }
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async () => {
    if (email && password && selectedCourseIndex >= 0) {
      const decryptedEmail = decrypt(email);
      const decryptedPassword = decrypt(password);
      const selectedCourse = classroomsData[selectedCourseIndex];
      const courseId = selectedCourse.id;

      try {
        setIsLoading(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/register-student`,
          {
            email: decryptedEmail,
            password: decryptedPassword,
            course_id: courseId,
          }
        );
        console.log(response.data);
        setLocalStorageWithExpiry("userEmail", decryptedEmail, 3600 * 1000);
        router.push("/");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data;
          if (errorData.error.code === 100003) {
            alert("User already exists");
          } else if (errorData.error.code === 100004) {
            alert("Email not found");
          } else {
            alert(`Error: ${errorData.error.message}`);
          }
        } else {
          console.log(error);
          alert("An unexpected error occurred");
        }
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 items-center justify-items-center px-[40px] h-screen font-[family-name:var(--font-geist-sans)]">
      {isLoading && (
        <div className="absolute flex w-full h-full items-center justify-center bg-black bg-opacity-50">
          <Loading />
        </div>
      )}
      <div className="mb-[30px] mt-[50px]">
        <p className=" text-[20px] text-black font-bold">
          Select Your Classroom
        </p>
      </div>
      <div className="flex flex-col flex-1 w-full max-w-[500px] items-center gap-[10px] overflow-hidden overflow-y-scroll max-h-[600px]">
        {classroomsData.map((item, index) => {
          var isSelected: boolean = false;
          if (index === selectedCourseIndex) {
            isSelected = true;
          }
          return (
            <button
              key={index}
              className="flex w-full items-start"
              onClick={() => setSelectedCourseIndex(index)}
            >
              <div
                key={index}
                className={cn(
                  "w-full justify-items-start bg-slate-300 text-slate-800 h-[80px] rounded-[5px] p-[10px]",
                  { "bg-[#6072ff] text-white": isSelected }
                )}
              >
                <p className="text-[20px] font-bold">{item.name}</p>
                <p className="text-[14px] font-normal">{item.section}</p>
              </div>
            </button>
          );
        })}
      </div>
      <button
        className={cn(
          "w-full p-[10px] bg-[#041CDE] rounded-[5px] active:bg-[#6072ff] mt-[50px] disabled:bg-slate-500 max-w-[500px]"
        )}
        disabled={isButtonLocked}
        onClick={register}
      >
        <p className="font-semibold text-white text-[18px]">Next</p>
      </button>
    </div>
  );
}
