import { useState } from "react";

export const useProductState = () => {
    const [name, setName] = useState("");
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [supplierId, setSupplierId] = useState("");
    const [sku, setSku] = useState("");
    const [description, setDescription] = useState("");
    const [unit, setUnit] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [editProduct, setEditProduct] = useState(null);
    const [products, setProducts] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [searchTerm, setSearchTerm] = useState("");

    return {
        name, setName,
        categories, setCategories,
        categoryId, setCategoryId,
        suppliers, setSuppliers,
        supplierId, setSupplierId,
        sku, setSku,
        description, setDescription,
        unit, setUnit,
        price, setPrice,
        quantity, setQuantity,
        expiryDate, setExpiryDate,
        location, setLocation,
        notes, setNotes,
        editProduct, setEditProduct,
        products, setProducts,
        error, setError,
        loading, setLoading,
        isModalOpen, setIsModalOpen,
        isEditModalOpen, setIsEditModalOpen,
        isDeleteModalOpen, setIsDeleteModalOpen,
        currentPage, setCurrentPage,
        itemsPerPage,
        searchTerm, setSearchTerm,
    };
};
