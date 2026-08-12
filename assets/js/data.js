/* =============================================================
   1000 días · 1000 obras · 1000 razones
   Fuente de datos — Informe de Gestión Neuquén 2026 (V17 27/07)
   y presentación creativa "Neuquén no para".

   IMPORTANTE: todas las cifras de este archivo provienen del
   material entregado. No hay datos inventados. El listado
   obra-por-obra (las 1000) todavía no está cargado: la
   estructura de OBRAS está lista para recibirlo.
   ============================================================= */

const EJES = [
  { id: 'rutas',      nombre: 'Rutas y conectividad',      color: 'teal',     icono: '⟶' },
  { id: 'educacion',  nombre: 'Educación y deporte',       color: 'verde',    icono: '✦' },
  { id: 'viviendas',  nombre: 'Viviendas e infraestructura', color: 'coral',  icono: '⌂' },
  { id: 'salud',      nombre: 'Salud',                     color: 'teal',     icono: '+' },
  { id: 'agua',       nombre: 'Agua y energía',            color: 'amarillo', icono: '≈' },
  { id: 'seguridad',  nombre: 'Seguridad',                 color: 'coral',    icono: '◆' },
  { id: 'vacamuerta', nombre: 'Vaca Muerta',               color: 'verde',    icono: '▲' }
];

const ESTADOS = [
  { id: 'finalizada',  nombre: 'Finalizadas',   color: 'verde' },
  { id: 'ejecucion',   nombre: 'En ejecución',  color: 'amarillo' },
  { id: 'licitar',     nombre: 'A licitar',     color: 'coral' }
];

const REGIONES = [
  {
    id: 'confluencia', nombre: 'Confluencia',
    localidades: ['Neuquén', 'Plottier', 'Centenario', 'Senillosa', 'Vista Alegre', 'Villa El Chocón', 'China Muerta'],
    hito: 'Duplicación de calzada de la RP67 y RN22, cruces a distinto nivel y el nuevo Barrio Z1.'
  },
  {
    id: 'vacamuerta', nombre: 'Vaca Muerta',
    localidades: ['Añelo', 'San Patricio del Chañar', 'Rincón de los Sauces', 'Sauzal Bonito', 'Aguada San Roque'],
    hito: 'El bypass de Añelo, la red domiciliaria de gas y las rutas que la producción necesitaba.'
  },
  {
    id: 'comarca', nombre: 'Comarca Petrolera',
    localidades: ['Cutral Có', 'Plaza Huincul'],
    hito: 'Más equipamiento y más presencia policial, y obras de salud para atender cerca.'
  },
  {
    id: 'alto', nombre: 'Alto Neuquén',
    localidades: ['Chos Malal', 'Andacollo', 'Huinganco', 'Las Ovejas', 'Varvarco', 'Manzano Amargo', 'Tricao Malal', 'Buta Ranquil', 'Barrancas', 'Los Miches', 'Guañacos', 'El Cholar', 'El Huecú', 'Taquimilán'],
    hito: 'El gas natural llegó al Alto Neuquén. Donde esperar era una costumbre heredada.'
  },
  {
    id: 'pehuen', nombre: 'Pehuén',
    localidades: ['Aluminé', 'Villa Pehuenia · Moquehue', 'Caviahue · Copahue', 'Loncopué'],
    hito: 'Asfalto en las rutas del Pehuén: trabajar y viajar seguro todo el año.'
  },
  {
    id: 'centro', nombre: 'Zona Centro',
    localidades: ['Zapala', 'Las Lajas', 'Mariano Moreno', 'Covunco Abajo', 'Bajada del Agrio', 'Quili Malal', 'Los Chihuidos', 'Ramón Castro', 'Chorriaca', 'Las Coloradas', 'Los Catutos'],
    hito: 'El nuevo Centro de Salud de Zapala y el corredor que une la meseta con la cordillera.'
  },
  {
    id: 'lagos', nombre: 'Lagos del Sur',
    localidades: ['San Martín de los Andes', 'Junín de los Andes', 'Villa La Angostura', 'Villa Traful', 'Piedra del Águila', 'Santo Tomás', 'Pilo Lil'],
    hito: '117 km de pavimentación en ejecución sobre las RP 60, 61, 62, 63, 65 y 23.'
  }
];

/* ---------- Plan de Obras Neuquén 2026 — totales por rubro ---------- */
const PLAN_OBRAS = [
  { rubro: 'Educación',              eje: 'educacion',  total: 117, licitar: 25, ejecucion: 54, finalizada: 38 },
  { rubro: 'Deportes',               eje: 'educacion',  total: 33,  licitar: 18, ejecucion: 11, finalizada: 4  },
  { rubro: 'Salud',                  eje: 'salud',      total: 51,  licitar: 24, ejecucion: 16, finalizada: 11 },
  { rubro: 'Agua',                   eje: 'agua',       total: 83,  licitar: 17, ejecucion: 32, finalizada: 34 },
  { rubro: 'Gas',                    eje: 'agua',       total: 21,  licitar: 0,  ejecucion: 6,  finalizada: 15 },
  { rubro: 'Luz',                    eje: 'agua',       total: 141, licitar: 20, ejecucion: 24, finalizada: 97 },
  { rubro: 'Seguridad',              eje: 'seguridad',  total: 24,  licitar: 18, ejecucion: 3,  finalizada: 3  },
  { rubro: 'Convenciones y turismo', eje: 'seguridad',  total: 12,  licitar: 9,  ejecucion: 0,  finalizada: 3  },
  { rubro: 'Viviendas',              eje: 'viviendas',  total: 200, licitar: 42, ejecucion: 46, finalizada: 112 }
];

/* ---------- Programas: el todo al que pertenece cada cifra ----------
   Las láminas del informe muestran cada número dentro de su plan
   (56 km sobre 1.000, 141 km sobre 650, etc.). Sin ese marco la
   tarjeta suelta pierde sentido, así que cada obra que forma parte
   de un plan mayor apunta acá con `programa` (o `parteDe`, cuando es
   un tramo dentro de una de las etapas).                            */
const PROGRAMAS = {
  pavimentacion: {
    nombre: 'Pavimentación nueva',
    plan: 'Plan Vial Neuquén 2026',
    total: 1000, unidad: 'km',
    partes: { finalizada: 56, ejecucion: 403, licitar: 541 },
    nota: 'Sobre los 1.050 km que existían en toda la historia de la provincia: la red llega a 2.050 km.'
  },
  repavimentacion: {
    nombre: 'Repavimentación de la red existente',
    plan: 'Plan Vial Neuquén 2026',
    total: 650, unidad: 'km',
    partes: { finalizada: 141, ejecucion: 104, licitar: 405 },
    nota: 'Sobre la red que ya existía. Los 1.000 km nuevos son los que llevan el total a 2.050 km.'
  },
  habita: {
    nombre: 'Neuquén Habita',
    plan: 'Soluciones habitacionales',
    total: 32449, unidad: 'soluciones',
    partes: { finalizada: 3296, ejecucion: 7387, licitar: 21766 },
    nota: 'Medición a 183 días del lanzamiento del programa.'
  },
  saludm2: {
    nombre: 'Obra de salud',
    plan: 'Metros cuadrados de salud',
    total: 102215, unidad: 'm²',
    partes: { finalizada: 14215, ejecucion: 46000, licitar: 42000 },
    nota: 'El Hospital Norpatagónico aporta 42.000 m²: en 2026 arrancan los primeros 10.000.'
  }
};

/* ---------- Tarjetas del explorador: hechos verificables ----------
   `programa`  → la cifra es una de las etapas del plan.
   `parteDe`   → la cifra es un tramo dentro de esa etapa.
   `rubro`     → el desglose sale de PLAN_OBRAS; `resalta` marca la etapa. */
const OBRAS = [
  // RUTAS Y CONECTIVIDAD
  { eje: 'rutas', estados: ['finalizada', 'ejecucion', 'licitar'], region: null, titulo: '1.000 km de rutas nuevas', programa: 'pavimentacion', dato: '1.000', unidad: 'km', detalle: 'En toda su historia Neuquén había pavimentado 1.050 km. El plan suma otros 1.000: la red pasa a 2.050 km.' },
  { eje: 'rutas', estados: ['finalizada', 'ejecucion', 'licitar'], region: null, titulo: '650 km de rutas repavimentadas', programa: 'repavimentacion', dato: '650', unidad: 'km', detalle: 'Recuperación de la red heredada: no suma kilómetros nuevos, pone en condiciones los que ya existían.' },
  { eje: 'rutas', estado: 'ejecucion', region: 'lagos', titulo: 'Lagos del Sur: RP 60, 61, 62, 63, 65 y 23', programa: 'pavimentacion', parteDe: 'ejecucion', dato: '117', unidad: 'km', detalle: 'RP60: 12 km · RP61: 9 km · RP62: 6 km · RP63: 19 km · RP65-T1: 34 km · RP23-T3: 37 km.' },
  { eje: 'rutas', estado: 'finalizada', region: 'lagos', titulo: 'RP 23 — tramo finalizado', programa: 'pavimentacion', parteDe: 'finalizada', dato: '16', unidad: 'km', detalle: 'Primer tramo terminado del corredor de los Lagos del Sur.' },
  { eje: 'rutas', estado: 'ejecucion', region: 'confluencia', titulo: 'Duplicación de calzada RP67', dato: '19', unidad: 'km', detalle: 'Tramo RN22 / RP51, más conexión RP67–RP7 y cruces a distinto nivel.' },
  { eje: 'rutas', estado: 'ejecucion', region: 'confluencia', titulo: 'Duplicación RN22 y accesos', dato: '3,5', unidad: 'km', detalle: 'Vinculación ex Bajada de Capex, accesos y vinculaciones.' },
  { eje: 'rutas', estado: 'licitar', region: null, titulo: 'Corredores bioceánicos', dato: '2', unidad: 'pasos', detalle: 'Pichachén (RP6) y Pino Hachado (RN22), hacia los puertos del Atlántico y las regiones chilenas del Biobío, Araucanía, Los Ríos y Los Lagos.' },

  // EDUCACIÓN Y DEPORTE
  { eje: 'educacion', estado: 'finalizada', region: null, titulo: 'Erradicación definitiva de las escuelas tráiler', dato: '100', unidad: '%', detalle: 'Ningún chico vuelve a cursar en un tráiler.' },
  { eje: 'educacion', estado: 'finalizada', region: null, titulo: 'Aulas nuevas y refaccionadas', dato: '+700', unidad: 'aulas', detalle: 'Vaca Muerta exige 160 aulas nuevas por año solo para absorber la demanda.' },
  { eje: 'educacion', estado: 'finalizada', region: null, titulo: 'Establecimientos construidos, ampliados o refaccionados', dato: '+70', unidad: 'edificios', detalle: '100.000 m² de obra nueva, de los cuales 65.000 m² en escuelas técnicas.' },
  { eje: 'educacion', estado: 'finalizada', region: null, titulo: 'Becas Gregorio Álvarez', dato: '19.000', unidad: 'estudiantes', detalle: '$38.315 millones invertidos, partiendo de cero becados.' },
  { eje: 'educacion', estado: 'finalizada', region: null, titulo: 'Plan Pehuén', dato: '16.000', unidad: 'millones $', detalle: 'Inversión donde antes no había ninguna.' },
  { eje: 'educacion', estado: 'ejecucion', region: null, titulo: 'Plan de obras de Educación', rubro: 'Educación', dato: '117', unidad: 'obras', detalle: 'Obras de infraestructura escolar en toda la provincia.' },
  { eje: 'educacion', estado: 'ejecucion', region: null, titulo: 'Plan de obras de Deportes', rubro: 'Deportes', dato: '33', unidad: 'obras', detalle: 'Infraestructura deportiva en toda la provincia.' },

  // VIVIENDAS E INFRAESTRUCTURA
  { eje: 'viviendas', estados: ['finalizada', 'ejecucion', 'licitar'], region: null, titulo: '32.449 soluciones habitacionales', programa: 'habita', dato: '32.449', unidad: 'soluciones', detalle: 'Programa Neuquén Habita, lanzado el 5 de diciembre de 2025.' },
  { eje: 'viviendas', estado: 'ejecucion', region: null, titulo: 'Inversión en vivienda', dato: 'U$D 450', unidad: 'millones', detalle: 'Créditos hipotecarios no bancarios del gobierno provincial.' },
  { eje: 'viviendas', estado: 'finalizada', region: null, titulo: 'Obras de vivienda finalizadas', rubro: 'Viviendas', resalta: 'finalizada', dato: '112', unidad: 'obras', detalle: '409 viviendas y 864 obras de infraestructura de servicios.' },

  // SALUD
  { eje: 'salud', estados: ['finalizada', 'ejecucion', 'licitar'], region: null, titulo: '102.215 m² de obra en salud', programa: 'saludm2', dato: '102.215', unidad: 'm²', detalle: 'Entre lo que ya está en funcionamiento, lo que se está construyendo y lo que viene.' },
  { eje: 'salud', estado: 'licitar', region: null, titulo: 'Hospital Norpatagónico', programa: 'saludm2', dato: '+42.000', unidad: 'm²', detalle: 'En 2026 iniciamos con los primeros 10.000 m².' },
  { eje: 'salud', estado: 'finalizada', region: 'centro', titulo: 'Nuevo Centro de Salud de Zapala', dato: '1', unidad: 'centro', detalle: 'Había mil razones para que Ayelén trabajara en su ciudad.' },
  { eje: 'salud', estado: 'ejecucion', region: null, titulo: 'Plan de obras de Salud', rubro: 'Salud', dato: '51', unidad: 'obras', detalle: 'Centros de salud y hospitales en toda la provincia.' },

  // AGUA Y ENERGÍA
  { eje: 'agua', estado: 'ejecucion', region: null, titulo: 'Potabilización y tratamiento', dato: '$200.000', unidad: 'millones', detalle: 'Inversión en agua potable y saneamiento.' },
  { eje: 'agua', estado: 'finalizada', region: 'alto', titulo: 'Plan Integral de Gas', rubro: 'Gas', dato: '21', unidad: 'obras', detalle: 'Gas natural para zonas rurales y cordilleranas.' },
  { eje: 'agua', estado: 'finalizada', region: null, titulo: 'Red de alta tensión', dato: '245', unidad: 'km', detalle: 'U$D 153 millones invertidos.' },
  { eje: 'agua', estado: 'finalizada', region: null, titulo: 'Obras de luz finalizadas', rubro: 'Luz', resalta: 'finalizada', dato: '97', unidad: 'obras', detalle: 'Redes y obras eléctricas en toda la provincia.' },
  { eje: 'agua', estado: 'ejecucion', region: null, titulo: 'Plan de obras de Agua', rubro: 'Agua', dato: '83', unidad: 'obras', detalle: 'Agua potable y saneamiento en toda la provincia.' },

  // SEGURIDAD
  { eje: 'seguridad', estado: 'finalizada', region: null, titulo: 'Móviles policiales incorporados', dato: '350', unidad: 'móviles', detalle: '240 blindados. Otros 359 en proceso de adquisición.' },
  { eje: 'seguridad', estado: 'finalizada', region: null, titulo: 'Dispositivos de baja letalidad', dato: '$5.580', unidad: 'millones', detalle: '$3.221 millones en Taser 10 y $2.359 millones en Byrna.' },
  { eje: 'seguridad', estado: 'ejecucion', region: null, titulo: 'Plan histórico de infraestructura policial', dato: '45', unidad: 'obras', detalle: 'Donde antes no había inversión en equipamiento ni en edificios.' },
  { eje: 'seguridad', estado: 'ejecucion', region: null, titulo: 'Infraestructura carcelaria nueva', dato: '31.000', unidad: 'm²', detalle: 'Más de 670 nuevas plazas carcelarias.' },

  // VACA MUERTA
  { eje: 'vacamuerta', estado: 'ejecucion', region: 'vacamuerta', titulo: 'Bypass de Añelo', dato: '1', unidad: 'obra clave', detalle: 'La riqueza de Vaca Muerta volviendo al barrio: el bypass, el gas y las rutas que la producción necesitaba.' },
  { eje: 'vacamuerta', estado: 'ejecucion', region: null, titulo: 'Oleoducto VMOS', dato: '1', unidad: 'proyecto', detalle: 'Vaca Muerta Oil Gas: de Añelo (Neuquén) a Punta Colorada (Río Negro).' },
  { eje: 'vacamuerta', estado: 'ejecucion', region: null, titulo: 'SESA — Etapas 1 y 2', dato: '2', unidad: 'etapas', detalle: 'Conexión al Gasoducto San Martín y ducto dedicado San Matías Pipeline.' },
  { eje: 'vacamuerta', estado: 'licitar', region: null, titulo: 'Argentina LNG', dato: '1', unidad: 'proyecto', detalle: 'Salida al Golfo San Matías.' },
  { eje: 'vacamuerta', estado: 'ejecucion', region: null, titulo: 'RIGI: ingresos adicionales para la provincia', dato: 'U$D 1.823', unidad: 'millones', detalle: 'En los próximos cuatro años, por cada U$D 6,11 millones que resigna de Coparticipación Federal: 298 veces más de lo que deja de percibir.' },
  { eje: 'vacamuerta', estado: 'ejecucion', region: null, titulo: 'Producción proyectada', dato: '415.000', unidad: 'bbl/día', detalle: 'Incremento esperado; en 2027 ya sumaremos 119.800 bbl/día.' }
];

/* ---------- Cifras del hito ---------- */
const CIFRAS = [
  { valor: 1000,   sufijo: '',  label: 'obras en marcha',                    nota: 'en solo 1000 días de gestión', color: 'coral' },
  { valor: 2050,   sufijo: '',  label: 'kilómetros de rutas',                nota: 'antes eran 1.050 en toda la historia', color: 'teal' },
  { valor: 32449,  sufijo: '',  label: 'soluciones habitacionales',          nota: 'Neuquén Habita', color: 'verde' },
  { valor: 19000,  sufijo: '',  label: 'estudiantes becados',                nota: 'Becas Gregorio Álvarez, desde cero', color: 'amarillo' },
  { valor: 102215, sufijo: '',  label: 'm² de obra en salud',                nota: 'hechos, en obra y por hacer', color: 'teal' },
  { valor: 700,    sufijo: '+', label: 'aulas nuevas y refaccionadas',       nota: 'y las escuelas tráiler, erradicadas', color: 'verde' },
  { valor: 350,    sufijo: '',  label: 'móviles policiales',                 nota: '240 de ellos blindados', color: 'coral' }
];

/* ---------- Antes / Después ---------- */
const CAMBIOS = [
  { titulo: 'Rutas pavimentadas',        antes: '1.050 km', despues: '2.050 km', pct: 95, nota: 'En toda la historia de la provincia se habían pavimentado 1.050 km. Sumamos 1.000 nuevos y repavimentamos 650.' },
  { titulo: 'Deuda sobre ingresos',      antes: '83%',      despues: '16%',      pct: 81, nota: 'La deuda pasó de U$S 1.263 millones al 83% de los ingresos anuales a representar el 16% en diciembre de 2025.' },
  { titulo: 'Desocupación',              antes: '—',        despues: '2,3%',     pct: 64, nota: 'Una caída del 64% en la desocupación, a diciembre de 2025.' },
  { titulo: 'Pobreza',                   antes: '—',        despues: '−45%',     pct: 45, nota: 'En dos años y medio.' },
  { titulo: 'Planta política',           antes: '100%',     despues: '−87%',     pct: 87, nota: 'Se eliminaron las jubilaciones de privilegio y se jerarquizó al empleado público.' },
  { titulo: 'Estudiantes becados',       antes: '0',        despues: '19.000',   pct: 100, nota: '$38.315 millones invertidos en Becas Gregorio Álvarez.' }
];

/* ---------- Contexto económico ---------- */
const CONTEXTO = [
  { dato: '+22,7%',  label: 'Producto Bruto Geográfico', nota: '2025 vs 2023. Nueve veces superior a la provincia que le sigue.' },
  { dato: '+7,1%',   label: 'Empleo privado',            nota: 'Únicos con crecimiento neto: más del doble de la provincia que le sigue.' },
  { dato: '9.501',   label: 'Nuevos puestos de trabajo', nota: 'Y 186 nuevas empresas radicadas.' },
  { dato: '5,1%',    label: 'del PBI argentino',         nota: 'Con solo el 1,5% de la población nacional.' },
  { dato: '1º',      label: 'en inversión en infraestructura por habitante', nota: 'Y la provincia que más invierte por alumno del país.' },
  { dato: '4º',      label: 'exportadores del país',     nota: '69% del petróleo y 73% del gas. Exportaciones +48% en dos años.' }
];

/* ---------- Las mil razones: historias de la campaña ---------- */
const RAZONES = [
  { nombre: 'Rosa', foto: 'assets/img/razones/rosa.jpg',        edad: '72 años', lugar: 'Las Ovejas · Alto Neuquén', eje: 'agua',       frase: 'Cortó leña hasta los setenta y dos. Hoy gira la perilla y la llama azul se enciende.', razon: 'Había mil razones para llevar el gas natural al Alto Neuquén.' },
  { nombre: 'Camila', foto: 'assets/img/razones/camila.jpg',      edad: '19 años', lugar: 'Junín de los Andes · Lagos del Sur', eje: 'educacion', frase: 'Este año está en la universidad. Es una de las 19.000 becadas.', razon: 'Había mil razones para contar con las Becas Gregorio Álvarez.' },
  { nombre: 'Marta', foto: 'assets/img/razones/marta.jpg',       edad: '38 años', lugar: 'Neuquén Capital · Confluencia', eje: 'viviendas', frase: 'Alquiló toda su vida. Este año giró la llave de una puerta que por fin es suya.', razon: 'Había mil razones para entregar las casas del Barrio Z1.' },
  { nombre: 'Nelson', foto: 'assets/img/razones/nelson.jpg',      edad: 'Transportista', lugar: 'Región del Pehuén', eje: 'rutas',     frase: 'Trabaja al volante. Ahora la ruta está asfaltada.', razon: 'Había mil razones para asfaltar las rutas del Pehuén.' },
  { nombre: 'Ayelén', foto: 'assets/img/razones/ayelen.jpg',      edad: 'Enfermera', lugar: 'Zapala · Zona Centro', eje: 'salud',       frase: 'Se pone el guardapolvo y camina segura por el pasillo de su ciudad.', razon: 'Había mil razones para tener el nuevo Centro de Salud de Zapala.' },
  { nombre: 'Don Ernesto', foto: 'assets/img/razones/ernesto.jpg', edad: 'Comerciante', lugar: 'Comarca Petrolera', eje: 'seguridad',    frase: 'Llega de madrugada, sube la persiana y abre tranquilo.', razon: 'Había mil razones para más equipamiento y más presencia policial.' },
  { nombre: 'Marcos', foto: 'assets/img/razones/marcos.jpg',      edad: 'Trabajador petrolero', lugar: 'Añelo · Vaca Muerta', eje: 'vacamuerta', frase: 'Llega a su casa, prende la hornalla y ceba un mate con su hija.', razon: 'Había mil razones para el bypass, el gas y las rutas de Vaca Muerta.' }
];

/* ---------- Manifiesto ---------- */
const MANIFIESTO = [
  'Hay mil maneras de contar mil días.',
  'Podríamos hablar de kilómetros, de metros cuadrados, de millones invertidos.',
  'Pero ninguna obra se hizo por un número en sí mismo.',
  'Se hizo porque Camila cursaba en un tráiler y el frío entraba por las paredes.',
  'Porque Rosa cortó leña hasta los setenta y dos.',
  'Porque Andrés nunca había girado una llave en una casa propia.',
  'Porque en el Alto, esperar era una costumbre heredada.',
  'Mil días después, el gas llegó. La puerta se abrió.',
  'Y algo más difícil de medir empezó a cambiar: la certeza de que acá, las cosas pasan.'
];
