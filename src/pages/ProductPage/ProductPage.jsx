import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ProductList from "../../components/product-list/ProductList";
import ProductPicker from "../../components/product-picker/ProductPicker";
import "./ProductPage.css";
import { useState } from "react";
function ProductPage() {
  const [showPicker, setShowPicker] = useState(false);
  const [editAt, setEditAt] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const editProduct = (index) => {
    console.log(index);
    setShowPicker(true);
    if (index > 0) {
      setEditAt(index);
    } else {
      setEditAt(0);
    }
    console.log(editAt, "editAt");
  };
  const closePicker = () => {
    setShowPicker(false);
  };

  const MAX_PRODUCTS = 4;

  const addEmptyProduct = () => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.length >= MAX_PRODUCTS) {
        alert(`You can't add more than ${MAX_PRODUCTS} products.`);
        return prevSelected;
      }
      const newSelected = [...prevSelected];
      newSelected.push({});
      return newSelected;
    });
  };

  const addProducts = (products) => {
    console.log(editAt, products, "addddddd");
    setSelectedProducts((prevSelected) => {
      let newSelected;
      if (editAt !== undefined) {
        newSelected = [...prevSelected];
        const remainingSpace = MAX_PRODUCTS - (newSelected.length - 1);
        const productsToAdd = products.slice(0, remainingSpace);
        if (productsToAdd.length < products.length) {
          alert(
            `Only ${productsToAdd.length} product(s) added. Maximum limit of ${MAX_PRODUCTS} products reached.`
          );
        }
        newSelected.splice(editAt, 1, ...productsToAdd);
      } else {
        newSelected = products.slice(0, MAX_PRODUCTS);
        if (newSelected.length < products.length) {
          alert(
            `Only ${newSelected.length} product(s) added. Maximum limit of ${MAX_PRODUCTS} products reached.`
          );
        }
      }
      console.log(newSelected, products, editAt, "selected products");
      return newSelected;
    });
    setShowPicker(false);
  };

  const changeProducts = (products) => {
    setSelectedProducts(products);
  };

  return (
    <div className="product-page">
      <div className="search__bar">
        <div className="search__bar__input">
          <label
            htmlFor="searchInput"
            className="search-icon icon icon-lg material-symbols-rounded"
          >
            search
          </label>
          <input type="text" placeholder="Search" id="searchInput" />
        </div>
      </div>
      <div className="page__heading">
        <div className="page__heading-inner">
          <span className="icon material-symbols-rounded">grid_view</span>
          video-reviews
        </div>
      </div>
      <div className="page__body">
        <div className="body__heading">
          <h3 className="body__heading-text">Offer Funnel</h3>
          <div className="body__heading-links">
            <a className="body__heading-links-item" href="/">
              Support
            </a>
            <a className="body__heading-links-item" href="/">
              Talk to an expert
            </a>
          </div>
        </div>

        <DndProvider backend={HTML5Backend}>
          <ProductList
            onEdit={editProduct}
            selectedProducts={selectedProducts}
            onProductsChange={changeProducts}
          ></ProductList>
        </DndProvider>
        <div className=" add-product-btn" onClick={addEmptyProduct}>
          Add Product
        </div>
        <div className="apply-discount">
          <div className="apply-discount__checkbox">
            <input type="checkbox" id="apply-discount" />
            <label htmlFor="apply-discount">
              Apply discount on compare price
            </label>
            <span className="icon material-symbols-rounded">help</span>
          </div>
          <small>
            Discount will be applied on compare price of the product. Discount
            set inside the upsell should be more than or equal to the discount
            set on the product in your store.
          </small>
        </div>

        <div className="product-page__bottom-bar">
          <button className="btn --hollow product-page__bottom-bar-btn">
            <span className="material-symbols-rounded">chevron_left</span>
            Back
          </button>
          <p>Step 2 of 3: Offer & Discount</p>
          <button className="btn product-page__bottom-bar-btn">
            Next <span className="material-symbols-rounded">chevron_right</span>
          </button>
        </div>
      </div>
      {showPicker && (
        <ProductPicker
          onclosePicker={closePicker}
          onProductAdd={addProducts}
        ></ProductPicker>
      )}
    </div>
  );
}

export default ProductPage;
