import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserCheck } from "lucide-react";

type RemoveBlacklistDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    visitorName?: string;
    isLoading?: boolean;
    onConfirm: () => void;
};

export default function RemoveBlacklistDialog({
    open,
    onOpenChange,
    visitorName,
    isLoading,
    onConfirm,
}: RemoveBlacklistDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-emerald-50 text-emerald-600">
                        <UserCheck />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Remove from Blacklist?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {visitorName ?? "This visitor"} will be able to register
                        for campus access again.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isLoading ? "Removing..." : "Remove"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
