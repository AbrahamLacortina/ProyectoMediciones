// monitoreo-ambiental-web/src/utils/validaciones.js

// Formatea el RUT a 12.345.678-9
export function formatearRut(rut) {
    rut = rut.replace(/[^\dkK]/g, "").toUpperCase();
    if (!rut) return "";
    let cuerpo = rut.slice(0, -1);
    let dv = rut.slice(-1);
    let formatted = "";
    let i = 0;
    for (let j = cuerpo.length - 1; j >= 0; j--) {
        formatted = cuerpo[j] + formatted;
        i++;
        if (i % 3 === 0 && j !== 0) formatted = "." + formatted;
    }
    return formatted + (dv ? "-" + dv : "");
}

// Valida el RUT chileno
export function validarRut(rut) {
    rut = rut.replace(/[^\dkK]/g, "").toUpperCase();
    if (rut.length < 2) return false;
    let cuerpo = rut.slice(0, -1);
    let dv = rut.slice(-1);
    let suma = 0, multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    let dvEsperado = 11 - (suma % 11);
    dvEsperado = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();
    return dv === dvEsperado;
}

// Valida correo electrónico
export function validarCorreo(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// Valida contraseña (mínimo 6 caracteres y coinciden)
export function validarPassword(pw, pw2) {
    return pw.length >= 6 && pw === pw2;
}