import type { CreateTemplateDTO } from "~/lib/firestore";

// ... (content replaced in next tool call due to size, just updating logic here)
export const DEFAULT_TEMPLATES: CreateTemplateDTO[] = [
    {
        name: "COCINA O FORNILLON",
        category: "EQUIPOS CALIENTES",
        serviceType: "PREVENTIVO",
        activities: [
            "Limpieza de mascareta de equipo.",
            "Limpieza de estructuras laterales (Zonas accesibles).",
            "Limpieza de parrillas.",
            "Limpieza de tuberías de cobre.",
            "Limpieza interna y externa de quemadores.",
            "Cambio de pernos, tuercas y aros.",
            "Limpieza de válvulas de gas.",
            "Limpieza y calibración de inyectores.",
            "Ajuste de mangueras y componentes mecánicos.",
            "Pruebas de llama de combustión.",
            "Pruebas de fuga de gas."
        ]
    },
    {
        name: "PLANCHA FREIDORA",
        category: "EQUIPOS CALIENTES",
        serviceType: "PREVENTIVO",
        activities: [
            "Limpieza de estructura externa.",
            "Limpieza de estructura interna.",
            "Limpieza de quemadores.",
            "Limpieza de tuberías de cobre.",
            "Limpieza de inyectores.",
            "Limpieza de plancha freidora.",
            "Reajuste de manguera de alimentación de gas.",
            "Calibración de llama.",
            "Pruebas de fuga de gas."
        ]
    },
    {
        name: "HORNO A GAS",
        category: "EQUIPOS CALIENTES",
        serviceType: "PREVENTIVO",
        activities: [
            "Limpieza de estructura externa.",
            "Limpieza de estructura de cabina interna.",
            "Limpieza de puerta.",
            "Verificación de estado de contrapesos.",
            "Verificación y limpieza de ladrillos refractarios.",
            "Limpieza de quemadores.",
            "Limpieza y verificación de piloto.",
            "Limpieza de llave de paso de gas.",
            "Limpieza de tuberías de cobre e inyectores.",
            "Calibración de llama.",
            "Verificación de aislamiento de estructura interna.",
            "Verificación de fuga de gas.",
            "Pruebas de funcionalidad."
        ]
    },
    {
        name: "FREIDORA DE PAPAS MECANICA",
        category: "EQUIPOS CALIENTES",
        serviceType: "PREVENTIVO",
        activities: [
            "Limpieza de cuba.",
            "Limpieza de estructura externa.",
            "Limpieza de estructura interna.",
            "Limpieza y revisión de válvula a milivoltios.",
            "Limpieza de termopila.",
            "Limpieza de piloto.",
            "Limpieza de quemadores.",
            "Limpieza de flautas.",
            "Limpieza y revisión de difusores de calor.",
            "Limpieza de cableado eléctrico.",
            "Limpieza de base.",
            "Medición de milivoltaje.",
            "Reajuste de manguera de alimentación de gas.",
            "Pruebas de funcionalidad."
        ]
    },
    {
        name: "REFRIGERACION Y CONGELACION",
        category: "EQUIPOS DE REFRIGERACION",
        serviceType: "PREVENTIVO",
        activities: [
            "Limpieza de unidad condensadora.",
            "Limpieza de motor y aspa ventilador de condensador.",
            "Cambio de aislamiento de tubería de baja.",
            "Limpieza de compresor.",
            "Limpieza de bandeja de drenaje.",
            "Cambio de terminales eléctricos.",
            "Limpieza de motor y aspa ventilador de evaporador.",
            "Limpieza de drenaje de evaporador.",
            "Ajuste de cables de tierra.",
            "Verificación de resistencia de evaporador (Congelación).",
            "Verificación de resistencia de drenaje (Congelación).",
            "Revisión y limpieza de control de temperatura.",
            "Medición de consumo de componentes mecánicos.",
            "Toma de temperatura de cabina interna."
        ]
    },
    {
        name: "REFRESQUERA",
        category: "EQUIPOS DE REFRIGERACION",
        serviceType: "PREVENTIVO",
        activities: [
            "Limpieza de unidad condensadora.",
            "Limpieza de motor ventilador + aspa de condensador.",
            "Limpieza de compresor.",
            "Limpieza de tuberías de cobre.",
            "Limpieza de filtro secador.",
            "Limpieza de aislamiento de tubería de baja.",
            "Limpieza de accesorios.",
            "Limpieza de base de unidad condensadora.",
            "Verificación y limpieza de control de temperatura.",
            "Medición de consumo de componentes mecánicos.",
            "Toma de temperatura.",
            "Pruebas de funcionalidad."
        ]
    },
    {
        name: "MESA CALIENTE ELECTRICA",
        category: "EQUIPO ELECTRICO",
        serviceType: "PREVENTIVO",
        activities: [
            "Limpieza de estructura.",
            "Desmontaje de resistencia y pruebe de aislamiento (megado).",
            "Limpieza y revisión de control de temperatura.",
            "Limpieza y revisión de cableado eléctrico.",
            "Limpieza y revisión de cable de alimentación.",
            "Limpieza y revisión de aislamiento térmico.",
            "Limpieza y revisión de llave de paso de agua.",
            "Limpieza y revisión de luminaria.",
            "Verificación de puesta a tierra de equipo."
        ]
    },
    {
        name: "LICUADORA INDUSTRIAL",
        category: "EQUIPO ELECTROMECANICO",
        serviceType: "PREVENTIVO",
        activities: [
            "Cambio de rodajes de vaso.",
            "Cambio de sello mecánico.",
            "Cambio de rodajes de motor.",
            "Barnizado de bobina.",
            "Engrase de componentes mecánicos.",
            "Medición de aislamiento (megado) y corriente (amperaje).",
            "Afilado de cuchilla.",
            "Limpieza y verificación de componentes eléctricos.",
            "Limpieza de estructura interna y externa.",
            "Pruebas de funcionalidad."
        ]
    },
    {
        name: "SISTEMA DE EXTRACCION",
        category: "VENTILACION MECANICA",
        serviceType: "PREVENTIVO",
        activities: [
            "Desengrase y limpieza interior y exterior de campana.",
            "Limpieza de embocadura de ducto de succión de campana (Zonas accesibles).",
            "Limpieza de ducto de succión parte externa.",
            "Limpieza de luminaria tipo nave.",
            "Lavado de filtros de grasa.",
            "Desmontaje de corredera para limpieza interna de ducto de succión.",
            "Apertura de tapa de inspección de extractor.",
            "Desmontaje de ducto de descarga y limpieza interna y externa.",
            "Limpieza interna de extractor centrífugo.",
            "Verificación de estado de turbina.",
            "Sellado de tapa de inspección con tornillos autoperforantes y silicona de alta temperatura.",
            "Verificación, limpieza y engrase de componentes mecánicos.",
            "Limpieza externa de motor eléctrico.",
            "Engrase de chumacera de transmisión.",
            "Medición de consumo eléctrico.",
            "Medición de RPM de motor eléctrico.",
            "Verificación de alineamiento de poleas.",
            "Pruebas de funcionalidad."
        ]
    },
    {
        name: "SISTEMA DE INYECCION",
        category: "VENTILACION MECANICA",
        serviceType: "PREVENTIVO",
        activities: [
            "Limpieza de filtros malla azul.",
            "Limpieza de ductería de inyección.",
            "Desmontaje de filtros corrugados.",
            "Limpieza interna de turbina.",
            "Engrase de rodajes.",
            "Limpieza y engrase de eje.",
            "Limpieza de polea motriz y conducida.",
            "Revisión de correas de transmisión.",
            "Rociado de aditivo de agarre para faja de transmisión.",
            "Verificación de alineamiento de poleas.",
            "Verificación y limpieza de borneras de motor eléctrico.",
            "Megado de bobina de motor eléctrico.",
            "Verificación y limpieza de ventiladores de tablero eléctrico.",
            "Verificación y limpieza de relés electromecánicos y variador de velocidad.",
            "Limpieza de cableado eléctrico.",
            "Medición de consumo de componentes mecánicos."
        ]
    }
];
