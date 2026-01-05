import type { MetaFunction } from "react-router";
import { useState, useEffect } from "react";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Plus,
    Pencil,
    Trash2,
    ClipboardList,
    ChevronDown,
    ChevronRight,
    Search,
    Flame,
    Snowflake,
    Zap,
    Wind,
    Settings,
} from "lucide-react";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";

import {
    subscribeToTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
} from "~/lib/firestore";
import type { Template, CreateTemplateDTO } from "~/types";
import { TemplateDialog } from "~/components/templates/template-dialog";
import { DeleteTemplateDialog } from "~/components/templates/delete-template-dialog";

export const meta: MetaFunction = () => {
    return [
        { title: "Activity Templates | MANGRO Admin" },
        { name: "description", content: "Manage maintenance activity templates." },
    ];
};

// Predefined categories with Spanish keys matching legacy data
const CATEGORIES = [
    { value: "EQUIPOS CALIENTES", label: "Equipos Calientes", icon: Flame, color: "text-orange-600 bg-orange-50 border-orange-200" },
    { value: "EQUIPOS DE REFRIGERACION", label: "Equipos de Refrigeración", icon: Snowflake, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { value: "EQUIPO ELECTRICO", label: "Equipos Eléctricos", icon: Zap, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    { value: "EQUIPO ELECTROMECANICO", label: "Equipos Electromecánicos", icon: Settings, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { value: "VENTILACION MECANICA", label: "Ventilación Mecánica", icon: Wind, color: "text-teal-600 bg-teal-50 border-teal-200" },
];

function getCategoryInfo(category: string) {
    let match = CATEGORIES.find(c => c.value === category);
    
    if (!match) {
        if (category === "HOT EQUIPMENT") match = CATEGORIES[0];
        else if (category === "REFRIGERATION EQUIPMENT") match = CATEGORIES[1];
        else if (category === "ELECTRICAL EQUIPMENT") match = CATEGORIES[2];
        else if (category === "ELECTROMECHANICAL EQUIPMENT") match = CATEGORIES[3];
        else if (category === "MECHANICAL VENTILATION") match = CATEGORIES[4];
    }

    return match || { 
        value: category, 
        label: category, 
        icon: ClipboardList, 
        color: "text-slate-600 bg-slate-50 border-slate-200" 
    };
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToTemplates(
            (data) => {
                setTemplates(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading templates:", error);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const openCreateDialog = () => {
        setEditingTemplate(null);
        setDialogOpen(true);
    };

    const openEditDialog = (template: Template) => {
        setEditingTemplate(template);
        setDialogOpen(true);
    };

    const handleSave = async (data: CreateTemplateDTO) => {
        if (editingTemplate) {
            await updateTemplate(editingTemplate.id, data);
        } else {
            await createTemplate(data);
        }
    };

    const handleDelete = async () => {
        if (!templateToDelete) return;
        await deleteTemplate(templateToDelete.id);
        setTemplateToDelete(null);
    };

    const filteredTemplates = templates.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.activities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const templatesByCategory = filteredTemplates.reduce((acc, p) => {
        if (!acc[p.category]) {
            acc[p.category] = [];
        }
        acc[p.category].push(p);
        return acc;
    }, {} as Record<string, Template[]>);

    return (
        <AdminLayout
            title="Protocolos de Actividades"
            subtitle="Gestione protocolos de actividades de mantenimiento por tipo de equipo"
            headerActions={
                <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Protocolo
                </Button>
            }
        >
            <div className="flex flex-col gap-6 flex-1">
                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar protocolos o actividades..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Spinner className="h-8 w-8 text-primary" />
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <ClipboardList className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                No se encontraron protocolos
                            </h3>
                            <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">
                                Cree su primer protocolo para organizar tareas de mantenimiento.
                            </p>
                            <Button onClick={openCreateDialog} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Crear Protocolo
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(templatesByCategory).map(([category, items]) => {
                            const catInfo = getCategoryInfo(category);
                            const Icon = catInfo.icon;
                            
                            return (
                                <Card key={category} className="overflow-hidden">
                                    <CardHeader className={cn("py-3 px-4 border-b", catInfo.color)}>
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5" />
                                            <CardTitle className="text-base font-semibold">
                                                {catInfo.label}
                                            </CardTitle>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50">
                                                {items.length} protocolo{items.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-slate-100">
                                            {items.map((template) => {
                                                const isExpanded = expandedIds.has(template.id);
                                                return (
                                                    <div key={template.id} className="group">
                                                        <div 
                                                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                                            onClick={() => toggleExpand(template.id)}
                                                        >
                                                            <button className="p-1 rounded hover:bg-slate-200 transition-colors">
                                                                {isExpanded ? (
                                                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4 text-slate-500" />
                                                                )}
                                                            </button>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-medium text-slate-900 truncate">
                                                                    {template.name}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className={cn(
                                                                        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                                                        template.serviceType === "PREVENTIVO" && "bg-emerald-50 text-emerald-700",
                                                                        template.serviceType === "CORRECTIVO" && "bg-amber-50 text-amber-700"
                                                                    )}>
                                                                        {template.serviceType || "PREVENTIVO"}
                                                                    </span>
                                                                    <span className="text-xs text-slate-500">
                                                                        • {template.activities.length} actividad{template.activities.length !== 1 ? 'es' : ''}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openEditDialog(template);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setTemplateToDelete(template);
                                                                        setDeleteDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {isExpanded && (
                                                            <div className="px-4 pb-4 pl-12">
                                                                <ul className="space-y-1.5 text-sm text-slate-600">
                                                                    {template.activities.map((activity, idx) => (
                                                                        <li key={idx} className="flex items-start gap-2">
                                                                            <span className="text-slate-400 mt-1">•</span>
                                                                            <span>{activity}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <TemplateDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                template={editingTemplate}
                categories={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                onSave={handleSave}
            />

            <DeleteTemplateDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                template={templateToDelete}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    );
}
