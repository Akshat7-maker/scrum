"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { deleteProject } from "@/actions/Project";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import toast from "react-hot-toast";

export default function DeleteProject({ projectId, ondelete }) {
  const { membership } = useOrganization();
  const router = useRouter();

  const deleteProject = async (projectId) => {
    const project = await axios.delete(`/api/project/delete?projectId=${projectId}`);
    return project.data;
  };

  const {
    loading: isDeleting,
    error,
    fn: deleteProjectFn,
    data: deleted,
  } = useFetch(deleteProject);

  const isAdmin = membership?.role === "org:admin";

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProjectFn(projectId);
    }
  };

  useEffect(() => {
    if (deleted) {
      ondelete();
      toast.success("Project deleted successfully");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleted]);

  if (!isAdmin) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`${isDeleting ? "animate-pulse" : ""}`}
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {/* {error && <p className="text-red-500 text-sm">{error.message}</p>} */}
    </>
  );
}
