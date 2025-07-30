import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Layout,
  Calendar,
  BarChart,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import CompanyCarousel from "./company-carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import faqs from "@/data/faqs.json";

const VtoLogoutUsers = () => {
  const features = [
    {
      title: "Intuitive Kanban Boards",
      description:
        "Visualize your workflow and optimize team productivity with our easy-to-use Kanban boards.",
      icon: Layout,
    },
    {
      title: "Powerful Sprint Planning",
      description:
        "Plan and manage sprints effectively, ensuring your team stays focused on delivering value.",
      icon: Calendar,
    },
    {
      title: "Comprehensive Reporting",
      description:
        "Gain insights into your team's performance with detailed, customizable reports and analytics.",
      icon: BarChart,
    },
  ];
  const router = useRouter();
  return (
    <div className="min-h-screen ">
      {/* hero section */}
      <section className="container mx-auto py-20 text-center">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold flex flex-col pb-6 ">
          <span className="gradient-title">
            StreamLine Your Workflow
          </span>

          <span className="flex justify-center items-center gap-3 flex-wrap pt-1 ">
            <span className="gradient-title pb-3.5">with</span>
            <span className="bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent pb-3.5">
              ProjectRack
            </span>
          </span>
        </h1>

        <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-600 mb-6 mx-auto ">
          Empower Your Team with Effortless Task Management
        </p>
        <Link href="/onboarding">
          <Button size={"lg"} className="cursor-pointer">
            Get Started <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <Link href="#features">
          <Button variant="outline" size={"lg"} className="ml-4 cursor-pointer">
            Learn More <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* features section */}
      <section id="features" className="bg-gray-900 py-20 mt-30 px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">Key Features</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 mb-4 text-blue-300" />
                  <h4 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* company carousel */}
      <section className="py-20">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Trusted by Industry Leaders
          </h3>
          <CompanyCarousel />
        </div>
      </section>

      {/* faqs */}

      <section className="bg-gray-900 py-20 px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-5">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-6">
            Ready to Transform Your Workflow?
          </h3>
          <p className="text-xl mb-12">
            Join thousands of teams already using ProjectRack to streamline their
            projects and boost productivity.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="animate-bounce">
              Start For Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default VtoLogoutUsers;
