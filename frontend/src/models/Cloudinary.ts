export interface cloudinary{
    url: string
    public_id: string
}

export interface ImagenProducto{
    file?: File
    cloudinary?: cloudinary[]
}