export default function FiltroCategoriaCard(){
    return(
        <div className="bg-[#FFB703] rounded-2xl p-5 flex flex-col justify-between h-48 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
            <h3 className="font-extrabold text-lg text-[#1E1E24] z-10">Hamburguesas</h3>
            <div className="absolute bottom-2 right-2 w-28 h-28 flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <img src="" alt="Hamburguesa" className="w-full h-full object-contain" />
            </div>
        </div>
    )
}