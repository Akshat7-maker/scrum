"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import DeleteProject from "./delete-project";
import { useRouter } from "next/navigation";

import { BarLoader } from "react-spinners";

function Projectlist({ projects, ondelete }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Optional loading state if you want to use it later
  const handleLink = (projectId) => {
    setLoading(true);
    router.push(`/project/${projectId}`);
  };

  if (loading) {
    return <BarLoader color="#36d7b7" width="100%" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {project.name}
              <DeleteProject projectId={project.id} ondelete={ondelete} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">{project.description}</p>
            <Link
              onClick={() => setLoading(true)}
              href={`/project/${project.id}`}
              className="text-blue-500 hover:underline"
            >
              View Project
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Projectlist;
