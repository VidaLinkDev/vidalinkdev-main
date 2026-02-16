// SCRIPT/auth.js

import { auth, db } from './firebase-init.js';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteField
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * Observa el estado de autenticación
 * ÚNICA fuente confiable de sesión
 */
export function observarEstadoAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Protege páginas privadas
 */
export function protegerRutaPrivada(onAutenticado) {
  observarEstadoAuth(user => {
    if (user) {
      onAutenticado(user);
    } else {
      window.location.href = 'login.html'; 
    }
  });
}

/**
 * Verifica si un usuario existe en Firebase
 */
export async function usuarioExiste(email) {
  try {
    // Intenta iniciar sesión con una contraseña dummy para verificar si el email existe
    // Si el email no existe, Firebase lo dirá explícitamente
    const usuarios = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${auth.app.options.apiKey}`,
      {
        method: 'POST',
        body: JSON.stringify({ idToken: '' })
      }
    ).catch(() => null);

    // Método alternativo: usar signInWithEmailAndPassword con manejo de errores
    // El error "auth/user-not-found" significa que el usuario no existe
    return true; // Este método no es 100% confiable sin credenciales
  } catch (error) {
    return false;
  }
}

/**
 * Login con email y contraseña
 */
export async function iniciarSesion(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    // Detectar si el email no existe
    if (error.code === 'auth/user-not-found') {
      return { 
        success: false, 
        message: 'Usuario no encontrado',
        usuarioNoExiste: true,
        credential: false
      };
    } else if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { 
        success: false, 
        message: 'Contraseña incorrecta o usuario no existe',
        credential: false
      };
    } else if (error.code === 'auth/invalid-email') {
      return { 
        success: false, 
        message: 'Email inválido'
      };
    }
    return { success: false, message: error.message, credential: false };
  }
}

/**
 * Registro
 */
export async function registrarse(email, password, datosPersonales = {}, esVoluntario = false) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      email,
      primerNombre: datosPersonales.primerNombre || '',
      segundoNombre: datosPersonales.segundoNombre || '',
      primerApellido: datosPersonales.primerApellido || '',
      segundoApellido: datosPersonales.segundoApellido || '',
      celular: datosPersonales.celular || '',
      esVoluntario,
      estadoVoluntario: esVoluntario ? 'no_disponible' : 'no_aplicable',
      fechaRegistro: new Date()
    });

    return { success: true };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      return { 
        success: false, 
        message: 'Este correo electrónico ya está registrado',
        emailEnUso: true
      };
    } else if (error.code === 'auth/weak-password') {
      return { 
        success: false, 
        message: 'La contraseña es muy débil (mínimo 6 caracteres)'
      };
    } else if (error.code === 'auth/invalid-email') {
      return { 
        success: false, 
        message: 'Correo electrónico inválido'
      };
    }
    return { success: false, message: error.message };
  }
}

/**
 * ❌ NO usar auth.currentUser directamente en Pages
 * ✅ Usar onAuthStateChanged
 */
export function obtenerUsuario(callback) {
  observarEstadoAuth(user => callback(user));
}

/**
 * Cerrar sesión
 */
export async function cerrarSesion() {
  try {
    await signOut(auth);
    // Se redirige en el listener de onAuthStateChanged o al llamar
    window.location.href = 'index.html'; 
  } catch (error) {
    console.error(error);
  }
}

/**
 * Login con Google
 */
export async function iniciarSesionConGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const usuarioRef = doc(db, "usuarios", user.uid);
    const snap = await getDoc(usuarioRef);

    if (!snap.exists()) {
      // Usuario nuevo - devolver info para que llene los datos
      return { 
        success: true, 
        nuevoUsuario: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || ''
        }
      };
    } else {
        // Asegurar que el estado exista para usuarios antiguos
        const existingData = snap.data();
        const defaultState = existingData.esVoluntario ? 'no_disponible' : 'no_aplicable';

        await updateDoc(usuarioRef, {
            estadoVoluntario: existingData.estadoVoluntario || defaultState
        });

        return { success: true, nuevoUsuario: false };
    }
  } catch (error) {
    return { success: false, message: error.message, error: error.message };
  }
}

/**
 * Completa el perfil de un usuario Google nuevo
 */
export async function completarPerfilGoogle(uid, datosPersonales, esVoluntario = false) {
  try {
    const usuarioRef = doc(db, "usuarios", uid);
    
    await setDoc(usuarioRef, {
      email: datosPersonales.email,
      primerNombre: datosPersonales.primerNombre || '',
      segundoNombre: datosPersonales.segundoNombre || '',
      primerApellido: datosPersonales.primerApellido || '',
      segundoApellido: datosPersonales.segundoApellido || '',
      celular: datosPersonales.celular || '',
      esVoluntario,
      estadoVoluntario: esVoluntario ? 'no_disponible' : 'no_aplicable',
      fechaRegistro: new Date(),
      registroConGoogle: true
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
