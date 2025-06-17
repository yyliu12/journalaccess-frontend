import { Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router';

export default function BackButton() {
    const navigate = useNavigate();

    return (
        <Button sx={{ mb: 1 }} onClick={() => { navigate(-1) }} variant="outlined">Back</Button>
    );
}