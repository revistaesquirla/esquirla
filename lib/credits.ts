// Créditos fijos del proyecto. No vienen de Supabase porque no son contenido
// editorial ni algo que el admin necesite cambiar desde /admin — si algún día
// quieres poder editarlos desde el panel, avísame y los movemos a una tabla.

export const GRUPO_CREADOR = {
  nombre: 'Mamarre Legacy',
} as const;

export const CREDITOS_EQUIPO = [
  { nombre: 'Andrés Beltrán', instagram: '@_beltr_' },
  { nombre: 'Simón Suárez', instagram: '@isalmonnt' },
  { nombre: 'Samuel Patiño', instagram: '@__itzz.sxm' },
  { nombre: 'Daniel Rodríguez', instagram: '@daniel_rg.07' },
] as const;

export const CREDITOS_PROFESORAS = ['Yohanna García', 'Gladys Sánchez'] as const;

export const COLEGIO = {
  nombre: 'Colegio Técnico Industrial Corazón de María',
  url: 'https://coltec.edu.co',
} as const;

export function instagramUrl(handle: string) {
  return `https://instagram.com/${handle.replace('@', '')}`;
}
