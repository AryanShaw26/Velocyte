export default function StatCard({
title,
value,
change,
icon:Icon,
color
}){

return(

<div
className="
group
rounded-2xl
border
border-white/10
bg-white/[0.03]
p-5
backdrop-blur-xl
transition-all
duration-300
hover:-translate-y-2
hover:border-violet-500/40
hover:bg-white/[0.05]
hover:shadow-[0_0_30px_rgba(139,92,246,.15)]
"
>

<div className="flex items-start justify-between">

<div>

<p className="text-sm text-zinc-400">

{title}

</p>

<h2 className="mt-3 text-3xl font-bold">

{value}

</h2>

<p className="mt-2 text-sm text-green-400">

{change}

</p>

</div>

<div
className="
flex
h-12
w-12
items-center
justify-center
rounded-xl
bg-white/5
group-hover:scale-110
transition
"
>

<Icon className={color} size={22}/>

</div>

</div>

</div>

);

}