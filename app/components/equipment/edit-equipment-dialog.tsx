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
import { Pencil, Trash2, Calendar } from "lucide-react";
import { updateEquipment, deleteEquipment, subscribeToTemplates, type Equipment, type Template } from "~/lib/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export function EditEquipmentDialog({ clientId, equipment }: { clientId: string; equipment: Equipment }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Initialize state with default values or from prop
    const [formData, setFormData] = useState({
        name: equipment.name,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        lastMaintenance: equipment.lastMaintenance
            ? equipment.lastMaintenance instanceof Date
                ? equipment.lastMaintenance.toISOString().split("T")[0]
                : (equipment.lastMaintenance as any).toDate().toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        checklistTemplateId: equipment.checklistTemplateId || "",
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

    // Update form data when equipment or open state changes
    useEffect(() => {
        if (open) {
            setFormData({
                name: equipment.name,
                model: equipment.model,
                serialNumber: equipment.serialNumber,
                status: equipment.status,
                lastMaintenance: equipment.lastMaintenance
                    ? equipment.lastMaintenance instanceof Date
                        ? equipment.lastMaintenance.toISOString().split("T")[0]
                        : new Date(equipment.lastMaintenance as any).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                checklistTemplateId: equipment.checklistTemplateId || "",
            });
        }
    }, [equipment, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Append time to ensure it doesn't shift day due to timezone
            const dateValue = new Date(`${formData.lastMaintenance}T12:00:00`);
            await updateEquipment(clientId, equipment.id, {
                name: formData.name,
                model: formData.model,
                serialNumber: formData.serialNumber,
                status: formData.status as any,
                lastMaintenance: dateValue,
                checklistTemplateId: formData.checklistTemplateId === "none" ? "" : formData.checklistTemplateId,
            });
            setLoading(false);
            setOpen(false);
        } catch (error) {
            console.error("Error updating equipment:", error);
            setLoading(false);
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        setLoading(true);
        try {
            await deleteEquipment(clientId, equipment.id);
            setLoading(false);
            setOpen(false);
        } catch (error) {
            console.error("Error deleting equipment:", error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-100 rounded-full"
                >
                    <Pencil className="h-4 w-4 text-slate-400 hover:text-primary transition-colors" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Equipment</DialogTitle>
                        <DialogDescription>
                            Modify equipment details or delete if no longer needed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Equipment Information
                            </h4>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-eq-name">Name</Label>
                                <Input
                                    id="edit-eq-name"
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
                                    <Label htmlFor="edit-eq-model">Model</Label>
                                    <Input
                                        id="edit-eq-model"
                                        placeholder="Model XYZ"
                                        required
                                        value={formData.model}
                                        onChange={(e) =>
                                            setFormData({ ...formData, model: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-eq-serie">Serial Number</Label>
                                    <Input
                                        id="edit-eq-serie"
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
                                <Label htmlFor="edit-eq-template">Activity Template (Link)</Label>
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
                                    This template defines preventative activities for this equipment.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Status & Maintenance
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-eq-status">Status</Label>
                                    <select
                                        id="edit-eq-status"
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value as any,
                                            })
                                        }
                                    >
                                        <option value="active">Active</option>
                                        <option value="maintenance">In Maintenance</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-eq-mant">Last Maint.</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="edit-eq-mant"
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

                    {showDeleteConfirm && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                            <strong>Delete Equipment?</strong> Confirm if you really want to delete this equipment.
                        </div>
                    )}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                        <Button
                            type="button"
                            variant={showDeleteConfirm ? "destructive" : "outline"}
                            className={
                                showDeleteConfirm
                                    ? ""
                                    : "text-red-600 border-red-200 hover:bg-red-50"
                            }
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {showDeleteConfirm ? "Confirm" : "Delete"}
                        </Button>
                        <div className="flex gap-2 justify-end mt-2 sm:mt-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setOpen(false);
                                    setShowDeleteConfirm(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Spinner className="mr-2 h-4 w-4" />}
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
