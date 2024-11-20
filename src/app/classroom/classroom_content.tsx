"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { setLocalStorageWithExpiry } from "../../utils/routerUtils";
import { decrypt } from "../../utils/encryption";
import axios from "axios";
import ClassroomPage from "./classroom_page";
import Loading from "@/component/loading";

const ClassroomContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCourseIndex, setSelectedCourseIndex] = useState<number>(-1);
  const [email, setEmail] = useState<string | null>("");
  const [password, setPassword] = useState<string | null>("");
  const [isButtonLocked, setIsButtonLocked] = useState<boolean>(true);
  const [classroomsData, setClassroomsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCourseIndex >= 0) {
      setIsButtonLocked(false);
    }
  }, [selectedCourseIndex]);

  useEffect(() => {
    setEmail(searchParams.get("email"));
    setPassword(searchParams.get("password"));
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
      console.error(error);
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
            alert("Your email is not registered in the course %s".replace("%s", selectedCourse.name));
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
    <ClassroomPage
      isLoading={isLoading}
      classroomsData={classroomsData}
      selectedCourseIndex={selectedCourseIndex}
      setSelectedCourseIndex={setSelectedCourseIndex}
      isButtonLocked={isButtonLocked}
      register={register}
    />
  );
};

export default ClassroomContent;