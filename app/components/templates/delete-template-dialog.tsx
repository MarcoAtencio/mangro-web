import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { Template } from "~/types";

interface DeleteTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: Template | null;
    onConfirm: () => Promise<void>;
}

/**
 * Confirmation dialog for deleting a template.
 */
export function DeleteTemplateDialog({
    open,
    onOpenChange,
    template,
    onConfirm,
}: DeleteTemplateDialogProps) {
    const handleDelete = async () => {
        await onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Protocolo</DialogTitle>
                    <DialogDescription>
                        ¿Está seguro de que desea eliminar el protocolo &quot;{template?.name}&quot;? 
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Eliminar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
