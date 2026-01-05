import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Plus, Trash2 } from "lucide-react";
import type { Template, CreateTemplateDTO, ServiceType } from "~/types";

interface TemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template?: Template | null;
    categories: { value: string; label: string }[];
    onSave: (data: CreateTemplateDTO) => Promise<void>;
}

/**
 * Dialog for creating or editing a template.
 * Handles form state and validation internally.
 */
export function TemplateDialog({
    open,
    onOpenChange,
    template,
    categories,
    onSave,
}: TemplateDialogProps) {
    const [formName, setFormName] = useState("");
    const [formCategory, setFormCategory] = useState(categories[0]?.value || "");
    const [_formServiceType, setFormServiceType] = useState<ServiceType>("PREVENTIVO");
    const [activitiesList, setActivitiesList] = useState<string[]>([""]);
    const [saving, setSaving] = useState(false);

    // Reset form when dialog opens or template changes
    useEffect(() => {
        if (open) {
            if (template) {
                setFormName(template.name);
                setFormCategory(template.category);
                setFormServiceType(template.serviceType || "PREVENTIVO");
                setActivitiesList(template.activities.length > 0 ? [...template.activities] : [""]);
            } else {
                setFormName("");
                setFormCategory(categories[0]?.value || "");
                setFormServiceType("PREVENTIVO");
                setActivitiesList([""]);
            }
        }
    }, [open, template, categories]);

    const handleSave = async () => {
        const validActivities = activitiesList.map(a => a.trim()).filter(a => a.length > 0);
        
        if (!formName.trim() || validActivities.length === 0) return;
        
        setSaving(true);
        try {
            const data: CreateTemplateDTO = {
                name: formName.trim(),
                category: formCategory,
                serviceType: "PREVENTIVO",
                activities: validActivities,
            };

            await onSave(data);
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving template:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddActivity = () => {
        setActivitiesList([...activitiesList, ""]);
    };

    const handleRemoveActivity = (index: number) => {
        const newList = [...activitiesList];
        newList.splice(index, 1);
        setActivitiesList(newList);
    };

    const handleActivityChange = (index: number, value: string) => {
        const newList = [...activitiesList];
        newList[index] = value;
        setActivitiesList(newList);
    };

    const isEditing = !!template;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Protocolo" : "Nuevo Protocolo"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? "Modifique los datos del protocolo de mantenimiento."
                            : "Cree un nuevo protocolo con actividades de mantenimiento."}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <select
                            id="category"
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Protocolo</Label>
                        <Input
                            id="name"
                            placeholder="ej.: COCINA O QUEMADOR"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">
                            Nombre descriptivo del tipo de equipo o sistema.
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Actividades</Label>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleAddActivity}
                                className="h-6 gap-1 text-primary hover:text-primary hover:bg-primary/10"
                            >
                                <Plus className="h-3 w-3" />
                                Agregar
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {activitiesList.map((activity, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <div className="flex-1">
                                        <Input
                                            placeholder={`Actividad ${index + 1}`}
                                            value={activity}
                                            onChange={(e) => handleActivityChange(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddActivity();
                                                }
                                            }}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveActivity(index)}
                                        className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        disabled={activitiesList.length === 1 && activity === ""}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500">
                            Defina las tareas de mantenimiento paso a paso.
                        </p>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || !formName.trim() || activitiesList.every(a => !a.trim())}
                    >
                        {saving ? <Spinner className="h-4 w-4 mr-2" /> : null}
                        {isEditing ? "Guardar Cambios" : "Crear Protocolo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
