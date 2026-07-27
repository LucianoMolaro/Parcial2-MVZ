import { useState } from 'react';
import { cloudinary } from '../models/Cloudinary';

const CloudinaryUpload = () => {
  const [imagenes, setImagenes] = useState<cloudinary[]>([]);

  const [subiendo, setSubiendo] = useState(false);

  const borrarUnaImagen = async (publicId: string): Promise<void> => {
    const resp = await fetch(`http://localhost:8000/cloudinary/delete/${publicId}`, {
      method: "DELETE",
    });

    if (!resp.ok) {
      throw new Error(`Error al borrar imagen: ${resp.status}`);
    }

    const data: { ok: boolean; detail: string } = await resp.json();
    if (!data.ok) throw new Error("El servidor indicó que el borrado falló");
  };

  const handleQuitarImagen = async (publicId: string) => {
    try {
      await borrarUnaImagen(publicId);
      setImagenes((prev) => prev.filter((img) => img.public_id !== publicId));
    } catch (error) {
      console.error("Error al quitar imagen:", error);
    }
  };

  const subirUnaImagen = async (archivo: File): Promise<cloudinary> => {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("folder", "prueba");

    const resp = await fetch("http://localhost:8000/cloudinary/upload", {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) throw new Error(`Error al subir: ${resp.status}`);

    const data: { ok: boolean; url: string; public_id: string } = await resp.json();
    if (!data.ok) throw new Error("El servidor indicó que la subida falló");

    return { url: data.url, public_id: data.public_id };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    setSubiendo(true);


  const subidas = await Promise.all(
    Array.from(archivos).map((archivo) => subirUnaImagen(archivo))
  );

  setImagenes((prev) => [...prev, ...subidas]);
  setSubiendo(false);
  e.target.value = "";
  
};

  return (
  <>
    <label className="bg-white border border-gray-200 hover:border-[#FFB703] text-gray-500 font-bold text-[10px] py-1.5 px-2.5 rounded-xl transition-all cursor-pointer shadow-2xs">
      <span>Subir</span>
      <input type="file" accept="image/webp image/jpeg image/png image/jpg" multiple className="hidden" onChange={handleFileChange} />
    </label>

    {subiendo && <p>Subiendo imágenes...</p>}

    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
    {imagenes.map((img) => (
        <div key={img.public_id} style={{ position: "relative" }}>
          <img src={img.url} alt="preview" style={{ width: 100, height: 100, objectFit: "cover" }} />
          <button type="button" onClick={() => handleQuitarImagen(img.public_id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  </>
  );
};

export default CloudinaryUpload;
