"use client";

import { useState, useEffect, useMemo, createContext, useContext } from "react";
import Image from "next/image";
import Link from "next/link";

import {
Search,
MapPin,
CalendarDays,
DollarSign,
Star,
Users,
CheckCircle,
Sparkles
} from "lucide-react";

import { getServices } from "@/services/api";

type Service = {
id: number | string;
name: string;
description?: string;
price?: number | string;
currency?: string;
avg_rating?: number;
image_url?: string;
};

const DarkModeContext = createContext({
darkMode: true,
toggleDarkMode: () => {}
});

const ServiceCard = ({ service }: { service: Service }) => {

const { darkMode } = useContext(DarkModeContext);

const card = darkMode
? "bg-black/70 border border-white/20"
: "bg-white/70 border border-black/20";

return (

<div className={`${card} rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition`}>

<div className="relative h-56">

<Image
src={
service.image_url ||
`https://source.unsplash.com/600x400/?${encodeURIComponent(service.name)}`
}
alt={service.name}
fill
className="object-cover"
/>

</div>

<div className="p-6">

<h3 className="text-xl font-semibold mb-2">
{service.name}
</h3>

<p className="text-gray-400 mb-4">
{service.description || "Professional Service"}
</p>

<div className="flex justify-between mb-4">

<div className="flex items-center gap-2">

<DollarSign size={16} />

{service.price ?? 0} {service.currency ?? "USD"}

</div>

<div className="flex items-center gap-1">

<Star size={16} />

{service.avg_rating ?? 0}

</div>

</div>

<Link
href={`/service/${service.id}`}
className={`${
darkMode
? "bg-white text-black"
: "bg-black text-white"
} w-full py-3 rounded-xl text-center block`}
>

Book Now

</Link>

</div>

</div>

);

};

export default function HomePage() {

const [services,setServices] = useState<Service[]>([]);
const [loading,setLoading] = useState(true);
const [darkMode,setDarkMode] = useState(true);

const [searchTerm,setSearchTerm] = useState("");
const [location,setLocation] = useState("");
const [date,setDate] = useState("");

useEffect(()=>{

const saved = localStorage.getItem("darkMode");

if(saved) setDarkMode(saved === "true");

},[]);

useEffect(()=>{

localStorage.setItem("darkMode",darkMode.toString());

},[darkMode]);

useEffect(()=>{

const fetchData = async()=>{

try{

const list = await getServices();

setServices(list);

}catch(err){

console.error("Error loading services",err);

}finally{

setLoading(false);

}

};

fetchData();

},[]);

const filteredServices = useMemo(()=>{

let filtered = services.filter(s=>
s.name.toLowerCase().includes(searchTerm.toLowerCase())
);

if(location){

filtered = filtered.filter(s=>
(s.description || "")
.toLowerCase()
.includes(location.toLowerCase())
);

}

return filtered;

},[searchTerm,location,services]);

const bg = darkMode
? "bg-black text-white"
: "bg-white text-black";

const card = darkMode
? "bg-black/70 border border-white/20"
: "bg-white/70 border border-black/20";

return (

<DarkModeContext.Provider
value={{
darkMode,
toggleDarkMode:()=>setDarkMode(!darkMode)
}}
>

<main className={`${bg} transition-colors duration-500`}>

{/* HERO */}

<section className="relative h-[80vh] flex items-center justify-center overflow-hidden">

<Image
src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
alt="hero"
fill
className="object-cover scale-105"
/>

<div className="absolute inset-0 bg-black/70"/>

<div className="relative z-10 text-center max-w-4xl px-6">

{/* ICON STEPS */}

<div className="grid grid-cols-3 gap-6 mb-12">

<div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl hover:scale-110 transition">

<Search size={36} className="mx-auto text-blue-400 mb-3"/>

<h3 className="font-semibold text-lg">
Discover
</h3>

</div>

<div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl hover:scale-110 transition">

<Star size={36} className="mx-auto text-yellow-400 mb-3"/>

<h3 className="font-semibold text-lg">
Choose
</h3>

</div>

<div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl hover:scale-110 transition">

<CalendarDays size={36} className="mx-auto text-purple-400 mb-3"/>

<h3 className="font-semibold text-lg">
Book
</h3>

</div>

</div>

{/* SEARCH BAR */}

<div className={`${card} backdrop-blur-lg p-5 rounded-3xl flex flex-col md:flex-row gap-4 shadow-lg`}>

<div className="flex items-center gap-3 rounded-xl px-4 py-3 flex-1 border border-white/10">

<Search size={18}/>

<input
placeholder="Search Service"
value={searchTerm}
onChange={e=>setSearchTerm(e.target.value)}
className="bg-transparent outline-none w-full"
/>

</div>

<div className="flex items-center gap-3 rounded-xl px-4 py-3 flex-1 border border-white/10">

<MapPin size={18}/>

<input
placeholder="Location"
value={location}
onChange={e=>setLocation(e.target.value)}
className="bg-transparent outline-none w-full"
/>

</div>

<div className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/10">

<CalendarDays size={18}/>

<input
type="date"
value={date}
onChange={e=>setDate(e.target.value)}
className="bg-transparent outline-none"
/>

</div>

<Link
href="/services"
className={`${
darkMode
? "bg-white text-black"
: "bg-black text-white"
} px-6 py-3 rounded-xl font-semibold`}
>

Search

</Link>

</div>

</div>

</section>

{/* SERVICES */}

<section className="max-w-7xl mx-auto px-6 py-24">

<h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
Top Services
</h2>

{loading ? (

<div className="grid md:grid-cols-3 gap-8">

{[...Array(6)].map((_,i)=>(
<div
key={i}
className="h-80 rounded-2xl animate-pulse bg-gray-700/50"
/>
))}

</div>

):( 

<div className="grid md:grid-cols-3 gap-8">

{filteredServices.map(s=>(
<ServiceCard key={s.id} service={s}/>
))}

</div>

)}

</section>

{/* STATS */}

<section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-8 text-center">

<div className={`${card} rounded-3xl p-10`}>

<Users className="mx-auto mb-4" size={40}/>

<h3 className="text-4xl font-bold">
500+
</h3>

<p className="text-gray-400 mt-2">
Professional Providers
</p>

</div>

<div className={`${card} rounded-3xl p-10`}>

<CheckCircle className="mx-auto mb-4" size={40}/>

<h3 className="text-4xl font-bold">
1200+
</h3>

<p className="text-gray-400 mt-2">
Bookings Completed
</p>

</div>

<div className={`${card} rounded-3xl p-10`}>

<Sparkles className="mx-auto mb-4" size={40}/>

<h3 className="text-4xl font-bold">
99%
</h3>

<p className="text-gray-400 mt-2">
Customer Satisfaction
</p>

</div>

</section>

</main>

</DarkModeContext.Provider>

);

}