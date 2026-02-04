"use client";

import { Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ProductCard, { Product } from "./ProductCard";

type Props = {
  products: Product[];
};

export default function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" align="center">
          No reults found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid
            key={product.id}
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          >
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
