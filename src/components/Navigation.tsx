'use client';

import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Image Metadata Tool
        </Typography>
        <Button
          color={pathname === '/' ? 'primary' : 'inherit'}
          component={Link}
          href="/"
        >
          CSV Metadata
        </Button>
        <Button
          color={pathname === '/analyzer' ? 'primary' : 'inherit'}
          component={Link}
          href="/analyzer"
        >
          AI Analyzer
        </Button>
      </Toolbar>
    </AppBar>
  );
}
