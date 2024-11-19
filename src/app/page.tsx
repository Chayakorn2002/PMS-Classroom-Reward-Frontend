"use client";

import { useEffect, useState } from "react";
import { cn } from "../utils/utils";
import {
  checkUserId,
  getLocalStorageWithExpiry,
  removeLocalStorage,
} from "../utils/routerUtils";

import { useRouter } from "next/navigation";
import axios from "axios";
import { Metadata } from "next";
import Loading from "@/component/loading";

// export const metadata: Metadata = {
//   title: {
//     absolute: "Welcome",
//   }
// }

export default function MainPage() {
  const percentToRedeemQr = 80;

  const router = useRouter();
  const [emailFromLocal, setEmailFromLocal] = useState<string>();
  const [profile, setProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = () => {
    removeLocalStorage("userEmail");
    router.push("/login");
  };

  useEffect(() => {
    const userEmail: string | null = getLocalStorageWithExpiry("userEmail");
    checkUserId(userEmail, router);
  
    if (userEmail) {
      setEmailFromLocal(userEmail);
      fetchProfile(userEmail);
    }
  }, [router]);
  
  useEffect(() => {
    if (profile) {
      fetchAssignments(profile.google_classroom_student_id, profile.course_id);
    }
  }, [profile]);
  
  const fetchProfile = async (email: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/get-user-profile-by-email`, {
        email,
      });
      setProfile(response.data.user_profile);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch profile");
    }
  };

  const fetchAssignments = async (student_id: string, course_id: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/assignments/list-student-assignment`, {
        student_id: student_id,
        course_id: course_id,
      });
      setAssignments(response.data.assignments);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch assignments");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-1 w-full bg-[#64d1e1] min-h-screen h-full">
      {(isLoading || !profile) ? (
        <div className="absolute flex w-full h-full items-center justify-center bg-black bg-opacity-50">
          <Loading />
        </div>
      ) : (
        <>
          <header className="fixed top-0 flex flex-row w-full h-[100px] bg-white p-[20px] justify-between items-center">
            <div className="flex flex-col h-full justify-center">
              <p className="text-black font-light text-[14px]">Welcome</p>
              <p className="text-black font-bold text-[18px]">
                {profile.firstname} {profile.lastname}
              </p>
              <p className="text-black font-light text-[14px]">{profile.email}</p>
            </div>
            <button
              className="flex active:underline underline-offset-4 decoration-red-500"
              onClick={logout}
            >
              <p className="text-red-500 text-[12px]">Log out</p>
            </button>
          </header>
          <div className="flex w-full flex-col p-[20px] gap-[20px] h-full mt-[100px]">
            {assignments.map((assignment, index) => {
              var maxPoint: string = "-";
              var score: string = "-";
              var scorePercent: string = "-";
              var canRedeemQr: boolean = false;
              if (!!assignment.max_points) {
                maxPoint = assignment.max_points.toString();
              }
              if (!!assignment.assigned_grade) {
                score = assignment.assigned_grade.toString();
              }
              if (
                !!assignment.max_points &&
                !!assignment.assigned_grade
              ) {
                const percent =
                  (assignment.assigned_grade / assignment.max_points) *
                  100;
                if (percent >= percentToRedeemQr) {
                  canRedeemQr = true;
                }
                scorePercent = percent.toPrecision(3).toString() + "%";
              }
              return (
                <div
                  key={index}
                  className="flex flex-row justify-between items-center w-full h-[100px] bg-white rounded-[10px] p-[20px]"
                >
                  <div className="flex flex-col text-black">
                    <p className="font-bold text-[18px]">
                      {assignment.title}
                    </p>
                    <p className="font-normal text-[20px]">
                      {score} / {maxPoint}
                    </p>
                    <p className="font-semibold text-[15px]">
                      {assignment.state}
                    </p> 
                  </div>
                  <button
                    disabled={!canRedeemQr}
                    onClick={() => console.log(scorePercent)}
                  >
                    <p
                      className={cn("font-bold text-[48px] text-gray-400", {
                        "text-green-500": canRedeemQr,
                      })}
                    >
                      {scorePercent}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}