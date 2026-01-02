# Emergencias24 Web Admin

![Demo App](./Emergencias24AdminDemo.gif)

## Descripción del Proyecto

Emergencias24 Web Admin es una plataforma integral para la gestión y monitoreo de emergencias. Esta aplicación permite a los administradores y operadores visualizar incidentes en tiempo real, gestionar recursos y coordinar acciones de respuesta de manera eficiente.

## Tecnologías Utilizadas

El proyecto utiliza un stack tecnológico moderno y optimizado para el rendimiento:

- **Frontend Core**: [React 19](https://react.dev/) & [React Router 7](https://reactrouter.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilos & UI**:
  - [TailwindCSS](https://tailwindcss.com/)
  - [Radix UI](https://www.radix-ui.com/) (Componentes accesibles)
  - [Lucide React](https://lucide.dev/) (Iconos)
- **Gestión de Estado & Datos**:
  - [Zustand](https://github.com/pmndrs/zustand) (Estado global)
  - [TanStack Query](https://tanstack.com/query/latest) (Server state)
- **Tablas y Listas**: [TanStack Table](https://tanstack.com/table/latest)
- **Mapas**: [Leaflet](https://leafletjs.com/) con [React Leaflet](https://react-leaflet.js.org/)
- **Comunicación en Tiempo Real**: [Socket.io Client](https://socket.io/)
- **Formularios y Validación**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

---

## Comenzando

### Instalación

Instala las dependencias:

```bash
npm install
```

### Desarrollo

Inicia el servidor de desarrollo con HMR:

```bash
npm run dev
```

Tu aplicación estará disponible en `http://localhost:5173`.

## Construcción para Producción

Crea una build de producción:

```bash
npm run build
```
