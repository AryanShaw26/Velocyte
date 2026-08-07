import {
    FolderKanban,
    ListTodo,
    GitPullRequest,
    Bot
} from "lucide-react";

export const stats = [

{
title:"Projects",
value:"12",
change:"+3 this week",
icon:FolderKanban,
color:"text-violet-400"
},

{
title:"Open Tasks",
value:"48",
change:"+12 today",
icon:ListTodo,
color:"text-cyan-400"
},

{
title:"Pull Requests",
value:"16",
change:"+5 pending",
icon:GitPullRequest,
color:"text-yellow-400"
},

{
title:"AI Reviews",
value:"24",
change:"+18%",
icon:Bot,
color:"text-green-400"
}

];