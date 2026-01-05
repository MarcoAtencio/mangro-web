
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { createUser, type User } from "~/lib/firestore";
import { Loader2, Users } from "lucide-react";
import { registerUser } from "~/lib/auth-admin";
import { useAuth } from "~/lib/auth";

const MOCK_USERS = [
    { fullName: "Carlos Rodriguez", email: "carlos.rodriguez@mangro.com", role: "TECHNICIAN", phone: "987654321" },
    { fullName: "Ana Morales", email: "ana.morales@mangro.com", role: "TECHNICIAN", phone: "912345678" },
    { fullName: "Luis Torres", email: "luis.torres@mangro.com", role: "SUPERVISOR", phone: "998877665" },
    { fullName: "Sofia Chang", email: "sofia.chang@mangro.com", role: "ADMIN", phone: "955443322" },
    { fullName: "Miguel Angel", email: "miguel.angel@mangro.com", role: "TECHNICIAN", phone: "966554433" },
];

const DEFAULT_PASSWORD = "mangro-password-123";

export function UserSeeder() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const handleSeedUsers = async () => {
        if (!confirm(`¿Estás seguro? Se crearán ${MOCK_USERS.length} usuarios reales en Authentication.\n\nContraseña por defecto: ${DEFAULT_PASSWORD}`)) return;

        setLoading(true);
        setStatus("Generando usuarios...");

        try {
            let usersCreated = 0;
            // Process sequentially to avoid rate limits or Auth race conditions
            for (const user of MOCK_USERS) {
                setStatus(`Creando usuario Auth: ${user.fullName}...`);
                
                // 1. Create Auth User (using secondary app workaround)
                let uid;
                try {
                    uid = await registerUser(user.email, DEFAULT_PASSWORD);
                } catch (error: any) {
                    if (error.code === 'auth/email-already-in-use') {
                        console.warn(`User ${user.email} already exists, skipping Auth creation.`);
                        // Continue to try updating/creating Firestore doc or just skip
                        continue; 
                    }
                    throw error;
                }

                 // 2. Create Firestore Document with same UID
                if (uid) {
                     await createUser({
                        ...user,
                        photoUrl: "",
                        role: user.role as "ADMIN" | "TECHNICIAN" | "SUPERVISOR"
                    }, uid); // Pass uid as customUid
                    usersCreated++;
                }
            }

            setStatus(`¡Éxito! Se crearon ${usersCreated} usuarios con acceso.`);
        } catch (error: any) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Generador de Usuarios (Reales)
            </h3>
            <div className="bg-emerald-50 border border-emerald-200 rounded p-3 mb-4 text-xs text-emerald-800">
                <strong>Nota:</strong> Ahora se crearán usuarios reales en <em>Firebase Authentication</em>.
                <br />
                Contraseña por defecto: <code className="bg-emerald-100 px-1 rounded">{DEFAULT_PASSWORD}</code>
            </div>
            <div className="flex items-center gap-3">
                <Button onClick={handleSeedUsers} disabled={loading} size="sm" variant="outline">
                    {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Generar Usuarios
                </Button>
                {status && <span className="text-xs text-slate-600">{status}</span>}
            </div>
        </div>
    );
}
