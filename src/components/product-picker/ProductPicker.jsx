import "./ProductPicker.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

function ProductPicker({ onclosePicker, onProductAdd }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  const fetchProducts = async (search, page) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://stageapi.monkcommerce.app/task/products/search?search=${search}&page=${page}&limit=10`,
        {
          headers: {
            "x-api-key": import.meta.env.VITE_API_KEY,
          },
        }
      );
      setProducts((prevProducts) =>
        page === 1 ? response.data : [...prevProducts, ...response.data]
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts("", 1);
  }, []);

  useEffect(() => {
    fetchProducts(searchTerm, 1);
  }, [searchTerm]);

  useEffect(() => {
    if (page > 1) {
      fetchProducts(searchTerm, page);
    }
  }, [page]);

  const handleProductSelection = (product) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.some((p) => p.id === product.id);
      if (isSelected) {
        return prevSelected.filter((p) => p.id !== product.id);
      } else {
        return [...prevSelected, { ...product, variants: product.variants }];
      }
    });
  };

  const handleVariantSelection = (productId, variant) => {
    setSelectedProducts((prevSelected) => {
      const productIndex = prevSelected.findIndex((p) => p.id === productId);
      if (productIndex !== -1) {
        const product = prevSelected[productIndex];
        const variantIndex = product.variants.findIndex(
          (v) => v.id === variant.id
        );

        if (variantIndex !== -1) {
          const updatedVariants = product.variants.filter(
            (v) => v.id !== variant.id
          );
          if (updatedVariants.length === 0) {
            return prevSelected.filter((p) => p.id !== productId);
          } else {
            return [
              ...prevSelected.slice(0, productIndex),
              { ...product, variants: updatedVariants },
              ...prevSelected.slice(productIndex + 1),
            ];
          }
        } else {
          return [
            ...prevSelected.slice(0, productIndex),
            { ...product, variants: [...product.variants, variant] },
            ...prevSelected.slice(productIndex + 1),
          ];
        }
      } else {
        return [
          ...prevSelected,
          { id: productId, title: variant.productTitle, variants: [variant] },
        ];
      }
    });
  };

  const closePicker = () => {
    onclosePicker(false);
  };

  const stopOnClose = (event) => {
    event.stopPropagation();
  };

  const addProduct = () => {
    onProductAdd(selectedProducts);
  };

  const lastProductRef = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  return (
    <div className="product-picker__wrap" onClick={closePicker}>
      <div className="picker__card" onClick={stopOnClose}>
        <div className="picker__card-heading">
          <h4>Add products</h4>
          <span className="material-symbols-rounded" onClick={closePicker}>
            close
          </span>
        </div>
        <div className="picker__card-search">
          <div className="picker__card-search__input">
            <label
              htmlFor="pickerSearchInput"
              className="search-icon icon icon-lg material-symbols-rounded"
            >
              search
            </label>
            <input
              type="text"
              placeholder="Search"
              id="pickerSearchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="picker__card-product-list">
          {products.map((product, index) => (
            <div
              key={product.id}
              ref={index === products.length - 1 ? lastProductRef : null}
            >
              <div className="picker__card-product-item">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectedProducts.some((p) => p.id === product.id)}
                  onChange={() => handleProductSelection(product)}
                />
                {product.image.src ? (
                  <img className="product-img" src={product.image.src} alt="" />
                ) : (
                  <span className="product-img icon-lg material-symbols-rounded">
                    image
                  </span>
                )}
                <p>{product.title}</p>
              </div>
              {product.variants?.map((variant) => (
                <div key={variant.id} className="picker__card-product-subitem">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedProducts.some(
                      (p) =>
                        p.id === product.id &&
                        p.variants.some((v) => v.id === variant.id)
                    )}
                    onChange={() =>
                      handleVariantSelection(product.id, {
                        ...variant,
                        productTitle: product.title,
                      })
                    }
                  />
                  <p>{variant.title}</p>
                </div>
              ))}
            </div>
          ))}
          {loading && <div className="spinner"></div>}
        </div>
        <div className="picker__card-bottom-bar">
          <h5>{selectedProducts.length} products selected</h5>
          <div className="picker__card-bottom-bar__btns">
            <button
              className="btn bottom-bar__btn --cancel"
              onClick={closePicker}
            >
              Cancel
            </button>
            <button className="btn bottom-bar__btn --add" onClick={addProduct}>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPicker;
