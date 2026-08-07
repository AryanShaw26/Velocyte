import { Check } from "lucide-react";

export const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    badge: "",
    highlighted: false,
    description: "Perfect for individuals and students.",

    features: [
      "1 Workspace",
      "3 Team Members",
      "Basic Kanban Board",
      "50 AI Code Reviews / month",
      "GitHub Integration",
      "Community Support",
    ],

    button: "Get Started",
  },

  {
    name: "Professional",
    price: "₹999",
    duration: "/month",
    badge: "Most Popular",
    highlighted: true,
    description: "Built for startups and growing engineering teams.",

    features: [
      "Unlimited Workspaces",
      "Unlimited Members",
      "Unlimited AI Reviews",
      "Advanced Analytics",
      "Priority Email Support",
      "GitHub Sync",
      "Real-time Collaboration",
      "PR Review History",
    ],

    button: "Start Free Trial",
  },

  {
    name: "Enterprise",
    price: "Custom",
    badge: "",
    highlighted: false,
    description: "For large engineering organizations.",

    features: [
      "Everything in Pro",
      "Dedicated AI Models",
      "SSO Authentication",
      "Custom Integrations",
      "Dedicated Support",
      "On-premise Deployment",
    ],

    button: "Contact Sales",
  },
];