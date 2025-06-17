import React from "react";
import { Button, Box } from "@mui/material";

export default function SaveButton({ onClick }: { onClick: () => void }) {
    return (
        <Box>
            <Button
                variant="contained"
                color="primary"
                sx={{ display: "block", marginLeft: "auto", mt: 3 }}
                onClick={onClick}
            >
                Save
            </Button>
        </Box>
    );
}
