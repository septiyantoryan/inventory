import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Alert Dialog Component
interface AlertDialogData {
    title: string;
    description: string;
    onConfirm?: () => void;
}

export function useAlertDialog() {
    const [alertData, setAlertData] = useState<AlertDialogData | null>(null);

    const showAlert = (title: string, description: string, onConfirm?: () => void) => {
        setAlertData({ title, description, onConfirm });
    };

    const AlertDialogComponent = () => {
        if (!alertData) return null;

        return (
            <AlertDialog open={!!alertData} onOpenChange={() => setAlertData(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertData.title}</AlertDialogTitle>
                        <AlertDialogDescription className="whitespace-pre-wrap">
                            {alertData.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => {
                                alertData.onConfirm?.();
                                setAlertData(null);
                            }}
                        >
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    };

    return { showAlert, AlertDialogComponent };
}

// Confirm Dialog Component
interface ConfirmDialogData {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

export function useConfirmDialog() {
    const [confirmData, setConfirmData] = useState<ConfirmDialogData | null>(null);

    const showConfirm = (
        title: string,
        description: string,
        onConfirm: () => void,
        options?: {
            onCancel?: () => void;
            confirmText?: string;
            cancelText?: string;
            variant?: 'default' | 'destructive';
        }
    ) => {
        setConfirmData({
            title,
            description,
            onConfirm,
            onCancel: options?.onCancel,
            confirmText: options?.confirmText || 'Lanjutkan',
            cancelText: options?.cancelText || 'Batal',
            variant: options?.variant || 'default',
        });
    };

    const ConfirmDialogComponent = () => {
        if (!confirmData) return null;

        return (
            <AlertDialog open={!!confirmData} onOpenChange={() => setConfirmData(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmData.title}</AlertDialogTitle>
                        <AlertDialogDescription className="whitespace-pre-wrap">
                            {confirmData.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                confirmData.onCancel?.();
                                setConfirmData(null);
                            }}
                        >
                            {confirmData.cancelText}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                confirmData.onConfirm();
                                setConfirmData(null);
                            }}
                            className={confirmData.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {confirmData.confirmText}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    };

    return { showConfirm, ConfirmDialogComponent };
}

// Info Dialog Component (for detailed messages)
interface InfoDialogData {
    title: string;
    description: string;
    details?: string[];
}

export function useInfoDialog() {
    const [infoData, setInfoData] = useState<InfoDialogData | null>(null);

    const showInfo = (title: string, description: string, details?: string[]) => {
        setInfoData({ title, description, details });
    };

    const InfoDialogComponent = () => {
        if (!infoData) return null;

        return (
            <Dialog open={!!infoData} onOpenChange={() => setInfoData(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{infoData.title}</DialogTitle>
                        <DialogDescription className="whitespace-pre-wrap">
                            {infoData.description}
                        </DialogDescription>
                    </DialogHeader>
                    {infoData.details && infoData.details.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="font-medium text-sm">Detail:</p>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                                <ul className="text-sm space-y-1">
                                    {infoData.details.map((detail, index) => (
                                        <li key={index} className="text-gray-700">
                                            • {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setInfoData(null)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return { showInfo, InfoDialogComponent };
}
