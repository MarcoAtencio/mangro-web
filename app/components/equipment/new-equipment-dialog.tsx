import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Plus, Calendar } from "lucide-react";
import { createEquipment, subscribeToTemplates, type Template } from "~/lib/firestore";

export function NewEquipmentDialog({ clientId, buttonText = "Add Equipment" }: { clientId: string; buttonText?: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        model: "",
        serialNumber: "",
        status: "active",
        lastMaintenance: new Date().toISOString().split("T")[0],
        checklistTemplateId: "",
    });

    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        if (open) {
            const unsubscribe = subscribeToTemplates((data) => {
                setTemplates(data);
            });
            return () => unsubscribe();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Append time to ensure it doesn't shift day due to timezone
            const dateValue = new Date(`${formData.lastMaintenance}T12:00:00`);
            await createEquipment(clientId, {
                name: formData.name,
                model: formData.model,
                serialNumber: formData.serialNumber,
                status: formData.status as any,
                lastMaintenance: dateValue,
                checklistTemplateId: formData.checklistTemplateId === "none" ? undefined : formData.checklistTemplateId,
            });
            setLoading(false);
            setOpen(false);
            setFormData({
                name: "",
                model: "",
                serialNumber: "",
                status: "active",
                lastMaintenance: new Date().toISOString().split("T")[0],
                checklistTemplateId: "",
            });
        } catch (error) {
            console.error("Error creating equipment:", error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1 shadow-sm">
                    <Plus className="h-4 w-4" />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Equipment</DialogTitle>
                        <DialogDescription>
                            Register new equipment for this client.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Equipment Information
                            </h4>
                            <div className="grid gap-2">
                                <Label htmlFor="eq-name">Name</Label>
                                <Input
                                    id="eq-name"
                                    placeholder="Ex: Air Conditioner"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-model">Model</Label>
                                    <Input
                                        id="eq-model"
                                        placeholder="Model XYZ"
                                        required
                                        value={formData.model}
                                        onChange={(e) =>
                                            setFormData({ ...formData, model: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-serie">Serial Number</Label>
                                    <Input
                                        id="eq-serie"
                                        placeholder="SN-123456"
                                        required
                                        value={formData.serialNumber}
                                        onChange={(e) =>
                                            setFormData({ ...formData, serialNumber: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="eq-template">Activity Template (Link)</Label>
                                <Select
                                    value={formData.checklistTemplateId || "none"}
                                    onValueChange={(val) => 
                                        setFormData({ ...formData, checklistTemplateId: val })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select template..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- No template linked --</SelectItem>
                                        {templates.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} ({p.category})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">
                                    When creating services with this equipment, activities from this template will be loaded automatically.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Status & Maintenance
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-status">Status</Label>
                                    <select
                                        id="eq-status"
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value })
                                        }
                                    >
                                        <option value="active">Active</option>
                                        <option value="maintenance">In Maintenance</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-mant">Last Maint.</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="eq-mant"
                                            type="date"
                                            className="pl-9"
                                            required
                                            value={formData.lastMaintenance}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    lastMaintenance: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Spinner className="mr-2 h-4 w-4" />}
                            {loading ? "Saving..." : "Register Equipment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
