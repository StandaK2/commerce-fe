import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Tooltip,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
  GridSortModel
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { Product, ProductFilters } from '../types/product';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onClearError: () => void;
  lastRefresh?: Date | null;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  error,
  onEdit,
  onDelete,
  onClearError,
  lastRefresh
}) => {
  const [filters, setFilters] = useState<ProductFilters>({
    searchName: '',
    minStockQuantity: null,
    maxStockQuantity: null,
    minPrice: null,
    maxPrice: null,
    minSoldCount: null,
    maxSoldCount: null,
    minSoldSum: null,
    maxSoldSum: null,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' }
  ]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Name search
      if (filters.searchName && !product.name.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }
      
      // Stock quantity filters
      if (filters.minStockQuantity !== null && product.stockQuantity < filters.minStockQuantity) {
        return false;
      }
      if (filters.maxStockQuantity !== null && product.stockQuantity > filters.maxStockQuantity) {
        return false;
      }
      
      // Price filters
      if (filters.minPrice !== null && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && product.price > filters.maxPrice) {
        return false;
      }
      
      // Sold count filters
      if (filters.minSoldCount !== null && product.soldCount < filters.minSoldCount) {
        return false;
      }
      if (filters.maxSoldCount !== null && product.soldCount > filters.maxSoldCount) {
        return false;
      }
      
      // Sold sum filters
      if (filters.minSoldSum !== null && product.soldSum < filters.minSoldSum) {
        return false;
      }
      if (filters.maxSoldSum !== null && product.soldSum > filters.maxSoldSum) {
        return false;
      }
      
      return true;
    });

    // Apply sorting
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      filtered.sort((a, b) => {
        const aValue = a[field as keyof Product];
        const bValue = b[field as keyof Product];
        
        if (aValue < bValue) return sort === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [products, filters, sortModel]);

  const handleFilterChange = (field: keyof ProductFilters, value: string | number | null) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      searchName: '',
      minStockQuantity: null,
      maxStockQuantity: null,
      minPrice: null,
      maxPrice: null,
      minSoldCount: null,
      maxSoldCount: null,
      minSoldSum: null,
      maxSoldSum: null,
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      type: 'number',
      valueFormatter: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      field: 'stockQuantity',
      headerName: 'Stock',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 0 ? 'error' : params.value < 10 ? 'warning' : 'success'}
          size="small"
        />
      ),
    },
    {
      field: 'soldCount',
      headerName: 'Sold Count',
      width: 120,
      type: 'number',
    },
    {
      field: 'soldSum',
      headerName: 'Sold Sum',
      width: 120,
      type: 'number',
      valueFormatter: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      type: 'dateTime',
      valueFormatter: (value: string) => new Date(value).toLocaleString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams<Product>) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit Product">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => onEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete Product">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => onDelete(params.row.id)}
        />,
      ],
    },
  ];

  const NumberFilterField: React.FC<{
    label: string;
    minField: keyof ProductFilters;
    maxField: keyof ProductFilters;
  }> = ({ label, minField, maxField }) => (
    <Box display="flex" flexDirection="column" height="100%">
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', height: '16px' }}>
        {label}
      </Typography>
      <Box display="flex" gap={0.5} flex={1}>
        <TextField
          size="small"
          type="number"
          placeholder="Min"
          value={filters[minField] || ''}
          onChange={(e) => handleFilterChange(minField, e.target.value ? Number(e.target.value) : null)}
          sx={{ 
            flex: 1,
            '& .MuiInputBase-input': {
              fontSize: '0.75rem',
              padding: '6px 8px'
            },
            '& .MuiInputBase-input::placeholder': {
              fontSize: '0.75rem'
            }
          }}
        />
        <TextField
          size="small"
          type="number"
          placeholder="Max"
          value={filters[maxField] || ''}
          onChange={(e) => handleFilterChange(maxField, e.target.value ? Number(e.target.value) : null)}
          sx={{ 
            flex: 1,
            '& .MuiInputBase-input': {
              fontSize: '0.75rem',
              padding: '6px 8px'
            },
            '& .MuiInputBase-input::placeholder': {
              fontSize: '0.75rem'
            }
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterIcon />
              <Typography variant="h6">Filters</Typography>
              {Object.values(filters).some(v => v !== null && v !== '') && (
                <Chip label="Active" color="primary" size="small" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" flexWrap="wrap" gap={2} alignItems="flex-end">
                <Box flex="1" minWidth="200px" maxWidth="33%">
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', height: '16px' }}>
                    Search
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name"
                    value={filters.searchName}
                    onChange={(e) => handleFilterChange('searchName', e.target.value)}
                  />
                </Box>
                
                <Box flex="1" minWidth="180px">
                  <NumberFilterField
                    label="Stock Quantity"
                    minField="minStockQuantity"
                    maxField="maxStockQuantity"
                  />
                </Box>
                
                <Box flex="1" minWidth="180px">
                  <NumberFilterField
                    label="Price ($)"
                    minField="minPrice"
                    maxField="maxPrice"
                  />
                </Box>
                
                <Box flex="1" minWidth="180px">
                  <NumberFilterField
                    label="Sold Count"
                    minField="minSoldCount"
                    maxField="maxSoldCount"
                  />
                </Box>
                
                <Box flex="1" minWidth="180px">
                  <NumberFilterField
                    label="Sold Sum ($)"
                    minField="minSoldSum"
                    maxField="maxSoldSum"
                  />
                </Box>
              </Box>
              
              <Box>
                <Chip
                  label="Reset Filters"
                  onClick={resetFilters}
                  variant="outlined"
                  clickable
                  size="small"
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredAndSortedProducts}
          columns={columns}
          loading={loading}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />
      </Paper>

      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Showing {filteredAndSortedProducts.length} of {products.length} products
        </Typography>
      </Box>
    </Box>
  );
};

export default ProductList;
