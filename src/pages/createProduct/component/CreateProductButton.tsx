const CreateProductButton = () => {
    return (
        <div className="flex items-center justify-end gap-4">
            <button className="px-3 py-2 text-white rounded-md shadow-md mt-4 hover:bg-black bg-[#051a2d]">Cancel</button>
            <button className="px-3 py-2 text-white rounded-md shadow-md mt-4 bg-[var(--color-primary)]">Add Product</button>
        </div>
    );
};

export default CreateProductButton;