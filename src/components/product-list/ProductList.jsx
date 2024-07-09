import "./ProductList.css";
import { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  PRODUCT: "product",
  VARIANT: "variant",
};

function DraggableVariant({ variant, index, moveVariant, removeVariant }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.VARIANT,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.VARIANT,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveVariant(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`variant-item ${isDragging ? "dragging" : ""}`}
    >
      <span className="icon icon-xl material-symbols-rounded">
        drag_indicator
      </span>
      <span>{index + 1}.</span>
      <div className="variant-item__name">
        <div className="variant-item__name-text">{variant.title}</div>
      </div>
      <span
        className="variant-item__delete material-symbols-rounded"
        onClick={removeVariant}
      >
        close
      </span>
    </div>
  );
}

function DraggableProduct({
  product,
  index,
  moveProduct,
  editProduct,
  showClose,
  moveVariant,
  removeProduct,
  removeVariant,
}) {
  const [isDiscount, setIsDiscount] = useState(false);
  const [showVariants, setShowVariants] = useState(false);

  const changeIsDiscount = () => {
    setIsDiscount(!isDiscount);
  };

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PRODUCT,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.PRODUCT,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveProduct(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const toggleShowVariants = () => {
    setShowVariants(!showVariants);
  };

  const handleRemoveProduct = (event) => {
    event.stopPropagation();
    removeProduct(index);
  };

  const handleRemoveVariant = (variantIndex) => (event) => {
    event.stopPropagation();
    removeVariant(index, variantIndex);
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`product-item ${isDragging ? "dragging" : ""}`}
    >
      <div className="product-item__main">
        <span className="icon icon-xl material-symbols-rounded">
          drag_indicator
        </span>
        <span>{index + 1}.</span>
        <div className="product-item__name">
          <div className="product-item__name-text">
            {product?.title ? (
              <span>{product?.title}</span>
            ) : (
              <span className="product-item__name-text-placeholder">
                {" "}
                Select product
              </span>
            )}
          </div>
          <div
            className="icon-lg material-symbols-rounded"
            onClick={editProduct}
          >
            edit
          </div>
        </div>
        <div className="product-item__discount">
          {isDiscount ? (
            <>
              <input
                className="product-item__discount-item"
                type="text"
                name="discountAmount"
                id="discountAmount"
                value={product.discount}
              />
              <select
                className="product-item__discount-item"
                name="discountType"
                id="discountType"
              >
                <option value="percent">% off</option>
                <option value="flat">flat off</option>
              </select>
            </>
          ) : (
            <button
              className="product-item__discount-item btn"
              onClick={changeIsDiscount}
            >
              Add Discount
            </button>
          )}
          {showClose && (
            <span
              className="product-item__delete material-symbols-rounded"
              onClick={handleRemoveProduct}
            >
              close
            </span>
          )}
        </div>
      </div>
      {product?.variants && product.variants.length > 1 && (
        <div className="product__variant-btn" onClick={toggleShowVariants}>
          <small>{showVariants ? "Hide variants" : "Show variants"}</small>
          <span className="material-symbols-rounded">
            {showVariants ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          </span>
        </div>
      )}
      {showVariants &&
        product?.variants?.map((variant, v) => (
          <DraggableVariant
            key={`${product.id}-${variant.id}`}
            index={v}
            variant={variant}
            moveVariant={(fromIndex, toIndex) =>
              moveVariant(index, fromIndex, toIndex)
            }
            removeVariant={handleRemoveVariant(v)}
          />
        ))}
    </div>
  );
}

function ProductList({ onEdit, selectedProducts, onProductsChange }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts([{ id: 1 }]);
    console.log("hiii", selectedProducts);
  }, []);

  useEffect(() => {
    if (selectedProducts?.length) {
      setProducts(
        selectedProducts.map((product) => ({
          ...product,
          variants: Array.isArray(product.variants) ? product.variants : [],
        }))
      );
    } else {
      setProducts([{}]);
    }
  }, [selectedProducts]);

  const moveProduct = (fromIndex, toIndex) => {
    const updatedProducts = [...products];
    const [movedProduct] = updatedProducts.splice(fromIndex, 1);
    updatedProducts.splice(toIndex, 0, movedProduct);
    setProducts(updatedProducts);
  };

  const moveVariant = (productIndex, fromIndex, toIndex) => {
    const updatedProducts = [...products];
    const updatedVariants = [...updatedProducts[productIndex].variants];
    const [movedVariant] = updatedVariants.splice(fromIndex, 1);
    updatedVariants.splice(toIndex, 0, movedVariant);
    updatedProducts[productIndex].variants = updatedVariants;
    setProducts(updatedProducts);
  };

  const removeProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    onProductsChange(updatedProducts);
  };

  const removeVariant = (productIndex, variantIndex) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex].variants = updatedProducts[
      productIndex
    ].variants.filter((_, i) => i !== variantIndex);
    setProducts(updatedProducts);
    onProductsChange(updatedProducts);
  };

  const handleEditProduct = (index) => (event) => {
    event.stopPropagation();
    onEdit(index);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="product-list">
        <h4 className="product-list__title">
          Add Bundle Products (Max. 4 Products)
        </h4>
        <small className="product-list__info">
          <span className="icon-lg material-symbols-rounded">error</span>
          Offer Bundle will be shown to the customer whenever any of the bundle
          products are added to the cart.
        </small>

        <div className="product-list__table">
          {products.map((product, i) => (
            <DraggableProduct
              key={i}
              index={i}
              product={product}
              moveProduct={moveProduct}
              editProduct={handleEditProduct(i)}
              showClose={products?.length > 1}
              moveVariant={moveVariant}
              removeProduct={removeProduct}
              removeVariant={removeVariant}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

export default ProductList;
