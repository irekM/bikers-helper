"use client";

import { Button, Container, Typography } from "@mui/material";
import ProductGrid from "@/components/products/ProductGridContainer";

const mockProducts = [
  {
    id: "1",
    title: "Yamaha MT-07",
    price: 32000,
    //image: "https://via.placeholder.com/300",
  },
  {
    id: "2",
    title: "Honda CB650R",
    price: 41000,
    //image: "https://via.placeholder.com/300",
  },
];

export default function Home() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bikers Helper
      </Typography>

       <ProductGrid products={mockProducts} />
    </Container>
  );
}
