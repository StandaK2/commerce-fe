import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  useTheme,
  useMediaQuery,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import { useProducts } from '../hooks/useProducts';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types/product';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    products,
    loading,
    error,
    isPolling,
    lastRefresh,
    createProduct,
    updateProduct,
    deleteProduct,
    manualRefresh,
    togglePolling,
    setUserInteracting,
    clearError
  } = useProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleCreateProduct = async (data: CreateProductRequest): Promise<boolean> => {
    const success = await createProduct(data);
    if (success) {
      setFormOpen(false);
      setEditingProduct(undefined);
    }
    return success;
  };

  const handleUpdateProduct = async (data: UpdateProductRequest): Promise<boolean> => {
    if (!editingProduct) return false;
    
    const success = await updateProduct(editingProduct.id, data);
    if (success) {
      setFormOpen(false);
      setEditingProduct(undefined);
    }
    return success;
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
    setUserInteracting(true); // Pause polling during delete confirmation
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      setUserInteracting(false); // Resume polling
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProduct(undefined);
    clearError();
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    setUserInteracting(false); // Resume polling
  };

  const productToDeleteName = products.find(p => p.id === productToDelete)?.name;

  // Calculate summary statistics
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.price * product.stockQuantity), 0);
  const lowStockProducts = products.filter(product => product.stockQuantity < 10).length;
  const totalSoldCount = products.reduce((sum, product) => sum + product.soldCount, 0);
  const totalRevenue = products.reduce((sum, product) => sum + product.soldSum, 0);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <InventoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Product Management Dashboard
          </Typography>
          
          {/* Polling Controls */}
          <Box display="flex" alignItems="center" gap={1}>
            {!isMobile && lastRefresh && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </Typography>
            )}
            
            <Chip
              label={isPolling ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              color={isPolling ? 'success' : 'default'}
              size="small"
              sx={{
                backgroundColor: isPolling ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                '& .MuiChip-label': {
                  fontSize: '0.75rem'
                }
              }}
            />
            
            <Tooltip title="Manual Refresh">
              <IconButton
                color="inherit"
                onClick={manualRefresh}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isPolling ? 'Pause Auto-Refresh' : 'Enable Auto-Refresh'}>
              <IconButton
                color="inherit"
                onClick={togglePolling}
              >
                {isPolling ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Summary Cards */}
        <Box 
          display="grid" 
          gridTemplateColumns={
            isMobile 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(200px, 1fr))'
          } 
          gap={2} 
          mb={3}
          sx={{ maxWidth: '100%' }}
        >
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" color="primary.main" fontWeight="600">
              {totalProducts}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Products
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" color="info.main" fontWeight="600">
              ${totalInventoryValue.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Inventory Value
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" color="success.main" fontWeight="600">
              {totalSoldCount.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Units Sold
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" color="success.dark" fontWeight="600">
              ${totalRevenue.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Revenue
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" color={lowStockProducts > 0 ? 'warning.main' : 'success.main'} fontWeight="600">
              {lowStockProducts}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Low Stock Items
            </Typography>
          </Box>
        </Box>

        {/* Header with Create Button */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Products
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            Add Product
          </Button>
        </Box>

        {/* Product List */}
        {loading && products.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            gap={2}
          >
            <CircularProgress size={40} />
            <Typography variant="body1" color="text.secondary">
              Loading products...
            </Typography>
          </Box>
        ) : products.length === 0 && !loading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            gap={2}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              p: 4,
              textAlign: 'center'
            }}
          >
            <InventoryIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Get started by creating your first product
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
            >
              Add Your First Product
            </Button>
          </Box>
        ) : (
          <ProductList
            products={products}
            loading={loading}
            error={error}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onClearError={clearError}
            lastRefresh={lastRefresh}
          />
        )}

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Fab
            color="primary"
            aria-label="add product"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={() => setFormOpen(true)}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Product Form Dialog */}
        <ProductForm
          open={formOpen}
          product={editingProduct}
          loading={loading}
          error={error}
          onClose={handleCloseForm}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onClearError={clearError}
          onUserInteracting={setUserInteracting}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the product "{productToDeleteName}"?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteProduct}
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
