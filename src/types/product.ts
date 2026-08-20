export interface ProductFormData {
    store: string;
    warehouse: string;
    productName: string;
    slug: string;
    sku: string;
    sellingType: string;
    category: string;
    subCategory: string;
    brand: string;
    unit: string;
    barcodeSymbology: string;
    itemBarcode: string;
    quantity?: number;
    quantityAlert?: number;
}

export interface SelectOption {
    label: string;
    value: string;
} 