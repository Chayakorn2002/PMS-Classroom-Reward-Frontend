import React, { Dispatch, SetStateAction } from "react";
import { cn } from "../../utils/utils";
import Loading from "@/component/loading";

interface ClassroomPageProps {
  isLoading: boolean;
  classroomsData: any[];
  selectedCourseIndex: number;
  setSelectedCourseIndex: Dispatch<SetStateAction<number>>;
  isButtonLocked: boolean;
  register: () => void;
}

const ClassroomPage: React.FC<ClassroomPageProps> = ({
  isLoading,
  classroomsData,
  selectedCourseIndex,
  setSelectedCourseIndex,
  isButtonLocked,
  register,
}) => {
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
};

export default ClassroomPage;