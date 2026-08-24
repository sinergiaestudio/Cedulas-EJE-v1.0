# Cédulas EJE

![Cédulas EJE — del PDF al lote, sin copiar una por una](public/og.png)

Herramienta web para analizar PDFs con actuaciones de confronte, identificar las cédulas que deben remitirse a la Oficina de Notificaciones del fuero y asistir su incorporación en **Crear lote** de EJE.

El archivo se procesa íntegramente en el navegador. La aplicación no transmite PDFs, expedientes ni credenciales a un servidor.

## Criterios aplicados

- Incluye la cédula cuando existe remisión expresa a la **Oficina de Notificaciones del fuero** para su diligenciamiento.
- En actuaciones mixtas, incluye solamente la numeración expresamente remitida.
- Cuando la actuación remite pluralmente todas las piezas, incluye todas las cédulas confrontadas.
- Excluye cédulas observadas.
- Excluye cédulas Ley 22.172 que no se remiten a la Oficina de Notificaciones del fuero.
- Ignora actuaciones ajenas al circuito.
- Envía a revisión los supuestos ambiguos, sin incorporarlos automáticamente.
- Detecta duplicados y evita confundir códigos de cédula con números de actuación.
- Tolera separaciones y caracteres invisibles introducidos por algunos PDFs en expresiones como `remítase digitalmente`.

## Acceso operativo para observar

Desde la versión 1.1, cada cédula que la actuación dispone **observar** muestra una acción **Observar**.

Al presionarla:

1. se abre EJE en una pestaña nueva;
2. se copia al portapapeles el número de expediente extraído de la misma página del PDF;
3. la aplicación intenta resolver el identificador interno del expediente y llevar la pestaña directamente a **Actuaciones**;
4. si la consulta directa no está disponible, la pestaña permanece en el buscador de EJE y el expediente ya queda copiado para pegarlo.

La función es deliberadamente asistida: abre el expediente para el control y la intervención humana, pero no redacta, firma ni incorpora por sí una actuación de observación.

## Uso

1. Abrir la aplicación y cargar un PDF con texto seleccionable.
2. Revisar el resultado y la evidencia página por página.
3. Para las cédulas a remitir, copiar la lista aprobada.
4. Para una cédula observada, usar el botón **Observar** y continuar el trámite dentro de EJE.
5. Instalar una sola vez el marcador **Cargador EJE** en Chrome.
6. En EJE, abrir **Crear lote**, seleccionar **Cédula** y ejecutar el marcador.
7. Revisar el listado resultante y crear el lote final manualmente.

El cargador completa el campo, pulsa **Aplicar y agregar**, comprueba que la numeración aparezca incorporada, limpia los filtros y continúa. Si no puede verificar una operación, se detiene en esa cédula.

## Ejecutar localmente

Requiere Node.js 22 o posterior.

```bash
npm install
npm run dev
```

Para generar la versión final:

```bash
npm run build
```

El resultado se crea en `dist/`.

## Límites deliberados

- Los PDFs escaneados como imagen requieren OCR previo.
- La clasificación automática no reemplaza el control humano.
- El acceso directo a Actuaciones depende de que EJE permita resolver el identificador interno desde el navegador; existe un modo de respaldo que abre el buscador y copia el expediente.
- La creación definitiva del lote permanece siempre bajo control humano.
- El cargador no modifica EJE, no utiliza credenciales ni almacena información judicial.

## Privacidad

No deben incorporarse al repositorio PDFs judiciales, exportaciones, registros de carga ni documentación con datos personales. El repositorio contiene únicamente el código de la herramienta y ejemplos ficticios.
