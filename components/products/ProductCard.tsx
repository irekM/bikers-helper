"use client";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
} from "@mui/material";

export type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
};

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <Card>
      {product.image && (
        <CardMedia
          component="img"
          height="160"
          image={product.image}
          alt={product.title}
        />
      )}

      <CardContent>
        <Typography variant="h6" noWrap>
          {product.title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {product.price} zł
        </Typography>
      </CardContent>

      <CardActions>
        <Button size="small">Szczegóły</Button>
      </CardActions>
    </Card>
  );
}
