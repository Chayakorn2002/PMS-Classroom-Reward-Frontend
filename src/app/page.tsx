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
import Loading from "@/component/loading";

interface ModalProps {
  serialCode: string;
  onClose: () => void;
  onCopy: () => void;
}

interface ConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export default function MainPage() {
  const percentToRedeemQr = 80;

  const router = useRouter();
  const [emailFromLocal, setEmailFromLocal] = useState<string>();
  const [profile, setProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serialCode, setSerialCode] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

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

  const redeemReward = async (student_id: string, course_id: string, assignment_id: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/redeem/redeem-reward`, {
        student_id,
        course_id,
        assignment_id,
      });
      if (response.data.status === 1000) {
        setSerialCode(response.data.serial);
        setIsModalOpen(true);
      } else {
        alert("Failed to redeem reward");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while redeeming the reward");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(serialCode);
    alert("Serial code copied to clipboard");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    window.location.reload(); // Refresh the page
  };

  const handleConfirmRedemption = () => {
    if (selectedAssignment) {
      redeemReward(
        profile.google_classroom_student_id,
        profile.course_id,
        selectedAssignment.assignment_id
      ).then(() => {
        setIsConfirmModalOpen(false);
      });
    }
  };

  const Modal: React.FC<ModalProps> = ({ serialCode, onClose, onCopy }) => {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose} // Close modal when clicking the overlay
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg relative"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          <button className="absolute top-2 right-2 text-2xl" onClick={onClose}>
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">🎉 Reward Redeemed 🎉</h2>
          <p className="mb-4 text-center text-lg">Serial Code: <span className="font-mono text-pink-500">{serialCode}</span></p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition duration-300"
            onClick={onCopy}
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    );
  };

  const ConfirmModal: React.FC<ConfirmModalProps> = ({ onConfirm, onClose }) => {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose} // Close modal when clicking the overlay
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg relative"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          <button className="absolute top-2 right-2 text-2xl" onClick={onClose}>
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">Confirm Redemption</h2>
          <p className="mb-4 text-center text-lg">Are you sure you want to redeem this reward?</p>
          <div className="flex justify-between">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-1 w-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 min-h-screen h-full">
      {(isLoading || !profile) ? (
        <div className="absolute flex w-full h-full items-center justify-center bg-black bg-opacity-50">
          <Loading />
        </div>
      ) : (
        <>
          <header className="fixed top-0 flex flex-row w-full h-[100px] bg-white p-[20px] justify-between items-center shadow-lg">
            <div className="flex flex-col h-full justify-center">
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
              var canRedeemReward: boolean = false;
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
                  canRedeemReward = true;
                }
                scorePercent = percent.toPrecision(3).toString() + "%";
              }
              return (
                <div
                  key={index}
                  className="flex flex-row justify-between items-center w-full h-[130px] bg-white rounded-[10px] p-[20px] shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="flex flex-col text-black">
                    <p className="font-bold text-[24px] text-blue-600">
                      {assignment.title}
                    </p>
                    <p className="font-normal text-[22px] text-gray-500">
                      {score} / {maxPoint}
                    </p>
                    <p className="font-semibold text-[18px] text-green-600">
                      {assignment.state === "RETURNED" ? (
                        <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full">Returned</span>
                      ) : assignment.state === "REDEEMED" ? (
                        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Redeemed</span>
                      ) : (
                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{assignment.state}</span>
                      )}
                    </p>
                  </div>
                  <button
                    disabled={!canRedeemReward || assignment.state !== "RETURNED"}
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setIsConfirmModalOpen(true);
                    }}
                    className="flex items-center justify-center w-[100px] h-[100px]"
                  >
                    <p
                      className={cn("font-bold text-[36px] text-gray-400", {
                        "text-green-500": canRedeemReward && assignment.state === "RETURNED",
                        "text-blue-400": assignment.state === "REDEEMED",
                      })}
                    >
                      {scorePercent}
                    </p>
                  </button>
                </div>
              );
            })}
            {isModalOpen && (
              <Modal
                serialCode={serialCode}
                onClose={closeModal}
                onCopy={copyToClipboard}
              />
            )}
            {isConfirmModalOpen && (
              <ConfirmModal
                onConfirm={handleConfirmRedemption}
                onClose={() => setIsConfirmModalOpen(false)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}