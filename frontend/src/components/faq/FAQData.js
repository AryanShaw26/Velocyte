export const faqs = [
  {
    question: "How does AI Code Review work?",
    answer:
      "Velocyte connects to your GitHub repository, detects pull requests, analyzes the code diff using an AI model such as Gemini or GPT, and generates a quality score, security findings, performance suggestions, and best-practice recommendations."
  },

  {
    question: "Is my source code secure?",
    answer:
      "Yes. Velocyte uses secure GitHub OAuth authentication and only requests the permissions necessary for repository integration. Your code is processed securely and handled according to your configured privacy settings."
  },

  {
    question: "Can I connect multiple GitHub repositories?",
    answer:
      "Absolutely. You can connect multiple repositories across different projects and organizations, allowing your team to manage everything from one workspace."
  },

  {
    question: "Does Velocyte support real-time collaboration?",
    answer:
      "Yes. Team members receive live updates using WebSockets whenever tasks are created, moved, commented on, or assigned."
  },

  {
    question: "What analytics does Velocyte provide?",
    answer:
      "Velocyte tracks engineering velocity, pull request quality, cycle time, task completion trends, contribution heatmaps, and other productivity metrics to help teams identify bottlenecks."
  },

  {
    question: "Is there a free plan?",
    answer:
      "Yes. Velocyte offers a Starter plan for individuals and students. You can upgrade to the Professional or Enterprise plan whenever your team grows."
  }
];