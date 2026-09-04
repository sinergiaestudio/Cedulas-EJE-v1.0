<p align="center">
  <img src="docs/readme/cedulas-logo.svg" alt="Remitidor de cédulas" width="760">
</p>

<h2 align="center">Del PDF a dos listados verificables: remitir y observar.</h2>

<p align="center">
  Analiza providencias de confronte, separa remisiones y observaciones y mantiene la decisión final bajo control humano.
</p>

<p align="center">
  <a href="https://sinergiaestudio.github.io/Cedulas-EJE-v1.0/"><strong>Abrir Remitidor de cédulas</strong></a>
  ·
  <a href="https://biblioteca-judicial-inteligente.arielmarcelogomez7.chatgpt.site">Sistema de Actuaciones Judiciales</a>
  ·
  <a href="https://sinergiaestudio.github.io/herramientas-j15sec29/">Herramientas SEC29</a>
  ·
  <a href="#criterios-de-decisión">Criterios</a>
  ·
  <a href="#privacidad-y-límites">Privacidad</a>
</p>

<p align="center">
  <img alt="versión" src="https://img.shields.io/badge/versión-1.3-821529">
  <img alt="React y TypeScript" src="https://img.shields.io/badge/React%20%2B%20TypeScript-aplicación-365F91">
  <img alt="PDF local" src="https://img.shields.io/badge/PDF-procesamiento%20local-2F7D5C">
  <img alt="revisión humana" src="https://img.shields.io/badge/revisión-humana-B99655">
  <img alt="GitHub Pages" src="https://img.shields.io/badge/GitHub%20Pages-publicada-687386">
</p>

---

## Qué es el Remitidor de cédulas

El **Remitidor de cédulas** es una herramienta web para analizar PDFs con providencias de confronte y asistir dos tareas distintas:

- preparar el listado de cédulas que deben **remitirse** a la Oficina de Notificaciones del fuero;
- preparar el listado de cédulas que deben **observarse** y facilitar su control manual en EJE.

La aplicación identifica los códigos, interpreta el sentido operativo de cada providencia y distingue cuatro situaciones:

- piezas que deben **remitirse**;
- cédulas expresamente **observadas**;
- supuestos **ambiguos** que requieren revisión;
- actuaciones **ajenas** al circuito, que deben ignorarse.

El análisis no reemplaza la lectura judicial. Su función es reducir la búsqueda mecánica, mostrar la evidencia y concentrar el control humano en los casos relevantes.

> **Automatizar la clasificación no significa delegar la decisión.**

## Flujo operativo

```text
PDF de actuaciones
        ↓
Lectura y normalización
        ↓
Remitir · Observar · Revisar · Ignorar
        ↓
Copiar listado a remitir / copiar listado a observar
        ↓
Botón Remitidor en EJE / control manual de observaciones
```

## Criterios de decisión

| Resultado | Condición principal | Tratamiento |
|---|---|---|
| **Remitir** | La actuación ordena expresamente remitir digitalmente la pieza a la Oficina de Notificaciones para su diligenciamiento. | Integra el listado **Para remitir**. |
| **Observar** | La providencia individualiza una cédula y dispone expresamente su observación. | Integra el listado **Observadas** y conserva la acción individual **Observar**. |
| **Revisar** | Hay códigos, lenguaje parcial, actuación mixta o evidencia insuficiente para una decisión segura. | No se incorpora automáticamente a ninguno de los dos listados. |
| **Ignorar** | La actuación no pertenece al circuito de cédulas. | No genera una fila operativa. |

La detección contempla:

- remisiones y observaciones en singular y plural;
- fórmulas `Obsérvese la cédula ... bajo el código ...`;
- observaciones de cédulas Ley 22.172;
- providencias mixtas con una cédula observada y otra remitida;
- códigos repetidos;
- separaciones y caracteres invisibles introducidos por algunos PDFs;
- evidencia página por página.

## Analizador v1.3: observaciones aisladas por mandato

La versión 1.3 refuerza la lectura de la cláusula **Obsérvese**. La extracción se detiene antes de:

- la motivación del defecto, por ejemplo `por poseer`, `por omitir`, `Ello, dado que...`;
- las actuaciones citadas como fundamento;
- una orden posterior de remisión dentro de la misma providencia.

Esto evita convertir en cédulas:

- el número del expediente;
- el número de la providencia;
- las actuaciones citadas;
- números pertenecientes a un oficio u otra pieza distinta.

En una providencia mixta como:

```text
obsérvese ... 575112/2026 ...
y remítase ... 575114/2026 ...
```

el resultado es:

```text
575112/2026 → Observar
575114/2026 → Remitir
```

La regresión de producción utiliza un caso real de 15 páginas y exige:

```text
9 cédulas para remitir
6 cédulas para observar
0 casos a revisar
1 página ajena
```

## Evidencia operativa

El desplegable **Ver evidencia** comienza en el fragmento del proveído que sustenta la decisión, no en el encabezado institucional.

- Para **Remitir**, conserva la cláusula de confronte y la orden de remisión.
- Para **Observar**, comienza en `Obsérvese la cédula...` e incluye el motivo.
- En las providencias mixtas, cada código queda vinculado con su mandato específico.

## Dos listados independientes

La columna lateral ofrece dos acciones:

- **Copiar listado a remitir**: copia únicamente los códigos aprobados para la Oficina de Notificaciones.
- **Copiar listado a observar**: copia únicamente los códigos individualizados por una orden expresa de observación.

Ambos listados se generan sin duplicados y con una cédula por línea.

## Acción individual Observar

Cada cédula observada mantiene el botón **Observar**.

Al presionarlo:

1. se abre o reutiliza una pestaña de EJE;
2. se copia automáticamente el número visible del expediente;
3. la aplicación informa qué expediente quedó copiado;
4. el usuario lo pega en el buscador de EJE y presiona `Enter`.

La herramienta no intenta calcular el identificador interno `expId`, no redacta la actuación y no ejecuta ninguna decisión procesal.

## Botón Remitidor

Para las cédulas clasificadas como **Remitir**:

1. cargar el PDF;
2. revisar códigos, fundamento y evidencia;
3. copiar el listado a remitir;
4. abrir **Crear lote** en EJE;
5. ejecutar el marcador **Botón Remitidor**;
6. pegar la lista;
7. revisar el resultado y crear el lote manualmente.

El marcador completa el campo correspondiente, pulsa la acción operativa, verifica la incorporación y se detiene cuando no puede confirmar el resultado. Nunca crea definitivamente el lote.

## Diseño de la interfaz

El Remitidor forma parte de la familia **Herramientas SEC29** y comparte:

- cabecera institucional no oficial;
- menú lateral minimizado;
- accesos cruzados a los demás módulos;
- tema claro y oscuro;
- paleta bordó, grafito, marfil y dorado apagado;
- procesamiento local y mensajes de seguridad visibles;
- crédito de autoría común.

## Privacidad y límites

- el PDF se procesa íntegramente en el navegador;
- no se envían expedientes, documentos ni credenciales a un servidor;
- no existe base de datos de casos;
- los PDFs escaneados como imagen requieren OCR previo;
- los casos ambiguos deben resolverse mediante lectura humana;
- la creación definitiva del lote permanece bajo control del usuario;
- no deben incorporarse al repositorio PDFs reales, registros de carga ni documentación con datos personales;
- la aplicación no constituye un sistema oficial del Consejo de la Magistratura de la CABA.

## Desarrollo local

Requiere Node.js 22.13 o posterior.

```bash
npm ci
npm run test:analysis
npm run dev
```

Compilación de producción:

```bash
npm run build
```

La compilación ejecuta la regresión real, TypeScript, Vite y una verificación del bundle publicado.

## Estructura principal

```text
src/
├── CedulasApp.tsx          interfaz, revisión y resultados
├── cedulaAnalysisV3.ts     analizador de remisión y observación
├── ejeBookmarklet.ts       Botón Remitidor dentro de EJE
├── index.css               interfaz base
└── main.tsx                arranque de React
public/
└── remitidor-v13.css       estilos del doble listado
scripts/
├── test-analysis.mjs       regresión 9/6/0/1
├── apply-remitidor-v13.mjs integración de compatibilidad
├── repair-vite-patch.mjs   reparación previa de transformación
└── verify-dist.mjs         control del bundle publicado
```

## Repositorios relacionados

- [Herramientas SEC29](https://github.com/sinergiaestudio/herramientas-j15sec29)
- [Confronte de Liquidaciones EJF](https://github.com/sinergiaestudio/Confronte-Liquidaciones-EJF-v2.1.0)
- [Perfil de Marcelo Gómez](https://github.com/sinergiaestudio/marcelo-gomez)

## Autoría

Diseño y desarrollo: **[Marcelo Gómez](https://github.com/sinergiaestudio)**  
Juzgado N.º 15 · Secretaría N.º 29  
Biblioteca de Mero Trámite · innovación aplicada a la gestión judicial.
