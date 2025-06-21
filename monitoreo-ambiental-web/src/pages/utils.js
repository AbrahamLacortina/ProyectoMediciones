// utils.js
export const formatFecha = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date)) return isoString;
    return date.toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Formatea un string tipo '2025-06-20T18:57:31' a '20/06/2025 18:57:31' sin usar new Date()
export function formatFechaLocal(fechaStr) {
    if (!fechaStr) return '';
    // Espera formato 'YYYY-MM-DDTHH:mm:ss'
    const [fecha, hora] = fechaStr.split('T');
    if (!fecha || !hora) return fechaStr;
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y} ${hora}`;
}
