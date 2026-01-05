
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { createClient, createEquipment, type CreateClientDTO, type CreateEquipmentDTO } from "~/lib/firestore";
import { Loader2, Database } from "lucide-react";

const MOCK_CLIENT_NAMES = [
    "Corporación Lindley S.A.", "Alicorp S.A.A.", "Gloria S.A.", "San Fernando S.A.",
    "Compañía Minera Antamina", "Ferreyros S.A.", "Supermercados Peruanos S.A.",
    "Cencosud Retail Perú", "Tiendas por Departamento Ripley", "Saga Falabella S.A.",
    "Banco de Crédito del Perú", "BBVA Perú", "Scotiabank Perú", "Interbank",
    "Cementos Pacasmayo", "Unacem", "Siderperú", "Aceros Arequipa",
    "Graña y Montero", "Cosapi S.A."
];

const MOCK_ADDRESSES = [
    "Av. Javier Prado Este 1234, San Isidro, Lima",
    "Av. La Marina 500, San Miguel, Lima",
    "Jr. de la Unión 100, Cercado de Lima",
    "Av. Arequipa 456, Miraflores, Lima",
    "Av. Salaverry 2020, Jesús María, Lima",
    "Av. Benavides 300, Surco, Lima",
    "Calle Las Begonias 441, San Isidro, Lima",
    "Av. Nicolás Arriola 789, La Victoria, Lima",
    "Av. El Sol 101, Barranco, Lima",
    "Av. Pardo 555, Miraflores, Lima"
];

const MOCK_EQUIPMENT_TYPES = [
    { name: "Aire Acondicionado Split", model: "Samsung WindFree", category: "HVAC" },
    { name: "Chiller 500TN", model: "Trane Series R", category: "HVAC" },
    { name: "Grupo Electrógeno", model: "Caterpillar C15", category: "Power" },
    { name: "Sistema Contra Incendios", model: "Bosch FPA-5000", category: "Safety" },
    { name: "Cámara Frigorífica", model: "Bohn 20x20", category: "Refrigeration" },
    { name: "Ascensor de Carga", model: "Schindler 5500", category: "Transport" },
    { name: "Bomba de Agua", model: "Pedrollo F4", category: "Hydraulic" },
    { name: "Compresor de Aire", model: "Ingersoll Rand R-Series", category: "Industrial" }
];

export function ClientSeeder() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const generateRandomRuc = () => "20" + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const generateRandomPhone = () => "+51 " + Math.floor(900000000 + Math.random() * 99999999).toString();
    const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    // Lima coordinates bounding box approx
    const generateRandomLocation = () => ({
        lat: -12.0 - Math.random() * 0.2,
        lng: -77.0 - Math.random() * 0.1
    });

    const handleSeed = async () => {
        if (!confirm("¿Estás seguro de que quieres generar datos de prueba? Esto creará múltiples clientes y equipos.")) return;
        
        setLoading(true);
        setStatus("Iniciando generación de datos...");

        try {
            let clientsCreated = 0;
            let equipmentsCreated = 0;

            for (const clientName of MOCK_CLIENT_NAMES) {
                setStatus(`Creando cliente: ${clientName}...`);
                
                const location = generateRandomLocation();
                const clientData: CreateClientDTO = {
                    name: clientName,
                    ruc: generateRandomRuc(),
                    address: getRandomItem(MOCK_ADDRESSES),
                    phone: generateRandomPhone(),
                    email: `contacto@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                    contactName: "Gerente de Operaciones",
                    lat: location.lat,
                    lng: location.lng
                };

                const clientId = await createClient(clientData);
                clientsCreated++;

                // Create 1-5 equipment per client
                const numEquipment = Math.floor(Math.random() * 5) + 1;
                
                for (let i = 0; i < numEquipment; i++) {
                    const eqType = getRandomItem(MOCK_EQUIPMENT_TYPES);
                    const eqData: CreateEquipmentDTO = {
                        name: eqType.name,
                        model: eqType.model,
                        serialNumber: `SN-${Math.floor(Math.random() * 1000000)}`,
                        lastMaintenance: new Date(),
                        status: Math.random() > 0.8 ? "MANTENIMIENTO" : "OPERATIVO",
                        // Note: actual checklistTemplateId would need real IDs, leaving undefined for now or we could fetch templates first.
                    };
                    
                    await createEquipment(clientId, eqData);
                    equipmentsCreated++;
                }
            }

            setStatus(`¡Éxito! Se crearon ${clientsCreated} clientes y ${equipmentsCreated} equipos.`);
        } catch (error) {
            console.error(error);
            setStatus("Error al generar datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Generador de Clientes
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
                Puebla la base de datos con clientes y equipos ficticios.
            </p>
            <div className="flex items-center gap-3">
                <Button onClick={handleSeed} disabled={loading} size="sm" variant="outline">
                    {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Generar Clientes y Equipos
                </Button>
                {status && <span className="text-xs text-slate-600">{status}</span>}
            </div>
        </div>
    );
}
