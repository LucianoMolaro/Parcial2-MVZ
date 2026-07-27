// ()={ return (
//                 <div 
//                   key={cat.id}
//                   className="bg-white rounded-xl p-3.5 border border-gray-100/70 shadow-xs flex items-center justify-between gap-2 transition-all duration-200 hover:shadow-sm"
//                 >
//                   {/* Info izquierda */}
//                   <div className="flex items-center space-x-4 min-w-0 flex-col-2">
//                     <img src="https://www.banderasvdk.com/blog/wp-content/uploads/Bandera-Suiza.jpg" alt="" className='w-16 h-16'/>
//                     <div className="min-w-0 w-11/12">
//                       <h3 className="text-s font-extrabold text-[#1E1E24] leading-tight truncate">
//                         {cat.nombre}
//                       </h3>
//                       <div className='flex items-center gap-1'>
//                         <p className="text-[10px] text-stone-500 font-medium">
//                           Creada:
//                         </p>
//                         <span className='font-semibold text-[11px] text-stone-700'>23 Junio a las 13hs</span>
//                       </div>
//                       <div className='flex items-center gap-1'>
//                         <p className="text-[10px] text-stone-500 font-medium">
//                           Últ.vez editada:
//                         </p>
//                         <span className='font-semibold text-[11px] text-stone-700'>23 Junio a las 13hs</span>
//                       </div>
//                       <div className='flex items-center gap-1'>
//                         <p className="text-[10px] text-stone-500 font-medium">
//                           Cantidad de productos:
//                         </p>
//                         <span className='font-semibold text-[11px] text-stone-700'>20</span>
//                       </div>
//                       <div className='flex items-center gap-1'>
//                         <p className="text-[10px] text-stone-500 font-medium">
//                           Subcategorias:
//                         </p>
//                         <span className='font-semibold text-[11px] text-stone-700'>3</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Acciones derecha */}
//                   <div className="flex items-center space-x-2 flex-shrink-0 ">
//                     {/* Botón condicional: Si tiene carpetas/hijos adentro, muestra un botón sutil para ENTRES */}
//                     {tieneHijos && (
//                       <button
//                       onClick={() => entrarASubcategoria(cat)}
//                       className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer bg-amber-50 border-amber-300 text-[#1E1E24] hover:bg-amber-400 hover:text-white`}
//                         >
//                         <BsBoxArrowInRight className='h-3.5 w-3.5'/>
//                     </button>
//                     )}
                    
//                     {/* Botón de Edición Rápida (Consistencia de marca) */}
//                     <button
//                       onClick={()=>{}}
//                       title="Editar categoria"
//                       className="bg-gray-50 border border-gray-100/70 flex items-center justify-center hover:bg-amber-400 text-stone-700 w-7 h-7 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
//                     >
//                       <BsPencilSquare className="h-3.5 w-3.5" />
//                     </button>
//                     <button
//                       onClick={() => console.log()}
//                       title="Agregar subcategoria"
//                       className="bg-gray-50 hover:bg-green-500 border w-7 h-7 border-gray-100/70 text-stone-700 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
//                     >
//                       <BsPlusSquare className="h-3.5 w-3.5" />
//                     </button>
//                     <button
//                       onClick={() => console.log()}
//                       title="Eliminar categoria"
//                       className="bg-gray-50 hover:bg-red-500 border w-7 h-7 border-gray-100/70 text-stone-700 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
//                     >
//                       <BsTrash className="h-3.5 w-3.5" />
//                     </button>
//                   </div>

//                 </div>
//               );}