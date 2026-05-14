'use client';

import { Button, type ButtonProps } from '@mui/material';
import type { ElementType } from 'react';

type ActionButtonProps<C extends ElementType = 'button'> = ButtonProps<C, { component?: C }>;

export default function ActionButton<C extends ElementType = 'button'>({ sx, children, ...props }: ActionButtonProps<C>) {
  return (
    <Button
      size="large"
      fullWidth
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        py: 1.5,
        borderRadius: 2,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
