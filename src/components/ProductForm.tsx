import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Product, ProductFormData, CreateProductRequest, UpdateProductRequest } from '../types/product';

interface ProductFormProps {
  open: boolean;
  product?: Product;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<boolean>;
  onClearError: () => void;
  onUserInteracting?: (interacting: boolean) => void;
}

// Validation schema based on backend validation rules
const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Product name cannot be blank')
    .trim()
    .min(1, 'Product name cannot be blank'),
  price: yup
    .string()
    .required('Price cannot be null')
    .test('is-decimal', 'Price must be a valid number', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0.01;
    })
    .test('min-price', 'Price must be greater than zero', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return num >= 0.01;
    }),
  stockQuantity: yup
    .string()
    .required('Stock quantity cannot be null')
    .test('is-integer', 'Stock quantity must be a valid number', (value) => {
      if (!value) return false;
      const num = parseInt(value);
      return !isNaN(num) && Number.isInteger(num) && num >= 0;
    })
    .test('min-stock', 'Stock quantity cannot be negative', (value) => {
      if (!value) return false;
      const num = parseInt(value);
      return num >= 0;
    }),
});

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  product,
  loading,
  error,
  onClose,
  onSubmit,
  onClearError,
  onUserInteracting
}) => {
  const isEdit = !!product;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price?.toString() || '',
      stockQuantity: product?.stockQuantity?.toString() || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: product?.name || '',
        price: product?.price?.toString() || '',
        stockQuantity: product?.stockQuantity?.toString() || '',
      });
      onClearError();
      onUserInteracting?.(true); // Pause polling when form is open
    } else {
      onUserInteracting?.(false); // Resume polling when form is closed
    }
  }, [open, product, reset, onClearError, onUserInteracting]);

  const handleFormSubmit = async (data: ProductFormData) => {
    const request = {
      name: data.name.trim(),
      price: parseFloat(data.price),
      stockQuantity: parseInt(data.stockQuantity),
    };

    const success = await onSubmit(request);
    if (success) {
      onClose();
      reset();
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    onClearError();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Product' : 'Create New Product'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Product Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={loading}
                />
              )}
            />

            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price ($)"
                  type="number"
                  fullWidth
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  disabled={loading}
                  inputProps={{
                    step: '0.01',
                    min: '0.01'
                  }}
                />
              )}
            />

            <Controller
              name="stockQuantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Stock Quantity"
                  type="number"
                  fullWidth
                  error={!!errors.stockQuantity}
                  helperText={errors.stockQuantity?.message}
                  disabled={loading}
                  inputProps={{
                    min: '0',
                    step: '1'
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;
