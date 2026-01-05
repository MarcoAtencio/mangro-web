import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { AddressPicker } from "~/components/ui/address-picker";
import { createClient } from "~/lib/firestore";
import { Plus } from "lucide-react";

export function NewClientDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        ruc: "",
        phone: "",
        address: "",
        contactName: "",
        email: "",
        lat: 0,
        lng: 0,
    });

    const handleAddressSelect = (address: string, lat: number, lng: number) => {
        setFormData((prev) => ({ ...prev, address, lat, lng }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createClient(formData);
            setLoading(false);
            setOpen(false);
            setFormData({
                name: "",
                ruc: "",
                phone: "",
                address: "",
                contactName: "",
                email: "",
                lat: 0,
                lng: 0,
            });
        } catch (error) {
            console.error("Error creating client:", error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95">
                    <Plus className="h-4 w-4" />
                    New Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Register New Client</DialogTitle>
                        <DialogDescription>
                            Enter client details to register in the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                General Information
                            </h4>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Company Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Company Inc."
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="ruc">RUC (Tax ID)</Label>
                                    <Input
                                        id="ruc"
                                        placeholder="20123456789"
                                        required
                                        value={formData.ruc}
                                        onChange={(e) =>
                                            setFormData({ ...formData, ruc: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+51 1 234 5678"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Location
                            </h4>
                            <AddressPicker
                                onAddressSelect={handleAddressSelect}
                                initialAddress={formData.address}
                            />
                        </div>

                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Contact
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="contactName">Primary Contact</Label>
                                    <Input
                                        id="contactName"
                                        placeholder="Contact Name"
                                        value={formData.contactName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                contactName: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@company.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                    />
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
                            {loading ? "Saving..." : "Register Client"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
