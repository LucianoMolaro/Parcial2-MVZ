/**
 * Muestra un alert con el mensaje de error del backend (campo "detail" de HTTPException)
 * cuando una respuesta de fetch no fue exitosa.
 * Devuelve true si hubo error (y ya se mostró la alerta), false si la respuesta fue ok.
 */
export async function mostrarErrorSiFalla(res: Response, mensajePorDefecto = 'Ocurrió un error. Intenta nuevamente.'): Promise<boolean> {
  if (res.ok) return false;
  const data = await res.json().catch(() => null);
  alert(data?.detail || mensajePorDefecto);
  return true;
}
