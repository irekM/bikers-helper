"use client";

import { Button, Container, Typography } from "@mui/material";

export default function Home() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bikers Helper
      </Typography>

      <Button variant="contained">Test MUI</Button>
    </Container>
  );
}
