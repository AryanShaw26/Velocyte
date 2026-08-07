import {
  Brain,
  FolderKanban,
  BarChart3,
  Bell,
  Users,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

export const features = [
  {
    icon: Brain,
    title: "AI Code Review",
    description:
      "Review GitHub pull requests with AI. Detect bugs, security issues, performance bottlenecks, and receive actionable suggestions.",
  },
  {
    icon: FolderKanban,
    title: "Smart Project Management",
    description:
      "Manage projects with intuitive Kanban boards, labels, due dates, priorities, and milestones.",
  },
{
  icon: FaGithub,
  title: "GitHub Integration",
  description:
    "Connect repositories, track pull requests, commits, branches, and synchronize your development workflow.",
},
  {
    icon: BarChart3,
    title: "Engineering Analytics",
    description:
      "Measure velocity, cycle time, PR quality, contribution heatmaps, and identify project bottlenecks.",
  },
  {
    icon: Bell,
    title: "Real-Time Collaboration",
    description:
      "Receive live updates, mentions, comments, and notifications using WebSockets.",
  },
  {
    icon: Users,
    title: "Organization Management",
    description:
      "Invite members, assign roles, manage permissions, and organize multiple engineering teams.",
  },
];