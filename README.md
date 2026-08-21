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

## Uso

1. Abrir la aplicación y cargar un PDF con texto seleccionable.
2. Revisar el resultado y la evidencia página por página.
3. Copiar la lista aprobada.
4. Instalar una sola vez el marcador **Cargador EJE** en Chrome.
5. En EJE, abrir **Crear lote**, seleccionar **Cédula** y ejecutar el marcador.
6. Revisar el listado resultante y crear el lote final manualmente.

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

## Publicar con GitHub Pages

El repositorio incluye un flujo automático en `.github/workflows/deploy-pages.yml`.

1. Crear un repositorio vacío en GitHub.
2. Subir todo el contenido de este proyecto a la rama `main`.
3. Ir a **Settings → Pages**.
4. En **Build and deployment**, seleccionar **GitHub Actions**.
5. Abrir la pestaña **Actions** y esperar a que termine “Publicar en GitHub Pages”.

La aplicación utiliza rutas relativas, por lo que funciona tanto en un repositorio de proyecto como en un sitio de usuario.

## Límites deliberados

- Los PDFs escaneados como imagen requieren OCR previo.
- La creación definitiva del lote permanece siempre bajo control humano.
- El cargador no modifica EJE, no utiliza APIs internas y no almacena credenciales.

## Privacidad

No deben incorporarse al repositorio PDFs judiciales, exportaciones, registros de carga ni documentación con datos personales. El repositorio contiene únicamente el código de la herramienta y ejemplos ficticios.
