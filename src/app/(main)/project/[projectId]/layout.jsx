import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default function ProjectLayout({ children }) {
    return (
        <div className="mx-auto">

        <Suspense fallback={<BarLoader width={"100%"} color={"#3b82f6"} />}>
            {children}
        </Suspense>
        </div>
    );
}