import { Suspense } from "react";
import Loading from "@/component/loading";
import ClassroomContent from "./classroom_content";

const Classroom = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ClassroomContent />
    </Suspense>
  );
};

export default Classroom;