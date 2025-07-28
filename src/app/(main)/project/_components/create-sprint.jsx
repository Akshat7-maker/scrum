"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { format, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { createSprint } from "@/actions/Sprints";
import useFetch from "@/hooks/use-fetch";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

const CreateSprint = ({
  projectTitle,
  projectId,
  projectKey,
  sprintKey,
  onSprintCreated,
}) => {
  const [showform, setShowForm] = React.useState(false);

  const createSprint = async (projectId, data) => {
    const sprint = await axios.post(`/api/sprints/createSprint`, { projectId, data });
    return sprint.data;
  }
  const {
    loading: sprintLoading,
    error,
    data: sprint,
    fn: createSprintFn,
  } = useFetch(createSprint);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      name: `${projectKey}-${sprintKey}`,
      dateRange: {
        from: new Date(),
        to: addDays(new Date(), 7),
      },
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await createSprintFn(projectId, data);
      if (result) {
        setShowForm(false);
        toast.success("Sprint created successfully");
        router.refresh();
        onSprintCreated();
      }
    } catch (err) {
      toast.error("Failed to create sprint");
    }
  };

  return (
    <>
      <div className="flex justify-between p-4 ">
        <h1 className="text-5xl font-bold mb-8 gradient-title">
          {projectTitle}
        </h1>

        <Button
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mt-2 cursor-pointer hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
          onClick={() => setShowForm(!showform)}
        >
          {showform ? "Cancel" : "Create Sprint"}
        </Button>
      </div>

      {showform && (
        <Card className="pt-4 mb-4">
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex gap-4 items-end"
            >
              {/* Sprint Name */}
              <div className="flex-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Sprint Name
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  readOnly
                  className="bg-slate-950"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Date Range Picker */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Sprint Duration
                </label>
                <Controller
                  control={control}
                  name="dateRange"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal bg-slate-950 pointer-cursor ${
                            field.value?.from && field.value?.to
                              ? "text-white"
                              : "text-slate-400"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from && field.value?.to ? (
                            format(field.value.from, "LLL dd, y") +
                            " - " +
                            format(field.value.to, "LLL dd, y")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto bg-slate-900"
                        align="start"
                      >
                        <DayPicker
                          className=""
                          classNames={{
                            chevron: "fill-blue-500",
                            range_start: "bg-blue-700",
                            range_end: "bg-blue-700",
                            range_middle: "bg-blue-400",
                            day_button: "border-none",
                            today: "border-2 border-blue-700",
                            
                          }}
                          mode="range"
                          disabled={[{ before: new Date() }]}
                          selected={field.value}
                          onSelect={(range) => {
                            if (range?.from && range?.to) {
                              field.onChange(range);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <Button type="submit" disabled={sprintLoading} className={"cursor-pointer"}>
                {sprintLoading ? "Creating..." : "Create Sprint"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CreateSprint;
