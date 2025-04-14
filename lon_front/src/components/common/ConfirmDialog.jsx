import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';

function ConfirmDialog({ open, title, content, onConfirm, onCancel }) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{content}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Annuler</Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Confirmer
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmDialog; 